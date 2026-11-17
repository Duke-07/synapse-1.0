-- ==============================================================================
-- Synapse-Voice Database Schema Migration
-- Compatible with Supabase / PostgreSQL with pgvector
-- Tables: profiles, recordings, analyses, documents, chunks, chat_messages
-- Includes Row Level Security (RLS) policies and vector indexing.
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    consent_given BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Audio Recordings Table
CREATE TABLE IF NOT EXISTS public.recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    duration_seconds NUMERIC(6, 2) NOT NULL,
    sample_rate INTEGER DEFAULT 44100,
    audio_format TEXT DEFAULT 'wav',
    consent BOOLEAN NOT NULL DEFAULT TRUE,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Clinical & Acoustic Analyses Table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recording_id UUID REFERENCES public.recordings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    probability NUMERIC(5, 4) NOT NULL, -- Calibrated posterior probability (0.0 to 1.0)
    label INTEGER NOT NULL,             -- 0 = Healthy Control, 1 = Parkinson's screening risk
    confidence_band TEXT NOT NULL,      -- 'Low Risk', 'Moderate Concern', 'Elevated Risk'
    features JSONB NOT NULL,            -- 22 extracted acoustic biomarkers
    shap_values JSONB NOT NULL,         -- Feature attribution values
    top_biomarkers JSONB NOT NULL,      -- Top 3 contributing features
    explanation TEXT NOT NULL,          -- RAG-synthesized plain language report
    literature_citations JSONB DEFAULT '[]'::JSONB,
    model_version TEXT NOT NULL DEFAULT 'v1.0.0-mlp-fs12',
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Research Literature Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    year INTEGER NOT NULL,
    venue TEXT NOT NULL,
    doi TEXT,
    url TEXT,
    abstract TEXT,
    dataset_used TEXT,
    reported_metric TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Document Chunks with Vector Embeddings (1536-dim or 768-dim)
CREATE TABLE IF NOT EXISTS public.chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL,
    embedding vector(768), -- Default to 768-dim embeddings (Gemini text-embedding-004)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cosine similarity index on chunks
CREATE INDEX IF NOT EXISTS chunks_embedding_hnsw_idx 
ON public.chunks USING hnsw (embedding vector_cosine_ops);

-- 7. Interactive Follow-up Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: Users manage only their own profile
CREATE POLICY "Users view own profile" 
ON public.profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Recordings: Authenticated users manage their recordings; anonymous inserts allowed
CREATE POLICY "Users view own recordings" 
ON public.recordings FOR SELECT USING (auth.uid() = user_id OR is_anonymous = TRUE);

CREATE POLICY "Users insert recordings" 
ON public.recordings FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Analyses: Users view own analyses or anonymous analyses by ID
CREATE POLICY "Users view own analyses" 
ON public.analyses FOR SELECT USING (auth.uid() = user_id OR is_anonymous = TRUE);

CREATE POLICY "Insert analyses" 
ON public.analyses FOR INSERT WITH CHECK (TRUE);

-- Research Literature: Public read access
CREATE POLICY "Public read documents" 
ON public.documents FOR SELECT USING (TRUE);

CREATE POLICY "Public read chunks" 
ON public.chunks FOR SELECT USING (TRUE);

-- Chat Messages: Users view messages tied to their analyses
CREATE POLICY "Users view own chat messages" 
ON public.chat_messages FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Insert chat messages" 
ON public.chat_messages FOR INSERT WITH CHECK (TRUE);

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION (Supabase Storage)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('voice-recordings', 'voice-recordings', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Users can upload and access their own files
CREATE POLICY "Users upload voice recordings" 
ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'voice-recordings' AND (auth.uid() = owner OR auth.uid() IS NULL)
);

CREATE POLICY "Users view own voice recordings" 
ON storage.objects FOR SELECT USING (
    bucket_id = 'voice-recordings' AND (auth.uid() = owner OR auth.uid() IS NULL)
);
