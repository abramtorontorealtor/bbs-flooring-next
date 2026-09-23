// CRM sync-warning state (A4, decision 9(1)).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bookingSyncWarning, cleanSyncError } from '../../lib/booking/sync-warning.js';

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

test('pending/unknown → amber on live bookings only; missing column = unknown', () => {
  assert.equal(bookingSyncWarning({ status: 'pending', calendar_sync_status: 'pending' }).level, 'pending');
  assert.equal(bookingSyncWarning({ status: 'confirmed' }).level, 'pending', 'pre-migration row');
  assert.match(bookingSyncWarning({ status: 'confirmed' }).title, /not verified/);
  assert.equal(bookingSyncWarning({ status: 'completed' }), null);
  assert.equal(bookingSyncWarning({ status: 'cancelled', calendar_sync_status: 'unknown' }), null);
});

test('last admin-action response overrides the listed row', () => {
  const row = { status: 'confirmed', calendar_sync_status: 'synced' };
  assert.equal(bookingSyncWarning(row, { status: 'failed', error: 'x' }).level, 'failed');
  assert.equal(bookingSyncWarning({ status: 'confirmed' }, { status: 'synced' }), null);
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
});
