/**
 * Notification adapter for the booking lifecycle (Phase A, slice A3).
 *
 * Maps lifecycle notify(type, payload) → the EXISTING lib/email.js senders and
 * Telegram alert, with exactly the templates/recipients the routes used before
 * A3 (no new emails):
 *
 *   created                → sendBookingRequestReceived (customer)
 *                            + sendBookingAdminNotification (admin) + Telegram booking alert
 *   confirmed              → sendBookingCustomerConfirmation (customer)
 *   rescheduled  customer  → sendBookingRescheduled (customer)
 *                            + sendBookingAdminNotification({ isReschedule }) (admin)
 *   rescheduled  admin     → sendBookingRescheduled (customer)
 *   cancelled    customer  → sendBookingCancelled({ cancelledByCustomer:true }) (customer)
 *                            + sendBookingAdminNotification({ isCancellation }) (admin)
 *   cancelled    admin     → sendBookingCancelled (customer)
 *
 * `actor` is passed through to the senders (ignored by today's templates;
 * A4 uses it for pending-aware reschedule copy).
 *
 * Never throws for a failed send — resolves { customerEmailSent, adminEmailSent, telegramSent }.
 * Senders are injected so tests use fakes (lib/email.js is not importable
 * under plain node:test — extensionless relative imports).
 *
 * Fix R1: every send is bounded by `senderMs` (default 2 s, env
 * BOOKING_TIMEOUT_SENDER_MS). A sender that never settles counts as not sent
 * and cannot block the others or the response. The Telegram alert starts in
 * parallel with the emails, so the created path stays within one sender budget.
 *
 * Lead-context enrichment (Oct 30 2026): on `created`, an optional injected
 * `leadContext(booking, extra)` (lib/leadContext.js) runs under `contextMs` in
 * parallel with the customer email; the admin email + Telegram alert wait for it
 * and append what it found. Any failure/timeout → null → the alert sends as before.
 */
import { resolveBookingTimeouts, withDeadline } from './deadline.js';

export function createBookingNotifier({ email, telegram = null, leadContext = null, logger = console, timeouts = {} } = {}) {
  if (!email) throw new Error('createBookingNotifier: email senders are required');
  const { senderMs, contextMs } = resolveBookingTimeouts(timeouts);

  async function buildContext(booking, extra) {
    if (typeof leadContext !== 'function') return null;
    try {
      return await withDeadline(() => leadContext(booking, extra), contextMs, 'lead context');
    } catch (err) {
      logger.warn?.('[booking-notify] lead context skipped:', err?.message || err);
      return null;
    }
  }

  async function run(label, fn) {
    try {
      const value = await withDeadline(fn, senderMs, label);
      if (!value?.success) logger.warn?.(`[booking-notify] ${label} not sent:`, value?.error || value?.reason || 'no success flag');
      return !!value?.success;
    } catch (err) {
      logger.error?.(`[booking-notify] ${label} failed:`, err?.message || err);
      return false;
    }
  }

  async function alertTelegram(booking, context = null) {
    if (!telegram?.sendTelegramAlert || !telegram?.formatBookingAlert) return null;
    // Awaited: a fire-and-forget promise gets killed when the serverless fn returns.
    return run('telegram alert', () => telegram.sendTelegramAlert(telegram.formatBookingAlert(booking, context)));
  }

  return async function notify(type, { booking, actor, reason, oldDate, oldTime, session_id, visitor_id } = {}) {
    const byCustomer = actor !== 'admin';
    switch (type) {
      case 'created': {
        // All three in parallel, each bounded, all awaited (none detached). The admin email and
        // the Telegram alert first wait (≤ contextMs) for the lead context.
        const ctxP = buildContext(booking, { session_id, visitor_id });
        const [customerEmailSent, adminEmailSent, telegramSent] = await Promise.all([
          run('request-received email', () => email.sendBookingRequestReceived({ booking, actor })),
          ctxP.then((leadContext) => run('admin notification', () => email.sendBookingAdminNotification({ booking, actor, leadContext }))),
          ctxP.then((leadContext) => alertTelegram(booking, leadContext)),
        ]);
        return { customerEmailSent, adminEmailSent, telegramSent };
      }
      case 'confirmed': {
        const customerEmailSent = await run('confirmation email', () =>
          email.sendBookingCustomerConfirmation({ booking, actor }));
        return { customerEmailSent, adminEmailSent: null, telegramSent: null };
      }
      case 'rescheduled': {
        const tasks = [run('rescheduled email', () =>
          email.sendBookingRescheduled({ booking, oldDate, oldTime, actor }))];
        if (byCustomer) {
          tasks.push(run('admin reschedule notification', () =>
            email.sendBookingAdminNotification({ booking, isReschedule: true, actor })));
        }
        const [customerEmailSent, adminEmailSent = null] = await Promise.all(tasks);
        return { customerEmailSent, adminEmailSent, telegramSent: null };
      }
      case 'cancelled': {
        const tasks = [run('cancellation email', () => email.sendBookingCancelled(
          byCustomer
            ? { booking, reason, cancelledByCustomer: true, actor }
            : { booking, reason, actor },
        ))];
        if (byCustomer) {
          tasks.push(run('admin cancellation notification', () =>
            email.sendBookingAdminNotification({ booking, isCancellation: true, actor })));
        }
        const [customerEmailSent, adminEmailSent = null] = await Promise.all(tasks);
        return { customerEmailSent, adminEmailSent, telegramSent: null };
      }
      default:
        logger.warn?.(`[booking-notify] unknown notification type: ${type}`);
        return { customerEmailSent: false, adminEmailSent: null, telegramSent: null, skipped: true };
    }
  };
}

/** Pull the customer-email flag out of a lifecycle result's notifications. */
export function customerEmailSent(result, type) {
  const n = (result?.notifications || []).find((x) => !type || x.type === type);
  return !!(n?.ok && n.result?.customerEmailSent);
}
