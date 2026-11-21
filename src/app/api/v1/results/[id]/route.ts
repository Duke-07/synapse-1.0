import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '@/lib/server-ml';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  if (!id) {
    return NextResponse.json({ detail: 'Analysis ID is required.' }, { status: 400 });
  }

  const analysis = getAnalysisById(id);
  if (!analysis) {
    return NextResponse.json(
      { detail: 'Screening record not found.' },
      { status: 404 }
    );
  }

  return NextResponse.json(analysis);
}
