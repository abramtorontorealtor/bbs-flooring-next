import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendQuoteToCustomer, sendQuoteAdminNotification } from '@/lib/email';
import { sendTelegramAlert, formatQuoteAlert } from '@/lib/telegram';

export async function POST(request) {
  try {
    const { quote, is_member } = await request.json();

    if (!quote?.customer_email) {
      return NextResponse.json(
        { success: false, error: 'Customer email is required' },
        { status: 400 }
      );
    }

    // Generate a resume token so the customer can view/resume this quote via email link
    const resumeToken = randomUUID();

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
        resume_token: resumeToken,
        status: 'sent',
        // Stair-specific fields
        stair_tread_count: quote.stair_tread_count || null,
        stair_pie_count: quote.stair_pie_count || null,
        stair_refinish: quote.stair_refinish || false,
        stair_posts: quote.stair_posts || null,
        stair_pickets: quote.stair_pickets || null,
        stair_stringers: quote.stair_stringers || null,
        stair_nosing: quote.stair_nosing || null,
        stair_railing: quote.stair_railing || null,
        stair_landing: quote.stair_landing || null,
        stair_species: quote.stair_species || null,
        stair_total: quote.total && !quote.flooring_cost ? quote.total : (quote.stair_total || null),
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

    // Fire Telegram alert immediately (non-blocking)
    sendTelegramAlert(formatQuoteAlert(emailQuote)).catch(() => {});

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
