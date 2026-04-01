import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';
import { sendBookingCustomerConfirmation, sendBookingAdminNotification } from '@/lib/email';

/**
 * POST /api/admin/sendBookingConfirmation
 * Admin-only: Send booking confirmation or reschedule email to customer.
 * Body: { data: { ...bookingFields }, email_type: 'confirmation' | 'reschedule' }
 */
export async function POST(request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { data, email_type } = await request.json();

    if (!data?.customer_email) {
      return NextResponse.json(
        { success: false, error: 'Booking data with customer_email is required' },
        { status: 400 }
      );
    }

    const booking = {
      ...data,
      id: data.id || data.booking_id,
    };

    // Send confirmation email to customer
    const result = await sendBookingCustomerConfirmation({
      booking,
      isReschedule: email_type === 'reschedule',
    });

    return NextResponse.json({
      success: true,
      emailSent: result?.success ?? false,
      emailType: email_type || 'confirmation',
    });
  } catch (err) {
    console.error('[Admin] sendBookingConfirmation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
