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

    // Run acoustic analysis & calibrated inference
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
