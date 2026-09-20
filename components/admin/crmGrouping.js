// crmGrouping.js — pure helpers for grouping CRM lead records by customer.
//
// The CRM combines rows from several sources (quotes, saved quotes,
// bookings, orders, contact_leads). The same person often shows up 2-3
// times (e.g. two contact form submissions, or a quote + a booking).
// These helpers union records that share a normalized email OR a
// normalized phone into a single "customer group" via union-find, so a
// record that shares either key with two otherwise-unrelated records
// still joins them into one group (transitive match).
//
// No React here — kept pure/unit-testable. AdminCRMClient.jsx wires this
// into rendering; CustomerGroupCard.jsx renders the group header.

/** Lowercase/trim an email for matching. Returns '' for falsy/invalid input. */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/** Digits-only phone, with a single leading "1" (NANP country code) stripped. */
export function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1);
  return digits;
}

// Minimal union-find over array indices.
class UnionFind {
  constructor() { this.parent = []; }
  find(x) {
    if (this.parent[x] === undefined) this.parent[x] = x;
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a, b) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent[ra] = rb;
  }
}

/**
 * Groups lead records into customer groups keyed by normalized email OR
 * normalized phone (union-find, so sharing either key joins a group).
 * Preserves the relative order of `leads` (a group's position is set by
 * the first appearance of any of its members) so upstream filter/sort
 * order carries through.
 */
export function groupLeadsByContact(leads) {
  const uf = new UnionFind();
  const emailIndex = new Map();
  const phoneIndex = new Map();

  leads.forEach((lead, i) => {
    uf.find(i);
    const email = normalizeEmail(lead.email);
    const phone = normalizePhone(lead.phone);
    if (email) {
      if (emailIndex.has(email)) uf.union(i, emailIndex.get(email));
      else emailIndex.set(email, i);
    }
    if (phone) {
      if (phoneIndex.has(phone)) uf.union(i, phoneIndex.get(phone));
      else phoneIndex.set(phone, i);
    }
  });

  const orderedRoots = [];
  const rootToIndices = new Map();
  leads.forEach((lead, i) => {
    const root = uf.find(i);
    if (!rootToIndices.has(root)) {
      rootToIndices.set(root, []);
      orderedRoots.push(root);
    }
    rootToIndices.get(root).push(i);
  });

  return orderedRoots.map((root) => buildGroupMeta(rootToIndices.get(root).map((i) => leads[i])));
}

function buildGroupMeta(records) {
  let mostRecent = records[0];
  for (const r of records) {
    if (new Date(r.date) > new Date(mostRecent.date)) mostRecent = r;
  }
  const withName = records.find((r) => r.name && r.name !== 'Anonymous') || mostRecent;
  const withEmail = records.find((r) => r.email) || mostRecent;
  const withPhone = records.find((r) => r.phone) || mostRecent;
  const totalValue = records.reduce((sum, r) => sum + (Number(r.value) || 0), 0);

  return {
    id: `group-${records[0].id}`,
    records,
    count: records.length,
    name: withName.name || 'Anonymous',
    email: withEmail.email || '',
    phone: withPhone.phone || '',
    mostRecentDate: mostRecent.date,
    totalValue,
  };
}

/**
 * Flattens grouped leads into a single display list for rendering:
 * - A group with 1 record passes through unchanged (renders "exactly as
 *   today").
 * - A group with 2+ records emits a `{ __groupHeader: true, group }`
 *   marker item followed by each member record (tagged `_groupMember`,
 *   `_groupId`) immediately after it, so the caller can render the
 *   existing per-record row/card nested directly underneath the header.
 */
export function buildDisplayList(leads) {
  const groups = groupLeadsByContact(leads);
  const items = [];
  groups.forEach((group) => {
    if (group.count > 1) {
      items.push({ __groupHeader: true, id: `header-${group.id}`, group });
      group.records.forEach((lead) => items.push({ ...lead, _groupMember: true, _groupId: group.id }));
    } else {
      items.push(group.records[0]);
    }
  });
  return items;
}
