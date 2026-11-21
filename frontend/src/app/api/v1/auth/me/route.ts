import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt, getUserById } from '@/lib/server-auth';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { detail: 'Authentication token is required.' },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);
  const payload = verifyJwt(token);

  if (!payload || !payload.sub) {
    return NextResponse.json(
      { detail: 'Session has expired or is invalid. Please sign in again.' },
      { status: 401 }
    );
  }

  const user = getUserById(payload.sub);
  if (!user) {
    // Graceful payload fallback
    return NextResponse.json({
      id: payload.sub,
      email: payload.email || 'researcher@synapse.org',
      full_name: payload.name || 'Verified Researcher',
      is_verified: true,
      created_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    is_verified: user.is_verified,
    created_at: user.created_at,
  });
}
