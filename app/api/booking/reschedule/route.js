import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';

// Legacy admin reschedule route — kept for backward compat.
// Prefer /api/booking/admin-action with action='reschedule' instead.
export async function POST(request) {
  try {
    const { error: authError } = await requireAdmin();
    if (authError) return authError;

    const { bookingId, preferred_date, preferred_time } = await request.json();

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Missing bookingId' }, { status: 400 });
    }
    if (!preferred_date) {
      return NextResponse.json({ success: false, error: 'Missing preferred_date' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        preferred_date,
        preferred_time: preferred_time || null,
        status: 'confirmed',
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Booking reschedule error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to reschedule booking' },
      { status: 500 }
    );
  }
}
