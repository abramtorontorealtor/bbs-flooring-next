import { NextResponse } from 'next/server';

// Booking confirmation email sender
// TODO: Wire to SendGrid when ready
export async function POST(request) {
  try {
    const { booking } = await request.json();
    
    // TODO: Send booking confirmation to customer + admin notification
    console.log('Booking confirmation requested:', { customerEmail: booking?.customer_email, date: booking?.preferred_date });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking confirmation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
