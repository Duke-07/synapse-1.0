export interface BiomarkerAttribution {
  feature: string;
  value: number;
  shap_value: number;
  ref_min: number;
  ref_max: number;
  unit: string;
  label: string;
}

export interface CitationItem {
  title: string;
  authors: string;
  year: number;
  doi?: string;
  similarity: number;
}

export interface AnalysisResponse {
  id: string;
  probability: number;
  label: number;
  confidence_band: 'Low Risk' | 'Moderate Concern' | 'Elevated Risk';
  features: Record<string, number>;
  shap_values: Record<string, number>;
  top_biomarkers: BiomarkerAttribution[];
  explanation: string;
  literature_citations: CitationItem[];
  model_version: string;
  audio_quality?: Record<string, any>;
  disclaimer: string;
  created_at: string;
}

export interface PaperItem {
  year: number;
  authors: string;
  title: string;
  venue: string;
  doi: string;
  approach: string;
  dataset: string;
  metric: string;
  protocol: string;
  leakage: string;
}

export interface BenchmarkItem {
  work: string;
  reported_metric: string;
  reproduced_own: string;
  reproduced_grouped: string;
  diff_pct: number;
  leakage_risk: string;
  notes: string;
}

export interface BenchmarksResponse {
  literature_papers: PaperItem[];
  reproduced_works: BenchmarkItem[];
  model_summary: Record<string, any>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  reply: string;
  citations: any[];
  analysis_id?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_verified: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in_sec: number;
  user: UserProfile;
}

export interface AuthMessage {
  success: boolean;
  message: string;
  detail?: string;
  verification_code_preview?: string;
}
