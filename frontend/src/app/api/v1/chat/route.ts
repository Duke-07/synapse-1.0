import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/server-ml';
import { generateParkinsonsAssistantReply } from '@/lib/parkinsons-knowledge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, analysis_id } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ detail: 'Message cannot be empty.' }, { status: 400 });
    }

    let contextData = undefined;
    if (analysis_id) {
      const rec = getAnalysisById(analysis_id);
      if (rec) {
        contextData = {
          probability: rec.probability,
          confidenceBand: rec.confidence_band,
          topBiomarkers: rec.top_biomarkers?.map((b: any) => ({
            label: b.label || b.feature,
            value: b.value,
          })),
        };
      }
    }

    const { reply, citations, suggestedQuestions } = generateParkinsonsAssistantReply(
      message,
      contextData
    );

    return NextResponse.json({
      reply,
      citations,
      suggestedQuestions,
      analysis_id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || 'Chat assistant temporarily unavailable.' },
      { status: 500 }
    );
  }
}
