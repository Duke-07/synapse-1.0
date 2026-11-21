import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, signJwt } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { detail: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const user = authenticateUser(email, password);
    const token = signJwt({ sub: user.id, email: user.email, name: user.full_name });

    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      expires_in_sec: 604800,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_verified: user.is_verified,
        created_at: user.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || 'Invalid email or password.' },
      { status: 401 }
    );
  }
}
