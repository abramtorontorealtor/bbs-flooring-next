import { NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase';
import {
  sendContactAdminNotification,
  sendContactCustomerConfirmation,
  sendRemovalEstimateCustomerConfirmation,
  sendRemovalEstimateAdminNotification,
} from '@/lib/email';
import { sendTelegramAlert, formatContactAlert } from '@/lib/telegram';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { detectSpamLead } from '@/lib/spam-filter';
import { getVisitorIdFromRequest, identifyVisitor } from '@/lib/identify';
import { handleContact } from '@/lib/contact/contact-handler';

/** Contact form submissions (incl. B4 measurement_alternate_time). Logic: lib/contact/contact-handler.js */
export async function POST(request) {
  const r = await handleContact(request, {
    getSupabase: getSupabaseAdminClient,
    checkRateLimit, getClientIP, detectSpamLead, getVisitorIdFromRequest, identifyVisitor,
    email: { sendContactAdminNotification, sendContactCustomerConfirmation, sendRemovalEstimateCustomerConfirmation, sendRemovalEstimateAdminNotification },
    sendTelegramAlert, formatContactAlert, logger: console,
  });
  return NextResponse.json(r.body, { status: r.status, ...(r.headers && { headers: r.headers }) });
}
