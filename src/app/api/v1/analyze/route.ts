import { NextRequest, NextResponse } from 'next/server';
import { analyzeAudioBuffer } from '@/lib/server-ml';
import { verifyJwt } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const anonymous = formData.get('anonymous') === 'true';
    const consent = formData.get('consent') !== 'false';

    if (!consent) {
      return NextResponse.json(
        { detail: 'Explicit consent is required to analyze audio for screening.' },
        { status: 400 }
      );
    }

    if (!audioFile) {
      return NextResponse.json(
        { detail: 'No audio recording received. Please upload or record a sustained vowel.' },
        { status: 400 }
      );
    }

    // Optional user authentication via Bearer token
    let userId: string | undefined = undefined;
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const payload = verifyJwt(authHeader.substring(7));
      if (payload?.sub) {
        userId = payload.sub;
      }
    }

    // Read audio buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. If Python FastAPI backend is active at port 8000, attempt forwarding with 3.5s timeout
    const pythonBackendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000/api/v1';
    try {
      const pyFormData = new FormData();
      const audioBlob = new Blob([buffer], { type: audioFile.type || 'audio/wav' });
      pyFormData.append('audio', audioBlob, audioFile.name || 'recording.wav');
      pyFormData.append('anonymous', anonymous ? 'true' : 'false');
      pyFormData.append('consent', consent ? 'true' : 'false');

      const pyHeaders: Record<string, string> = {};
      if (authHeader) pyHeaders['authorization'] = authHeader;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const pyRes = await fetch(`${pythonBackendUrl}/analyze`, {
        method: 'POST',
        headers: pyHeaders,
        body: pyFormData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (pyRes.ok) {
        const pyData = await pyRes.json();
        return NextResponse.json(pyData);
      }
    } catch {
      // Python backend unreachable, timed out, or unstarted; proceed with native engine
    }

    // 2. High-precision native TypeScript acoustic signal processing & inference engine
    const result = await analyzeAudioBuffer(buffer, {
      anonymous,
      consent,
      userId,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[API Analyze Error]:', err);
    return NextResponse.json(
      { detail: err.message || 'Acoustic analysis failed. Please provide a clear recording.' },
      { status: 422 }
    );
  }
}
