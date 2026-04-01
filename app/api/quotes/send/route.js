import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
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

    // Persist quote to database
    const supabase = getSupabaseAdminClient();
    const { data: savedQuote, error: dbError } = await supabase
      .from('quotes')
      .insert({
        customer_name: quote.customer_name || quote.name,
        customer_email: quote.customer_email || quote.email,
        customer_phone: quote.customer_phone || quote.phone,
        customer_address: quote.customer_address || quote.address,
        preferred_date: quote.preferred_date,
        preferred_time: quote.preferred_time,
        notes: quote.notes,
        product_name: quote.product_name,
        square_footage: quote.square_footage || quote.sqft,
        price_per_sqft: quote.price_per_sqft,
        is_member: is_member || false,
        removal_type: quote.removal_type,
        needs_baseboards: quote.needs_baseboards,
        needs_shoe_moulding: quote.needs_shoe_moulding,
        flooring_cost: quote.flooring_cost,
        installation_cost: quote.installation_cost,
        removal_cost: quote.removal_cost,
        baseboard_cost: quote.baseboard_cost,
        shoe_moulding_cost: quote.shoe_moulding_cost,
        delivery_cost: quote.delivery_cost,
        subtotal: quote.subtotal,
        tax: quote.tax,
        total: quote.total,
        status: 'sent',
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Quote] DB insert failed:', dbError);
      // Don't fail — still send emails
    }

    const emailQuote = savedQuote || quote;

    // Send emails in parallel (non-blocking)
    const results = await Promise.allSettled([
      sendQuoteToCustomer({ quote: emailQuote, isMember: is_member }),
      sendQuoteAdminNotification({ quote: emailQuote, isMember: is_member }),
    ]);

    const customerResult = results[0];
    const customerSent = customerResult.status === 'fulfilled' && customerResult.value?.success;

    if (!customerSent) {
      console.warn('[Quote] Customer email failed:', customerResult.reason || customerResult.value);
    }

    return NextResponse.json({
      success: true,
      emailSent: customerSent,
      quoteId: savedQuote?.id || null,
    });
  } catch (error) {
    console.error('Quote email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
