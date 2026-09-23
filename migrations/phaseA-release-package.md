# Booking Phase A: release / approval package (DRAFT for Abram)

Branch `feat/booking-lifecycle-phase-a`, worktree `/home/ubuntu/bbs-wt-booking-a`, base `be5ae15`.
Local evidence at package time (fix-5): `npm test` 185/185; `git diff --check` clean; eslint on the changed scope shows 0 new problems (the 3 in `components/admin/AdminCRMClient.jsx`, lines ~1479 / ~2342, predate Phase A).
Nothing has been deployed, migrated, or run against live Google/DB/email. **Not ship-ready until the external gates in §3 pass.**

## 1. R1–R20 disposition
| # | Sev | Status | Evidence / reason |
|---|---|---|---|
| R1 | BLOCKER | Fixed (local) | `lib/booking/deadline.js`, Google AbortSignal deadlines; `tests/booking/bounded.test.mjs`. Parent verified the Vercel team is Pro + Fluid (phaseA-recovery-checkpoint-review.md); the exact per-route `maxDuration` is still preview-gated (P1). |
| R2 | SHOULD | **Deferred: Phase B** (approved plan) | Lost DB ACK on insert → 500 while the row exists; the retry returns duplicate success without re-running effects. Needs an idempotency key + receipt. Residual: rare, and the admin sees the row in the CRM (Telegram may be missing). |
| R3 | SHOULD | Fixed | `lib/booking/conversion.js`; both clients commit success before analytics/quote save; `tests/booking/conversion.test.mjs`. Hydrated-browser check = gate P6. |
| R4 | SHOULD | **Deferred: Phase B** | A duplicate response suppresses conversion even when the first response was lost. Needs a receipt/transaction_id dedupe. Residual: possible under-count of conversions, never over-count. |
| R5 | SHOULD | Fixed, with a residual | Re-read before confirm/reschedule email; `tests/booking/notify-order.test.mjs`. Residual: the check-then-send window is not atomic (runbook §10). |
| R6 | SHOULD | Fixed | Identical confirm/reschedule = no-op, no email; concurrent-confirm test. |
| R7 | BLOCKER | **Fixed locally for PATCH/restore races; uncertain INSERT = accepted-risk decision needed** | ETag If-Match on every PATCH, fail closed without an etag, fenced tombstone. Uncertain inserts: per-attempt marker tokens, cleared only by the owning attempt's own definite answer or by the explicit admin **Resolve**. A cancelled booking with an uncertain create is never reported absent/synced. Tests `tests/booking/{fencing,recovery}.test.mjs`, incl. a modelled undetected id collision and concurrent/serial marker races (failing-first vs b7afe95). **Provider limitation:** Google documents that id collisions may go undetected at insert time, so after an uncertain insert a copy can still appear after human resolution (runbook §9). This needs Abram's explicit acceptance, or a Phase B worker. Gate G validates the conditional writes only. |
| R8 | BLOCKER | Fixed | Metadata-write failure = failed; cancel targets stored + stable ids; fencing tests. |
| R9 | SHOULD | Fixed | Exclusive all-day end, 11 PM rollover; `tests/booking/google-body.test.mjs` (real request bodies). |
| R10 | BLOCKER | Fixed + mitigated by rollout | Guarded legacy no-op CAS; full mode required for launch. |
| R11 | SHOULD | Fixed by launch requirement | `BOOKING_STORE_MODE=full` mandatory (runbook §2); legacy only for emergency rollback. |
| R12 | SHOULD | Documented (process control) | Controlled cutover window + truthful rollback (runbook §2/§3). Cannot be enforced in code against old instances; drain wait depends on the verified `maxDuration`. |
| R13 | SHOULD | Fixed | Durable failed on exhausted passes, no auto-sync promise, Retry for pending/unknown + recoverable cancelled rows. |
| R14 | BLOCKER | Fixed | Service: only `cancelled` deletes. CRM: no `bookings.status` writes from the lead writer (`crm-followup.js`); send-followup log-only failures are no longer reported as success (`tests/booking/send-followup.test.mjs`). Existing non-canonical rows: read-only audit + per-row decision (runbook §7). |
| R15 | BLOCKER | Fixed locally; **launch prerequisites** | HMAC ownership proofs, admin `trust_calendar_event`, 503 without service role; `tests/booking/authority.test.mjs`. Requires: anon-insert policy dropped, secret set, full mode. Historical rows: per-row verification (below). |
| R16 | SHOULD | Fixed, with a residual | DTOs (incl. public create), literal email/full-phone lookup, UUID token, per-IP limits. Residual: limits are per instance (burst only); a leaked token still controls its one booking. |
| R17 | SHOULD | Fixed (docs) | Private CSV / locked-down private schema backup only (runbook §1). |
| R18 | NIT | Fixed (docs) | Per-request fallback wording in runbook + adapter comment. |
| R19 | SHOULD | Fixed | Stamped CRM cache; newer durable state wins; `tests/booking/sync-warning.test.mjs`. |
| R20 | SHOULD | Partly fixed | Real deferred-race tests on the real lifecycle/adapter, real Google request bodies, real handler cores (send-followup, lookup, customer/admin actions). **Not covered offline:** hydrated UI, real RLS/DDL, real Google, real Vercel wiring → gates G, S, P. |

