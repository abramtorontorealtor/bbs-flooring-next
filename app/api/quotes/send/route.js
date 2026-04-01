import { NextResponse } from 'next/server';
import { sendQuoteToCustomer, sendQuoteAdminNotification } from '@/lib/email';

export async function POST(request) {
  try {
    const { quote, is_member } = await request.json();

    if (!quote?.customer_email) {
      return NextResponse.json(
        { success: false, error: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Send emails in parallel (non-blocking)
    const results = await Promise.allSettled([
      sendQuoteToCustomer({ quote, isMember: is_member }),
      sendQuoteAdminNotification({ quote, isMember: is_member }),
    ]);

    const customerResult = results[0];
    const customerSent = customerResult.status === 'fulfilled' && customerResult.value?.success;

    if (!customerSent) {
      console.warn('[Quote] Customer email failed:', customerResult.reason || customerResult.value);
    }

    return NextResponse.json({ success: true, emailSent: customerSent });
  } catch (error) {
    console.error('Quote email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
