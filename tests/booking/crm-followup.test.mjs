// R14 (red-team BLOCKER, CRM writer half): lead follow-up outcomes never write
// bookings.status; genuine booking state changes go through the lifecycle API.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  planLeadStatusUpdate, buildBookingFollowUpLog, leadStatusToast, BOOKING_FOLLOWUP_OUTCOMES,
} from '../../lib/booking/crm-followup.js';

const booking = { source: 'booking', entityId: 'b-1', email: 'karen@example.com', status: 'pending' };

for (const status of ['contacted', 'quoted', 'booked', 'lost', 'new', 'weird_status']) {
  test(`R14: booking lead → "${status}" is a follow-up log, never a status write`, () => {
    const plan = planLeadStatusUpdate(booking, status, { next_follow_up_date: '2026-09-30', lost_reason: status === 'lost' ? 'Price' : undefined });
    assert.equal(plan.kind, 'booking_followup');
    assert.equal(plan.id, 'b-1');
    assert.equal(plan.outcome, status);
    assert.equal(plan.log.leadSource, 'booking');
    assert.equal(plan.log.leadId, 'b-1');
    assert.equal(plan.log.skipEmail, true, 'logging never emails');
    assert.equal(plan.log.nextFollowUpDate, '2026-09-30');
    assert.ok(!('status' in plan.log) && !('updates' in plan), 'no status field anywhere');
    if (status === 'lost') assert.match(plan.log.notes, /reason: Price/);
  });
}

test('R14: follow-up queue ✅ Done on a booking = log contacted + next_follow_up_date (server-side), status untouched', () => {
  const plan = planLeadStatusUpdate(booking, 'contacted', { next_follow_up_date: '2026-09-30' });
  assert.equal(plan.kind, 'booking_followup');
  assert.equal(plan.log.nextFollowUpDate, '2026-09-30');
  assert.match(leadStatusToast(plan), /Booking status unchanged/);
});

test('R14: LeadPlaybook outcomes (already logged via send-followup) → no second log, no status write', () => {
  for (const s of ['booked', 'quoted', 'contacted', 'lost']) {
    const plan = planLeadStatusUpdate(booking, s, { lost_reason: 'Ghosted / no response' }, { alreadyLogged: true });
    assert.deepEqual([plan.kind, plan.log], ['booking_followup', null]);
  }
});

test('R14: booking → completed goes through the lifecycle admin-action (complete)', () => {
  assert.deepEqual(planLeadStatusUpdate(booking, 'completed'), { kind: 'booking_lifecycle', id: 'b-1', action: 'complete' });
});

test('R14: confirmed / cancelled / pending are never side effects of the lead writer', () => {
  for (const s of ['confirmed', 'cancelled', 'pending']) {
    const plan = planLeadStatusUpdate(booking, s);
    assert.equal(plan.kind, 'explicit_action');
    assert.match(plan.message, /Booking Actions/);
  }
});

test('non-booking leads keep the direct lead_status write (unchanged behaviour)', () => {
  assert.deepEqual(
    planLeadStatusUpdate({ source: 'quote', entityType: 'SavedQuote', entityId: 's1' }, 'quoted', { next_follow_up_date: '2026-10-01' }),
    { kind: 'entity_update', entity: 'SavedQuote', id: 's1', updates: { next_follow_up_date: '2026-10-01', lead_status: 'quoted' } },
  );
  assert.deepEqual(planLeadStatusUpdate({ source: 'quote', entityId: 'q1' }, 'booked'),
    { kind: 'entity_update', entity: 'Quote', id: 'q1', updates: { lead_status: 'booked' } });
  assert.deepEqual(planLeadStatusUpdate({ source: 'contact', entityId: 'c1' }, 'lost', { lost_reason: 'Price' }),
    { kind: 'entity_update', entity: 'ContactLead', id: 'c1', updates: { lost_reason: 'Price', lead_status: 'lost' } });
  assert.equal(planLeadStatusUpdate({ source: 'contact', entityId: 'c1' }, 'completed').kind, 'entity_update');
  assert.equal(planLeadStatusUpdate({ source: 'order', entityId: 'o1' }, 'contacted').kind, 'none');
  assert.equal(planLeadStatusUpdate(null, 'contacted').kind, 'none');
  assert.equal(planLeadStatusUpdate(booking, '').kind, 'none');
});

test('buildBookingFollowUpLog: bad next date dropped, notes capped, no email', () => {
  const log = buildBookingFollowUpLog({ entityId: 'b-2', email: '' }, { outcome: 'sent_quote', nextFollowUpDate: 'soon', notes: 'x'.repeat(900) });
  assert.equal(log.nextFollowUpDate, null);
  assert.equal(log.to, 'no-email@logged.internal');
  assert.equal(log.notes.length, 500);
  assert.equal(log.skipEmail, true);
  assert.match(log.customSubject, /sent quote/);
  assert.deepEqual(BOOKING_FOLLOWUP_OUTCOMES, ['new', 'contacted', 'quoted', 'booked', 'lost']);
});

test('R14: CRM source has no direct Booking.update status writer left; uses the planner', () => {
  const src = readFileSync(new URL('../../components/admin/AdminCRMClient.jsx', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /entities\.Booking\.update\s*\(/);
  assert.doesNotMatch(src, /updates\.status\s*=/);
  assert.match(src, /planLeadStatusUpdate\(lead, newStatus, extraFields, \{ alreadyLogged \}\)/);
  // LeadPlaybook passes alreadyLogged so booking interactions aren't logged twice.
  assert.equal((src.match(/logged\)/g) || []).length, 3);
});
