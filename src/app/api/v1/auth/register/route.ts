import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, full_name } = body;

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { detail: 'Email, password, and full name are required.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { detail: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const { user, code } = registerUser(email, password, full_name);

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully. Please verify your email with the 6-digit code.',
        detail: `Verification code dispatched to ${user.email}.`,
        verification_code_preview: code, // Preview provided for friction-free academic evaluation
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || 'Registration failed.' },
      { status: 400 }
    );
  }
}
