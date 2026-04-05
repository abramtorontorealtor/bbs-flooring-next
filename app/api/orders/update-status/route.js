import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { sendOrderStatusUpdate } from '@/lib/email';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Server-side order status update with email notifications.
 * Admin-only — requires authenticated admin session.
 */
export async function POST(request) {
  try {
    // Auth check — admin only
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { cookies: { getAll() { return cookieStore.getAll(); } } }
    );
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const adminClient = getSupabaseAdminClient();
    const { data: profile } = await adminClient
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { orderId, newStatus } = await request.json();

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Missing orderId or newStatus' }, { status: 400 });
    }

    const validStatuses = [
      'pending_payment', 'awaiting_payment', 'pending', 'confirmed', 'paid',
      'processing', 'shipped', 'delivered', 'cancelled', 'abandoned',
      'quote_requested', 'refunded',
    ];

    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const oldStatus = order.status;

    // Update the order status
    const updates = { status: newStatus };

    // Auto-set payment_status for certain transitions
    if (newStatus === 'cancelled') {
      updates.payment_status = order.payment_status === 'authorized' ? 'cancelled' : order.payment_status;
    }

    // Record delivery timestamp for review follow-up scheduling
    if (newStatus === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (updateError) throw updateError;

    // Send email notification for meaningful transitions
    // "processing" (Preparing) is silent — only update account page, no customer email
    // "shipped" (Ready for Pickup / Shipped) is the BOSS — sends the full customer notification
    const emailTransitions = ['shipped', 'delivered'];
    if (emailTransitions.includes(newStatus) && order.customer_email) {
      // Re-fetch order to get latest pickup_address, scheduled_date, etc.
      const { data: freshOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      try {
        await sendOrderStatusUpdate({
          order: { ...(freshOrder || order), status: newStatus },
          oldStatus,
        });
      } catch (emailErr) {
        console.error('[UpdateStatus] Email send error (non-fatal):', emailErr);
      }
    }

    return NextResponse.json({ success: true, oldStatus, newStatus });
  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update status' }, { status: 500 });
  }
}
