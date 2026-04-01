import { NextResponse } from 'next/server';
import { sendBookingCustomerConfirmation, sendBookingAdminNotification } from '@/lib/email';

export async function POST(request) {
  try {
    const { booking } = await request.json();

    if (!booking?.customer_email) {
      return NextResponse.json(
        { success: false, error: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Send emails in parallel (non-blocking)
    const results = await Promise.allSettled([
      sendBookingCustomerConfirmation({ booking }),
      sendBookingAdminNotification({ booking }),
    ]);

    const customerResult = results[0];
    const customerSent = customerResult.status === 'fulfilled' && customerResult.value?.success;

    if (!customerSent) {
      console.warn('[Booking] Customer email failed:', customerResult.reason || customerResult.value);
    }

    return NextResponse.json({ success: true, emailSent: customerSent });
  } catch (error) {
    console.error('Booking confirmation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
