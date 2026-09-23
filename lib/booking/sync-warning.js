/**
 * CRM calendar-sync warning state (Phase A, A4; boss decision 9(1)).
 * Pure + client-safe (no imports) — used by components/admin/AdminCRMClient.jsx.
 *
 *   failed            → { level:'failed' }  red badge + "Retry calendar sync"
 *   pending | unknown → { level:'pending' } quiet amber note (live bookings only)
 *   synced | absent   → null                nothing shown
 *
 * `last` = calendarSync from this session's most recent admin-action response
 * for the booking; it is newer than the listed row (and the only source while
 * the DB is pre-migration and has no calendar_sync_status column), so it wins.
 * Missing column (pre-migration) = 'unknown'.
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

export function bookingSyncWarning(row, last = null) {
  if (!row) return null;
  const status = last?.status || row.calendar_sync_status || 'unknown';
  const error = cleanSyncError(last?.status ? last.error : row.calendar_sync_error);
  if (status === 'failed') {
    return { level: 'failed', title: error ? `Calendar sync failed: ${error}` : 'Calendar sync failed', error };
  }
  if ((status === 'pending' || status === 'unknown') && LIVE.includes(row.status)) {
    return {
      level: 'pending',
      title: status === 'pending'
        ? 'Calendar update not confirmed yet'
        : 'Calendar not verified for this booking (created before sync tracking)',
      error,
    };
  }
  return null;
}
