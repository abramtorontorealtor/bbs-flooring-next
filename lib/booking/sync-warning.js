/**
 * CRM calendar-sync warning state (Phase A, A4; boss decision 9(1)).
 * Pure + client-safe (no imports) — used by components/admin/AdminCRMClient.jsx.
 *
 *   failed            → { level:'failed' }  red badge + "Retry calendar sync"
 *   pending | unknown → { level:'pending' } quiet amber note (live bookings only)
 *   synced | absent   → null                nothing shown
 *
 * `last` = calendarSync from this session's most recent admin-action response,
 * stamped { receivedAt, revision }. It wins ONLY while it is newer than the listed
 * row (freshLastSync, fix R19).
 * Missing column (pre-migration) = 'unknown'.
 *
 * Boss decision 10(2): the amber pending/unknown note shows ONLY when the server
 * store mode is 'full', meaning the migration is applied and pinned. In
 * auto/legacy mode every row looks 'unknown', and constant amber noise trains
 * admins to ignore real warnings. The red 'failed' badge is never hidden.
 * `opts.storeMode` comes from the server (app/admin/crm/page.jsx →
 * resolveStoreMode(process.env)); anything else counts as not full.
 */
const LIVE = ['pending', 'confirmed', 'new'];

export function cleanSyncError(err) {
  if (!err) return '';
  return String(err)
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, 'Bearer [redacted]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

/**
 * Fix R19: is this tab's cached admin-action response still newer than the listed row?
 * `last` = { ...calendarSync, receivedAt, revision } (stamped by the CRM when stored).
 * `rowFetchedAt` = when the bookings list was fetched (react-query dataUpdatedAt).
 * The cache applies only while the list predates the response AND the row has not moved
 * to a newer revision. Otherwise the durable row wins, so a newer persisted failure
 * (another tab, a customer cancel, a timeout record) is never hidden by an old success.
 * An unstamped cache entry is ignored once any list data exists.
 */
export function freshLastSync(row, last, rowFetchedAt = null) {
  if (!last?.status) return null;
  const rowRev = Number(row?.revision);
  const lastRev = Number(last.revision);
  if (Number.isFinite(rowRev) && Number.isFinite(lastRev) && rowRev > lastRev) return null;
  if (rowFetchedAt != null) {
    if (!Number.isFinite(Number(last.receivedAt))) return null;
    if (Number(rowFetchedAt) >= Number(last.receivedAt)) return null;
  }
  return last;
}

const RECOVERABLE_TERMINAL = (row) => row?.status === 'cancelled'
  && (row.calendar_sync_status === 'pending' || !!row.calendar_event_id || !!row.calendar_op_started_at);

export function bookingSyncWarning(row, lastIn = null, { storeMode = null, rowFetchedAt = null } = {}) {
  if (!row) return null;
  const last = freshLastSync(row, lastIn, rowFetchedAt);
  const status = last?.status || row.calendar_sync_status || 'unknown';
  const error = cleanSyncError(last?.status ? last.error : row.calendar_sync_error);
  if (status === 'failed') {
    return { level: 'failed', title: error ? `Calendar sync failed: ${error}` : 'Calendar sync failed', error, canRetry: true };
  }
  // Fix R13: pending/unknown also gets Retry. That covers live bookings, and cancelled
  // bookings that still have a recoverable calendar identity (a stored id, an in-flight
  // create marker, or a cancel whose sync never finished).
  if (storeMode === 'full' && (status === 'pending' || status === 'unknown')
      && (LIVE.includes(row.status) || RECOVERABLE_TERMINAL(row))) {
    const cancelled = row.status === 'cancelled';
    return {
      level: 'pending',
      title: cancelled
        ? 'Cancelled, but the calendar event was not confirmed removed. Press Retry'
        : status === 'pending'
          ? 'Calendar update not confirmed yet. Press Retry'
          : 'Calendar not verified for this booking (created before sync tracking). Press Retry',
      error,
      canRetry: true,
    };
  }
  return null;
}

/** Fix R15: the last failure was "ownership not verified", so offer the admin verify action. */
export function isUnverifiedOwnership(row, last = null, { rowFetchedAt = null } = {}) {
  const l = freshLastSync(row, last, rowFetchedAt);
  if (l?.reason === 'unverified_calendar_owner') return true;
  const err = l?.status ? l.error : row?.calendar_sync_error;
  return /not verified/i.test(String(err || ''));
}

/** Fix R7: an uncertain earlier calendar create blocks "absent"; offer the admin Resolve action. */
export function isUncertainCreate(row, last = null, { rowFetchedAt = null } = {}) {
  if (!row?.calendar_op_started_at) return false;
  const l = freshLastSync(row, last, rowFetchedAt);
  if (l?.reason === 'uncertain_calendar_create') return true;
  return row.status === 'cancelled';
}
