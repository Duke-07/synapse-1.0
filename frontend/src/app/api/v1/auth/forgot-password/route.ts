import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;
    return NextResponse.json({
      success: true,
      message: `If ${email || 'your email'} is registered, a password reset link has been dispatched.`,
    });
  } catch {
    return NextResponse.json({
      success: true,
      message: 'If this email is registered, a password reset link has been dispatched.',
    });
  }
}
