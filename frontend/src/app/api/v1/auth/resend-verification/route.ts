import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail, generateVerificationCode } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { detail: 'Email address is required.' },
        { status: 400 }
      );
    }

    const user = getUserByEmail(email);
    const code = generateVerificationCode();
    if (user) {
      user.verification_code = code;
    }

    return NextResponse.json({
      success: true,
      message: 'A fresh 6-digit verification code has been dispatched to your email address.',
      detail: `Verification code dispatched to ${email}.`,
      verification_code_preview: code,
    });
  } catch (err: any) {
    return NextResponse.json(
      { detail: err.message || 'Failed to resend verification code.' },
      { status: 400 }
    );
  }
}
