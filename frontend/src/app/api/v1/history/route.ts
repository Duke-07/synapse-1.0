import { NextRequest, NextResponse } from 'next/server';
import { getAllAnalyses } from '@/lib/server-ml';
import { verifyJwt } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  let userId: string | undefined = undefined;
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const payload = verifyJwt(authHeader.substring(7));
    if (payload?.sub) {
      userId = payload.sub;
    }
  }

  const list = getAllAnalyses(userId);
  return NextResponse.json(list);
}
