import { NextResponse } from 'next/server';

// Quote email sender
// TODO: Wire to SendGrid when ready
export async function POST(request) {
  try {
    const { quote, is_member } = await request.json();
    
    // TODO: Send quote breakdown email to customer
    // TODO: Send admin notification email
    console.log('Quote email requested:', { customerEmail: quote?.customer_email, is_member });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quote email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
