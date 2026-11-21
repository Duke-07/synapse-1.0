import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/server-ml';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, analysis_id } = body;

    if (!message) {
      return NextResponse.json({ detail: 'Message cannot be empty.' }, { status: 400 });
    }

    let contextualNote = '';
    if (analysis_id) {
      const rec = getAnalysisById(analysis_id);
      if (rec) {
        contextualNote = ` For this screening (Score: ${(rec.probability * 100).toFixed(0)}%, Band: ${rec.confidence_band}, Top Driver: ${rec.top_biomarkers[0]?.label || 'PPE'}), the acoustic parameters reflect measured phonatory stability.`;
      }
    }

    const reply =
      `Regarding your inquiry: In voice biomarker research for Parkinson's disease, acoustic perturbation ` +
      `metrics (Pitch Period Entropy, Shimmer, and Jitter) detect subtle neuromuscular microtremors in vocal fold adduction.${contextualNote} ` +
      `Note that acute respiratory conditions, vocal fatigue, and ambient recording noise can also alter these acoustic indices. ` +
      `Synapse-Voice serves strictly as an investigative screening aid and academic project. Definitive clinical evaluation must be performed by a certified neurologist.`;

    const citations = [
      {
        title: 'Suitability of Dysphonia Measurements for Telemonitoring of Parkinson\'s Disease',
        authors: 'Little, M. A., et al.',
        year: 2009,
        journal: 'IEEE TBME',
        doi: '10.1109/TBME.2008.2005954',
      },
      {
        title: 'Novel Speech Signal Processing Algorithms for Parkinson\'s Disease Telemonitoring',
        authors: 'Tsanas, A., et al.',
        year: 2012,
        journal: 'IEEE TBME',
        doi: '10.1109/TBME.2012.2183000',
      },
    ];

    return NextResponse.json({
      reply,
      citations,
      analysis_id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || 'Chat assistant temporarily unavailable.' },
      { status: 500 }
    );
  }
}
