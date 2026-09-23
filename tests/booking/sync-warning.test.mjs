// CRM sync-warning state (A4, decision 9(1)).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bookingSyncWarning, cleanSyncError, isUnverifiedOwnership, freshLastSync } from '../../lib/booking/sync-warning.js';

test('failed → red level with sanitized error title; synced/absent → nothing', () => {
  const w = bookingSyncWarning({ status: 'confirmed', calendar_sync_status: 'failed',
    calendar_sync_error: 'patch: HTTP 500 Bearer ya29.SECRET for k@example.com' });
  assert.equal(w.level, 'failed');
  assert.doesNotMatch(w.title, /ya29|k@example\.com/);
  assert.match(w.title, /^Calendar sync failed: patch: HTTP 500/);
  assert.equal(bookingSyncWarning({ status: 'confirmed', calendar_sync_status: 'synced' }), null);
  assert.equal(bookingSyncWarning({ status: 'cancelled', calendar_sync_status: 'absent' }), null);
});

test('failed shows even on a cancelled booking (event may still be on the calendar)', () => {
  assert.equal(bookingSyncWarning({ status: 'cancelled', calendar_sync_status: 'failed' }).level, 'failed');
});

const FULL = { storeMode: 'full' };

test('pending/unknown → amber on live bookings only (store mode full); missing column = unknown', () => {
  assert.equal(bookingSyncWarning({ status: 'pending', calendar_sync_status: 'pending' }, null, FULL).level, 'pending');
  assert.equal(bookingSyncWarning({ status: 'confirmed' }, null, FULL).level, 'pending', 'pre-migration row');
  assert.match(bookingSyncWarning({ status: 'confirmed' }, null, FULL).title, /not verified/);
  assert.equal(bookingSyncWarning({ status: 'completed' }, null, FULL), null);
  assert.equal(bookingSyncWarning({ status: 'cancelled', calendar_sync_status: 'unknown' }, null, FULL), null);
});

test('decision 10(2): amber hidden unless store mode = full; red failed always shown', () => {
  for (const storeMode of [undefined, null, 'auto', 'legacy', 'FULL', 'yolo']) {
    const opts = storeMode === undefined ? undefined : { storeMode };
    assert.equal(bookingSyncWarning({ status: 'confirmed' }, null, opts), null, `unknown hidden in ${storeMode}`);
    assert.equal(bookingSyncWarning({ status: 'pending', calendar_sync_status: 'pending' }, null, opts), null);
    assert.equal(bookingSyncWarning({ status: 'pending' }, { status: 'pending' }, opts), null);
    assert.equal(bookingSyncWarning({ status: 'confirmed', calendar_sync_status: 'failed' }, null, opts).level, 'failed');
    assert.equal(bookingSyncWarning({ status: 'confirmed' }, { status: 'failed', error: 'x' }, opts).level, 'failed');
  }
});

test('last admin-action response overrides the listed row', () => {
  const row = { status: 'confirmed', calendar_sync_status: 'synced' };
  assert.equal(bookingSyncWarning(row, { status: 'failed', error: 'x' }).level, 'failed');
  assert.equal(bookingSyncWarning({ status: 'confirmed' }, { status: 'synced' }), null);
  // Unstamped cache, no list timestamp: response still wins (only source pre-refetch).
  assert.equal(bookingSyncWarning({ status: 'confirmed', calendar_sync_status: 'failed' }, { status: 'synced' }), null);
  assert.equal(bookingSyncWarning(row, null), null);
  assert.equal(cleanSyncError(null), '');
});

