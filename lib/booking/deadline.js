/**
 * Deadlines for booking side effects (Phase A fix R1).
 *
 * Once a booking's DB write commits, the request must ALWAYS answer, even when
 * Google, Brevo, Telegram or the identity upsert accept a connection and never
 * reply. Catching exceptions is not enough when a promise never settles, so every
 * optional step is raced against a timer here. Nothing relies on a detached
 * promise: on timeout the optional `controller` is aborted, so work that honours
 * the signal (the Google helpers) stops instead of lingering.
 *
 * Budgets (ms). Defaults keep the worst case about 9 s, under a 10 s function
 * limit: sync 4.5 + record 1 + notify 2.5 + identify 1. Each value can be
 * overridden with an env var (BOOKING_TIMEOUT_<KEY>_MS) or an explicit option.
 *   syncMs     total calendar reconciliation per operation (all passes, all Google calls)
 *   recordMs   durably writing "sync failed/timed out" after the sync budget ran out
 *   notifyMs   one lifecycle notification (all of its sends together, which run in parallel)
 *   senderMs   one email / Telegram send inside the notifier
 *   identifyMs optional visitor identification after a booking is created
 * Per-Google-call bounds live in lib/google-calendar.js (GOOGLE_CALENDAR_TIMEOUT_MS, default 4000);
 * the sync budget caps the total across token + calendar calls.
 */
export const DEFAULT_BOOKING_TIMEOUTS = Object.freeze({
  syncMs: 4500,
  recordMs: 1000,
  notifyMs: 2500,
  senderMs: 2000,
  identifyMs: 1000,
});

const ENV_KEYS = Object.freeze({
  syncMs: 'BOOKING_TIMEOUT_SYNC_MS',
  recordMs: 'BOOKING_TIMEOUT_RECORD_MS',
  notifyMs: 'BOOKING_TIMEOUT_NOTIFY_MS',
  senderMs: 'BOOKING_TIMEOUT_SENDER_MS',
  identifyMs: 'BOOKING_TIMEOUT_IDENTIFY_MS',
});

const positive = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** Precedence: explicit override, then env, then default. Invalid or non-positive values are ignored. */
export function resolveBookingTimeouts(overrides = {}, env = (typeof process !== 'undefined' ? process.env : {}) || {}) {
  const out = {};
  for (const [key, def] of Object.entries(DEFAULT_BOOKING_TIMEOUTS)) {
    out[key] = positive(overrides?.[key]) ?? positive(env?.[ENV_KEYS[key]]) ?? def;
  }
  return out;
}

export class DeadlineError extends Error {
  constructor(label, ms) {
    super(`${label} timed out after ${ms}ms`);
    this.name = 'DeadlineError';
    this.code = 'ETIMEDOUT';
    this.timedOut = true;
    this.ms = ms;
  }
}

export const isDeadlineError = (err) => !!err && (err.timedOut === true || err.name === 'DeadlineError');

/**
 * Resolve with `work`'s value, or reject with DeadlineError after `ms`.
 * `work` is a promise or a function returning one. A synchronous throw becomes a rejection.
 * On timeout `controller.abort(err)` runs first, if a controller was given.
 * A late rejection from `work` is handled (Promise.race subscribes to it), so it cannot
 * become an unhandled rejection. The timer is cleared as soon as either side settles.
 */
export function withDeadline(work, ms, label = 'operation', { controller = null } = {}) {
  const p = Promise.resolve().then(() => (typeof work === 'function' ? work() : work));
  const limit = positive(ms);
  if (!limit) return p;
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new DeadlineError(label, limit);
      try { controller?.abort(err); } catch { /* ignore */ }
      reject(err);
    }, limit);
  });
  return Promise.race([p, timeout]).finally(() => clearTimeout(timer));
}
