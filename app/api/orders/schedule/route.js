import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';
import { sendScheduleNotification } from '@/lib/email';

// Admin sets a delivery or pickup date → emails the customer
export async function POST(request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { orderId, scheduledDate, scheduledNote } = await request.json();

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

    // Email the customer
    try {
      await sendScheduleNotification({ order });
    } catch (emailErr) {
      console.error('[Schedule] Email failed (date still saved):', emailErr);
      return NextResponse.json({ success: true, emailSent: false, order });
    }

    return NextResponse.json({ success: true, emailSent: true, order });
  } catch (error) {
    console.error('Schedule error:', error);
    return NextResponse.json({ error: error.message || 'Failed to schedule' }, { status: 500 });
  }
}
