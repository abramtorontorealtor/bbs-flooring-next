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
 */
export function createBookingNotifier({ email, telegram = null, logger = console } = {}) {
  if (!email) throw new Error('createBookingNotifier: email senders are required');

  async function run(label, fn) {
    try {
      const value = await fn();
      if (!value?.success) logger.warn?.(`[booking-notify] ${label} not sent:`, value?.error || value?.reason || 'no success flag');
      return !!value?.success;
    } catch (err) {
      logger.error?.(`[booking-notify] ${label} failed:`, err?.message || err);
      return false;
    }
  }

  async function alertTelegram(booking) {
    if (!telegram?.sendTelegramAlert || !telegram?.formatBookingAlert) return null;
    // Awaited: a fire-and-forget promise gets killed when the serverless fn returns.
    return run('telegram alert', () => telegram.sendTelegramAlert(telegram.formatBookingAlert(booking)));
  }

  return async function notify(type, { booking, actor, reason, oldDate, oldTime } = {}) {
    const byCustomer = actor !== 'admin';
    switch (type) {
      case 'created': {
        const [customerEmailSent, adminEmailSent] = await Promise.all([
          run('request-received email', () => email.sendBookingRequestReceived({ booking, actor })),
          run('admin notification', () => email.sendBookingAdminNotification({ booking, actor })),
        ]);
        const telegramSent = await alertTelegram(booking);
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
