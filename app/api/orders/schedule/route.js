import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendScheduleNotification } from '@/lib/email';
import { requireAdmin } from '@/lib/api-auth';

// Admin sets a delivery or pickup date.
// Pass sendConfirmation=true to email the customer (used by the combined pickup button).
export async function POST(request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { orderId, scheduledDate, scheduledNote, sendConfirmation } = await request.json();

    if (!orderId || !scheduledDate) {
      return NextResponse.json({ error: 'Missing orderId or scheduledDate' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        scheduled_date: scheduledDate,
        scheduled_note: scheduledNote || null,
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Send pickup/delivery confirmation email if requested
    let emailSent = false;
    if (sendConfirmation && order.customer_email) {
      try {
        await sendScheduleNotification({ order });
        emailSent = true;
      } catch (emailErr) {
        console.error('[Schedule] Email send error (non-fatal):', emailErr);
      }
    }

    return NextResponse.json({ success: true, order, emailSent });
  } catch (error) {
    console.error('Schedule error:', error);
    return NextResponse.json({ error: error.message || 'Failed to schedule' }, { status: 500 });
  }
}