test('CRM wires the warning + retry_sync through the existing admin-action mutation', () => {
  const src = readFileSync(new URL('../../components/admin/AdminCRMClient.jsx', import.meta.url), 'utf8');
  assert.match(src, /bookingSyncWarning\(/);
  assert.match(src, /action: 'retry_sync'/);
  assert.match(src, /Calendar sync failed/);
  assert.match(src, /Retry calendar sync/);
  assert.doesNotMatch(src, /fetch\([^)]*retry/i, 'no separate fetch for retry');
  // decision 10(2): amber badge path passes the server store mode through
  assert.match(src, /export default function AdminCRMClient\(\{ bookingStoreMode = 'auto' \}/);
  assert.match(src, /bookingSyncWarning\(row, bookingLastSync\[id\], \{ storeMode: bookingStoreMode, rowFetchedAt: bookingsFetchedAt \|\| null \}\)/);
  assert.doesNotMatch(src, /bookingSyncWarning\(o, bookingLastSync/, 'every call site goes through syncWarningFor');
  assert.match(src, /receivedAt: Date\.now\(\), revision: data\?\.booking\?\.revision/);
  const page = readFileSync(new URL('../../app/admin/crm/page.jsx', import.meta.url), 'utf8');
  assert.match(page, /resolveStoreMode\(process\.env\)/);
  assert.match(page, /<AdminCRMClient bookingStoreMode=\{bookingStoreMode\} \/>/);
});

test('R15: isUnverifiedOwnership from last response reason or durable row error', () => {
  assert.equal(isUnverifiedOwnership({}, { status: 'failed', reason: 'unverified_calendar_owner' }), true);
  assert.equal(isUnverifiedOwnership({ calendar_sync_error: "calendar event x is not verified as this booking's event" }), true);
  assert.equal(isUnverifiedOwnership({ calendar_sync_error: 'HTTP 500: Backend Error' }), false);
  assert.equal(isUnverifiedOwnership({ calendar_sync_error: 'not verified' }, { status: 'synced', error: null }), false);
});

// ── R19: newer durable state beats an old cached success ──────────────────
test('R19: newer persisted failure overrides an old CRM success (refetch after response, or higher revision)', () => {
  const lastOk = { status: 'synced', error: null, receivedAt: 1000, revision: 2 };
  const fresh = { status: 'cancelled', revision: 3, calendar_sync_status: 'failed', calendar_sync_error: 'delete: HTTP 500' };
  // revision moved past the cached response → row wins
  assert.equal(bookingSyncWarning(fresh, lastOk).level, 'failed');
  // same revision but the list was refetched after the response → row wins
  const sameRev = { ...fresh, revision: 2 };
  assert.equal(bookingSyncWarning(sameRev, lastOk, { rowFetchedAt: 2000 }).level, 'failed');
  // list older than the response, same revision → the newer response still wins
  assert.equal(bookingSyncWarning(sameRev, lastOk, { rowFetchedAt: 500 }), null);
  // reverse: stale red cache cleared once another actor fixed it and the list refetched
  const lastFail = { status: 'failed', error: 'x', receivedAt: 1000, revision: 2 };
  assert.equal(bookingSyncWarning({ status: 'confirmed', revision: 2, calendar_sync_status: 'synced' }, lastFail, { rowFetchedAt: 3000 }), null);
  // unstamped cache is ignored once list data exists
  assert.equal(freshLastSync({ revision: 1 }, { status: 'synced' }, 10), null);
});

test('R13: Retry offered for pending/unknown on live rows and cancelled rows with recoverable identity (full mode)', () => {
  const FULL = { storeMode: 'full' };
  assert.equal(bookingSyncWarning({ status: 'confirmed', calendar_sync_status: 'unknown' }, null, FULL).canRetry, true);
  assert.equal(bookingSyncWarning({ status: 'pending', calendar_sync_status: 'pending' }, null, FULL).canRetry, true);
  const cancelledPending = bookingSyncWarning({ status: 'cancelled', calendar_sync_status: 'pending' }, null, FULL);
  assert.equal(cancelledPending.canRetry, true);
  assert.match(cancelledPending.title, /not confirmed removed/);
  assert.equal(bookingSyncWarning({ status: 'cancelled', calendar_sync_status: 'unknown', calendar_event_id: 'oldid' }, null, FULL).canRetry, true);
  // nothing to recover → nothing shown
  assert.equal(bookingSyncWarning({ status: 'cancelled', calendar_sync_status: 'unknown' }, null, FULL), null);
  assert.equal(bookingSyncWarning({ status: 'completed', calendar_sync_status: 'pending' }, null, FULL), null);
  assert.equal(bookingSyncWarning({ status: 'confirmed', calendar_sync_status: 'failed' }).canRetry, true);
});
