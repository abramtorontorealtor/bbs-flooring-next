import { NextResponse } from 'next/server';

// Welcome email sender (idempotent — checks flag before sending)
// TODO: Wire to SendGrid when ready
export async function POST() {
  try {
    // TODO: Check user's welcome_email_sent flag
    // TODO: Send welcome email + admin notification via SendGrid
    // TODO: Set welcome_email_sent = true
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Welcome email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