## 2. Legacy-booking trust handling (no auto-trust, no backfill)
Every pre-migration row has NULL proofs. Until an admin verifies a row, a customer cancel/reschedule on it updates the DB and emails normally, but **the Google event is not touched**. The CRM shows red "not verified" with a **Verify calendar event** button. Per row: open the event in Google Calendar, confirm it is this customer's appointment, press Verify (the exact stored id is echoed back), then press Retry. Stage the list at cutover:
```sql
select id, customer_name, preferred_date, preferred_time, status, calendar_event_id
from public.bookings
where status in ('pending','confirmed') and ownership_proof is null
order by preferred_date;
```
Rotating `BOOKING_OWNERSHIP_SECRET` un-verifies every row. Treat it as a signing key.

## 3. Launch gates (all need Abram's explicit OK; none executed)
- **G. Google sandbox contract:** harness §A on a disposable secondary calendar (`GOOGLE_CALENDAR_ID` explicitly set; sendUpdates=none, no attendees). A failure of G4/G8/G9 (conditional-write fencing) blocks launch. G2/G5 are informational: passing them does not prove uncertain inserts cannot land.
- **S. SQL:** harness §B up/down + idempotency + CHECK + anon-policy drop/restore on a disposable DB.
- **P. Preview (sandbox DB + sandbox calendar):** harness §C. P1 = the actual function `maxDuration`/Fluid setting (parent checking the Vercel config read-only); tune `BOOKING_TIMEOUT_SYNC_MS` for ≥2 s headroom if the limit is 10 s.
- **Rollout (runbook §2):** private backup + fingerprint → `pg_policies` snapshot + anon-log review → drop `bookings_anon_insert` → up migration + verify → env (`BOOKING_STORE_MODE=full`, `BOOKING_OWNERSHIP_SECRET`, service role) → quiet-window deploy → drain wait → §7/§8 per-row triage → one smoke `retry_sync`.
- **Karen's booking:** not repaired automatically. Verify + Retry it as the first per-row item after cutover.

## 4. What is complete vs. needs external authority
- **Complete locally:** all code/test/runbook items in §1 marked Fixed; migrations (up/down drafted, not applied); verification harness written.
- **Needs external access/authority:** Google sandbox run, disposable-DB DDL run, Vercel preview + env + `maxDuration` check, anon-policy drop, production migration, deploy, per-row legacy verification.
- **Decision needed from Abram:** accept the R7 uncertain-insert residual (a rare timed-out create can reappear after an admin resolved it; detected only at the next manual check), or fund a Phase B reconciliation worker.
- **Explicitly not claimed:** that an uncertain Google insert can never land (provider contract says it can); atomic create/idempotency (R2/R4, Phase B); a global rate limit; perfectly ordered emails (R5 residual); automatic convergence without an admin Retry; correctness of the R7 design before gate G passes.
