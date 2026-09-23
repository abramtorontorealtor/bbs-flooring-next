// R1: every real Google fetch (OAuth token + Calendar) carries an AbortSignal
// deadline. global fetch is stubbed; no network.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  insertCalendarEventWithId, getCalendarEvent, patchCalendarEvent, deleteCalendarEventById, googleTimeoutMs,
} from '../../lib/google-calendar.js';

const ENV = {
  GOOGLE_CALENDAR_CLIENT_ID: 'cid', GOOGLE_CALENDAR_CLIENT_SECRET: 'sec',
  GOOGLE_CALENDAR_REFRESH_TOKEN: 'rt', GOOGLE_CALENDAR_TIMEOUT_MS: '40',
};
let saved;
let realFetch;
beforeEach(() => {
  saved = Object.fromEntries(Object.keys(ENV).map((k) => [k, process.env[k]]));
  Object.assign(process.env, ENV);
  realFetch = globalThis.fetch;
});
afterEach(() => {
  globalThis.fetch = realFetch;
  for (const [k, v] of Object.entries(saved)) { if (v === undefined) delete process.env[k]; else process.env[k] = v; }
});

/** fetch that never answers unless its signal aborts (like a stalled Google socket). */
function hangingFetch(calls, { tokenOk = false } = {}) {
  return (url, init = {}) => {
    calls.push({ url: String(url), signal: init.signal });
    if (tokenOk && String(url).includes('oauth2')) {
      return Promise.resolve(new Response(JSON.stringify({ access_token: 'tok' }), { status: 200 }));
    }
    return new Promise((_, reject) => {
      init.signal?.addEventListener('abort', () => reject(init.signal.reason));
    });
  };
}

const booking = { id: 'b1', status: 'pending', customer_name: 'K', preferred_date: '2026-10-05', preferred_time: '1:30 PM' };

test('googleTimeoutMs: env override, default 4000', () => {
  assert.equal(googleTimeoutMs(), 40);
  delete process.env.GOOGLE_CALENDAR_TIMEOUT_MS;
  assert.equal(googleTimeoutMs(), 4000);
});

test('stalled OAuth token endpoint → helper resolves failure (timeout) instead of hanging', { timeout: 2000 }, async () => {
  const calls = [];
  globalThis.fetch = hangingFetch(calls);
  const r = await insertCalendarEventWithId('bbsabc12', booking);
  assert.equal(r.success, false);
  assert.equal(r.reason, 'timeout');
  assert.match(r.error, /timed out/);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.includes('oauth2'));
  assert.ok(calls[0].signal instanceof AbortSignal);
});

for (const [name, fn] of [
  ['insert', () => insertCalendarEventWithId('bbsabc12', booking)],
  ['get', () => getCalendarEvent('bbsabc12')],
  ['patch', () => patchCalendarEvent('bbsabc12', booking, { restore: true })],
  ['delete', () => deleteCalendarEventById('bbsabc12')],
]) {
  test(`stalled Calendar ${name} → bounded failure; sendUpdates=none kept`, { timeout: 2000 }, async () => {
    const calls = [];
    globalThis.fetch = hangingFetch(calls, { tokenOk: true });
    const r = await fn();
    assert.equal(r.success, false);
    assert.equal(r.reason, 'timeout');
    assert.equal(calls.length, 2);
    assert.match(calls[1].url, /sendUpdates=none/);
    assert.ok(calls.every((c) => c.signal instanceof AbortSignal));
  });
}

test('caller signal already aborted → no fetch at all', async () => {
  const calls = [];
  globalThis.fetch = hangingFetch(calls);
  const c = new AbortController();
  c.abort();
  const r = await deleteCalendarEventById('bbsabc12', { signal: c.signal });
  assert.equal(r.success, false);
  assert.equal(r.reason, 'aborted');
  assert.equal(calls.length, 0);
});

test('caller signal aborting mid-request cuts the Google call short (before its own timeout)', { timeout: 2000 }, async () => {
  process.env.GOOGLE_CALENDAR_TIMEOUT_MS = '5000';
  const calls = [];
  globalThis.fetch = hangingFetch(calls, { tokenOk: true });
  const c = new AbortController();
  setTimeout(() => c.abort(new Error('budget')), 30);
  const t0 = Date.now();
  const r = await getCalendarEvent('bbsabc12', { signal: c.signal });
  assert.equal(r.success, false);
  assert.ok(Date.now() - t0 < 1000);
});
