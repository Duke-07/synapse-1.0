import { AnalysisResponse, BenchmarksResponse, ChatResponse } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === 'healthy';
  } catch {
    return false;
  }
}

export async function analyzeVoice(
  file: File | Blob,
  anonymous: boolean = false,
  consent: boolean = true
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('audio', file, file instanceof File ? file.name : 'recording.wav');
  formData.append('anonymous', anonymous ? 'true' : 'false');
  formData.append('consent', consent ? 'true' : 'false');

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: 'Analysis failed' }));
    throw new Error(errData.detail || `Server error: ${res.status}`);
  }

  return res.json();
}

export async function getAnalysisResult(id: string): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE}/results/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Analysis record not found');
  }
  return res.json();
}

export async function getBenchmarks(): Promise<BenchmarksResponse> {
  const res = await fetch(`${API_BASE}/benchmarks`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to load benchmarks');
  }
  return res.json();
}

export async function sendChatMessage(
  message: string,
  analysisId?: string
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, analysis_id: analysisId }),
  });

  if (!res.ok) {
    throw new Error('Failed to send message');
  }

  return res.json();
}
