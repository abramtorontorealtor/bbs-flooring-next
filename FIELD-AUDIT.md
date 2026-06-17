# BBS Flooring — Lead Form Field Coverage Audit

> **Generated:** READ-ONLY audit. No source files were modified.
> **Scope:** Every lead-capture form → API route → email notification → Telegram alert → CRM/admin UI.
> **Legend:** ✅ present | ❌ absent / dropped | ⚠️ partial/conditional

---

## 1. Contact Form (`ContactClient.jsx` → `/api/contact/route.js`)

### 1a. Fields Submitted by `ContactClient.jsx`

The form builds: `{ name, email, phone, message, smsConsent }` and POSTs to `/api/contact`.

| Field (as submitted) | Saved to DB? | In Admin Email? | In Telegram? | In CRM UI? | NOTES |
|---|---|---|---|---|---|
| `name` | ✅ | ✅ | ✅ | ✅ | DB: `contact_leads.customer_name` + `contact_leads.name`. Email: `sendContactAdminNotification` (email.js:122). Telegram: `formatContactAlert` (telegram.js:55). CRM: shown as `lead.name` in list and detail. |
| `email` | ✅ | ✅ | ✅ | ✅ | DB: `contact_leads.customer_email` + `contact_leads.email`. Email: email.js:126. Telegram: telegram.js:57. CRM: clickable `mailto:` in detail panel. |
| `phone` | ✅ | ✅ ⚠️ | ✅ | ✅ | DB: `contact_leads.customer_phone` + `contact_leads.phone`. Email: conditional — only shown if non-null (email.js:127). Telegram: shown as `N/A` when absent (telegram.js:56). CRM: clickable `tel:` link. |
| `message` | ✅ | ✅ | ✅ | ✅ | DB: `contact_leads.message`. Email: rendered in grey box (email.js:130-132). Telegram: rendered as italic preview up to 1500 chars (telegram.js:58-59). CRM: `AdminCRMClient.jsx:1363` renders full `o.message` in `<pre>`. |
| `smsConsent` | ✅ ⚠️ | ❌ | ❌ | ❌ | DB: stored inside `contact_leads.metadata` as `{ sms_consent: smsConsent }` (route.js:45). **Never extracted** to admin email. **Not included** in `formatContactAlert` call (route.js:87). CRM never reads `metadata.sms_consent`. |
| `source` (implicit `'contact_form'`) | ✅ | ✅ ⚠️ | ✅ ⚠️ | ✅ ⚠️ | DB: `contact_leads.source`. Email: shown as small "Source" field (email.js:128). Telegram: appended in brackets if non-default (telegram.js:55). CRM: shown in "Source" row (AdminCRMClient.jsx:1345). Caveat: set server-side as `source || 'contact_form'`, not the form's default. |

---

### 1b. `RequestQuoteBox.jsx` (Product Detail Page mini-form) → also POSTs to `/api/contact`

The widget submits: `{ name, email, phone, message, source: 'pdp_quote_request' }`.  
Notably, `phone` is optional, and `message` is a **synthesized string** constructed from product context before POSTing.

| Field (as submitted) | Saved to DB? | In Admin Email? | In Telegram? | In CRM UI? | NOTES |
|---|---|---|---|---|---|
| `name` | ✅ | ✅ | ✅ | ✅ | Same path as ContactClient. |
| `email` | ✅ | ✅ | ✅ | ✅ | Same path. |
| `phone` | ✅ ⚠️ | ✅ ⚠️ | ✅ ⚠️ | ✅ ⚠️ | Optional — sent as `undefined` if blank; email and Telegram show `N/A`. |
| `message` (synthetic: product name + SKU + variant + customer note) | ✅ | ✅ | ✅ | ✅ | Product context is baked into `message` string client-side (RequestQuoteBox.jsx:30-40). All downstream consumers render raw `message` text, so product name, SKU, variant, and customer free-text note all arrive together. |
| `product.name` (raw prop) | ❌ | ❌ | ❌ | ❌ | **Never sent as a separate field.** Only embedded inside `message` string. Admin cannot filter/search by product name. |
| `selectedVariant` details (pattern/width/grade/SKU) | ❌ | ❌ | ❌ | ❌ | Same — baked into `message`. No standalone structured field. |
| `source: 'pdp_quote_request'` | ✅ | ✅ ⚠️ | ✅ ⚠️ | ✅ ⚠️ | Source tag is stored and shown, but the route treats this as a standard contact (not removal), so `sendContactAdminNotification` fires — not a dedicated PDP notification. |

---

## 2. Removal Estimators (`RemovalEstimator.jsx` + `CarpetRemovalEstimator.jsx` → `/api/contact/route.js`)

Both estimators POST to `/api/contact` with structured data **packed into the `message` string**. The route detects `source.includes('removal-estimator')` and then **regex-parses** the message to reconstruct `sqft`, `haulAway`, and `total` before calling `sendRemovalEstimateAdminNotification`.

### 2a. `RemovalEstimator.jsx` (hardwood/tile/vinyl removal pages)

Submitted fields: `{ name, email, phone, message (packed string), source }`.  
Packed message format: `"TYPE ESTIMATE — Sqft: ${sqft} | Haul-Away: Yes/No | Calculated: $X | Quoted Total: $X CAD"`.

| Field (as submitted) | Saved to DB? | In Admin Email? | In Telegram? | In CRM UI? | NOTES |
|---|---|---|---|---|---|
| `name` | ✅ | ✅ | ✅ | ✅ | DB: `contact_leads.customer_name`. Email: `sendRemovalEstimateAdminNotification` (email.js:226). Telegram: `formatContactAlert` (telegram.js:55) — route passes `formatContactAlert`, NOT a dedicated removal formatter. |
| `email` | ✅ | ✅ | ✅ | ✅ | Same paths. |
| `phone` | ✅ | ✅ ⚠️ | ✅ ⚠️ | ✅ ⚠️ | Conditional display. |
| `sqft` (from slider/input) | ✅ ⚠️ | ✅ | ❌ | ❌ | DB: packed inside `contact_leads.message`. Route regex-extracts it (route.js:59-61) and passes to `sendRemovalEstimateAdminNotification`. **NOT passed to `formatContactAlert`** — Telegram alert never mentions sqft. CRM detail shows `message` string raw, so a human could read it, but it's not structured. |
| `hauling` (haul-away toggle) | ✅ ⚠️ | ✅ | ❌ | ❌ | Same as sqft: parsed from message for email, dropped for Telegram. |
| `total` (calculated estimate) | ✅ ⚠️ | ✅ | ❌ | ❌ | Same extraction. Email shows formatted dollar amount. Telegram does NOT show the estimate total. |
| `removalType` (prop, e.g. 'Hardwood Removal') | ✅ ⚠️ | ✅ | ❌ ⚠️ | ❌ | DB: in `contact_leads.source` tag (e.g. `hardwood-removal-estimator`). Email: `sendRemovalEstimateAdminNotification` receives it explicitly. Telegram: `formatContactAlert` is called with `source` in the tag, but the removal type label itself is not shown — only the source slug appears. |
| `MINIMUM_CHARGE` application flag | ✅ ⚠️ | ❌ | ❌ | ❌ | Only visible inside the raw `message` string if `total < MINIMUM_CHARGE` (text appended). Not extracted to any structured field. |
| `source` | ✅ | ✅ ⚠️ | ✅ ⚠️ | ✅ ⚠️ | Stored and shown as slug (e.g. `hardwood-removal-estimator`). |

### 2b. `CarpetRemovalEstimator.jsx` — additional `stairs` toggle

Submitted fields: `{ name, email, phone, message (packed string), source: 'carpet-removal-estimator' }`.  
Message format: `"CARPET REMOVAL ESTIMATE — Sqft: ${sqft} | Haul-Away: Yes/No | Stairs: Yes/No | Calculated: $X | Quoted Total: $X CAD"`.

| Field (as submitted) | Saved to DB? | In Admin Email? | In Telegram? | In CRM UI? | NOTES |
|---|---|---|---|---|---|
| `name`, `email`, `phone` | ✅ | ✅ | ✅ | ✅ | Same as RemovalEstimator. |
| `sqft` | ✅ ⚠️ | ✅ | ❌ | ❌ | Regex-parsed by route for email. Dropped for Telegram. |
| `hauling` | ✅ ⚠️ | ✅ | ❌ | ❌ | Same. |
| `stairs` ⚠️ UNIQUE FIELD | ✅ ⚠️ | ❌ | ❌ | ❌ | **CRITICAL GAP.** `stairs: true/false` baked into message text only. The route regex does **not** parse `stairs`. `sendRemovalEstimateAdminNotification` signature does not accept it (email.js:225). The stairs flag never appears in admin email, Telegram, or structured CRM data — only readable inside the raw `message` string. The "custom quote needed" note is included in the message but lost if message is truncated. |
| `total` | ✅ ⚠️ | ✅ | ❌ | ❌ | Same extraction as RemovalEstimator. |

---

## 3. Quote Form (`QuoteCalculatorClient.jsx` → `/api/quotes/send/route.js`)

### 3a. `QuoteCalculatorClient.jsx` (Main Quote Calculator)

On submit (step 3), the component builds a `quoteData` object and POSTs `{ quote: quoteData, is_member }` to `/api/quotes/send`.

| Field (as submitted) | Saved to DB? | In Admin Email? | In Telegram? | In CRM UI? | NOTES |
|---|---|---|---|---|---|
| `customer_name` | ✅ | ✅ | ✅ | ✅ | DB: `quotes.customer_name`. Email: `sendQuoteAdminNotification` (email.js:430). Telegram: `formatQuoteAlert` (telegram.js:84). CRM: `lead.name`. |
| `customer_email` | ✅ | ✅ | ✅ | ✅ | Same paths. |
| `customer_phone` | ✅ | ✅ ⚠️ | ✅ ⚠️ | ✅ | Conditional in email. Shown as `N/A` in Telegram if absent. |
| `product_name` | ✅ | ✅ | ✅ | ✅ | DB: `quotes.product_name`. Email: email.js:455. Telegram: telegram.js:87. CRM: in `lead.details` string and quote detail panel (AdminCRMClient.jsx:425). |
| `product_id` | ✅ ⚠️ | ❌ | ❌ | ❌ | **Sent in quoteData (QuoteCalculatorClient.jsx:394) and stored in `quotes` via route if the DB column exists, but NOT read by `sendQuoteAdminNotification` or `formatQuoteAlert`.** Confirm DB schema has this column — if not, it's silently dropped. Not shown anywhere in admin views. |
| `square_footage` | ✅ | ✅ | ✅ | ✅ | DB: `quotes.square_footage`. Email: email.js:456. Telegram: telegram.js:86. CRM: shown in detail panel. |
| `price_per_sqft` | ✅ | ✅ | ✅ | ✅ | DB: `quotes.price_per_sqft`. Email: email.js:457. Telegram: telegram.js:86 (`@ $X/sqft`). CRM: implied by flooring cost. |
| `removal_type` | ✅ | ✅ | ✅ | ✅ | DB: `quotes.removal_type`. Email: email.js:459. Telegram: telegram.js:90. CRM: `lead.details` string (AdminCRMClient.jsx:425). |
| `removal_cost` | ✅ | ✅ | ❌ | ✅ | DB: `quotes.removal_cost`. Email: shown as line item (email.js:420). Telegram: `formatQuoteAlert` does **not** emit a removal cost dollar figure — only removal type label. CRM: shows cost when >0 (AdminCRMClient.jsx:1394). |
| `needs_baseboards` | ✅ | ✅ | ✅ | ✅ | DB: `quotes.needs_baseboards`. Email: boolean shown (email.js:462-463). Telegram: telegram.js:91 (trims string). CRM: shown in quote detail (AdminCRMClient.jsx:1395-1399). |
| `baseboard_cost` | ✅ | ✅ | ❌ | ✅ | DB: `quotes.baseboard_cost`. Email: line item. Telegram: not a separate line. CRM: shown. |
| `needs_shoe_moulding` | ✅ | ✅ | ✅ | ✅ | Same as baseboards. |
| `shoe_moulding_cost` | ✅ | ✅ | ❌ | ✅ | Same as baseboard_cost. |
| `flooring_cost` | ✅ | ✅ | ❌ | ✅ | DB: `quotes.flooring_cost`. Email: "Material" line item. Telegram: not listed separately (total shown). CRM: shown when >0. |
| `installation_cost` | ✅ | ✅ | ❌ | ✅ | DB: `quotes.installation_cost`. Email: "Installation" line item. Telegram: not listed. CRM: shown. |
| `delivery_cost` | ✅ | ✅ | ✅ ⚠️ | ✅ | DB: `quotes.delivery_cost`. Email: shown. Telegram: shows `🚚 Delivery included` if >0 (telegram.js:93) — boolean text only, no amount. CRM: shown. |
| `subtotal` | ✅ | ✅ | ✅ | ❌ | DB: `quotes.subtotal`. Email: shown. Telegram: in total formula line (telegram.js:95). CRM: **not shown** in AdminCRMClient detail panel — only individual line costs and total `lead.value`. AdminQuotesClient.jsx shows it. |
| `tax` | ✅ | ✅ | ✅ | ❌ | DB: `quotes.tax`. Email: "HST (13%)" line. Telegram: in total formula. CRM (AdminCRMClient): **not shown**. AdminQuotesClient.jsx does show it. |
| `total` | ✅ | ✅ | ✅ | ✅ | DB: `quotes.total`. Email: bold total. Telegram: header. CRM: `lead.value`. |
| `is_member` | ✅ | ✅ | ❌ | ❌ | DB: `quotes.is_member`. Email: ✅/❌ flag (email.js:437). Telegram: `formatQuoteAlert` signature includes it but message template never renders it. CRM: **not shown** anywhere in AdminCRMClient or AdminQuotesClient. |
| `customer_address` | ✅ | ❌ | ✅ ⚠️ | ❌ | DB: `quotes.customer_address`. Telegram: shown if present (telegram.js:88). Email `sendQuoteAdminNotification`: **no address row** in the email HTML (email.js:430-500 — only customer, email, phone, member). AdminCRMClient: `lead.details` doesn't include address for quotes; not shown in the quote detail block. AdminQuotesClient: not rendered. |
| `notes` | ✅ | ❌ | ❌ | ✅ ⚠️ | DB: `quotes.notes`. Email: `sendQuoteAdminNotification` does **not** render `quote.notes` (checked email.js:383-500). Telegram: `formatQuoteAlert` — notes field is in the signature but the final `lines` array does **not** include a `notes` line (telegram.js:78-116 — no `notes` push in the lines array). CRM: shown in admin notes field (but this is CRM notes, not the original customer notes field). |

### 3b. `RequestQuoteBox.jsx` submitting to `/api/contact` (not `/api/quotes/send`)

See section 1b above — this component never calls `/api/quotes/send`.

---

## 4. Stair Calculator (`StairCalculatorWidget.jsx` → `/api/quotes/send/route.js`)

The unlock form submits: `{ quote: { customer_name, customer_email, customer_phone, product_name: 'Stair Renovation', notes, total, subtotal, tax: 0, stair_tread_count, stair_pie_count, stair_refinish, stair_posts, stair_pickets, stair_stringers, stair_nosing, stair_railing, stair_landing, stair_species, stair_total } }` — no `square_footage`, no `customer_address`.

| Field (as submitted) | Saved to DB? | In Admin Email? | In Telegram? | In CRM UI? | NOTES |
|---|---|---|---|---|---|
| `customer_name` | ✅ | ✅ | ✅ | ✅ | Standard quote path. |
| `customer_email` | ✅ | ✅ | ✅ | ✅ | Standard quote path. |
| `customer_phone` | ✅ | ✅ ⚠️ | ✅ ⚠️ | ✅ | Standard quote path. |
| `stair_tread_count` | ✅ | ✅ | ✅ | ❌ | DB: `quotes.stair_tread_count`. Email: stair section rendered (email.js:387-402). Telegram: stair lines rendered (telegram.js:99-115). CRM (AdminCRMClient): the quote detail block only shows `flooring_cost`, `installation_cost`, etc. — there is no stair-specific rendering in the CRM detail view. AdminQuotesClient also doesn't render stair fields. |
| `stair_pie_count` | ✅ | ✅ | ✅ | ❌ | Same as tread_count. |
| `stair_refinish` | ✅ | ✅ | ✅ | ❌ | Same — shown in email/telegram breakdown. |
| `stair_posts` | ✅ | ✅ | ✅ | ❌ | Same. |
| `stair_pickets` | ✅ | ✅ | ✅ | ❌ | Same. |
| `stair_stringers` (JSON: `{ count, type }`) | ✅ | ✅ | ✅ | ❌ | Same. |
| `stair_nosing` (JSON: `{ lf, type }`) | ✅ | ✅ | ✅ | ❌ | Same. |
| `stair_railing` (JSON: `{ lf, type }`) | ✅ | ✅ | ✅ | ❌ | Same. |
| `stair_landing` (JSON: `{ size }`) | ✅ | ✅ | ✅ | ❌ | Same. |
| `stair_species` | ✅ | ✅ ⚠️ | ✅ ⚠️ | ❌ | DB: `quotes.stair_species`. Email: only shown if not `red_oak` (email.js:400). Telegram: only shown if not `red_oak` (telegram.js:115). CRM: not rendered. |
| `total` | ✅ | ✅ | ✅ | ✅ | `lead.value` in CRM. |
| `notes` (buildNotesString output) | ✅ | ❌ | ❌ | ✅ ⚠️ | DB: `quotes.notes`. Email: not rendered in admin email (same gap as section 3a). Telegram: same gap. CRM: notes block visible but it's the CRM notes textarea, not `o.notes` from the quote record. |
| `customer_address` | ❌ | ❌ | ❌ | ❌ | **Stair calculator never collects an address.** No address field in the unlock form (StairCalculatorWidget.jsx:156-163). |

---

## 5. Booking / Free Measurement (`FreeMeasurementClient.jsx` + `QuoteBookingClient.jsx` → `/api/booking/confirm/route.js`)

Both forms submit to `/api/booking/confirm`. The booking payload keys are:
`{ customer_name, customer_email, customer_phone, customer_address, postal_code, preferred_date, preferred_time, flooring_type, service_type, product_name, quote_total, square_footage, notes }`.

`QuoteBookingClient` additionally sends `postal_code` and may also send `/api/quotes/send` for the quote portion (handled separately in section 3a).

### 5a. `FreeMeasurementClient.jsx`

Submitted fields: `{ customer_name, customer_email, customer_phone, customer_address, postal_code, preferred_date, preferred_time, flooring_type, service_type, notes }`.

| Field (as submitted) | Saved to DB? | In Admin Email? | In Telegram? | In CRM UI? | NOTES |
|---|---|---|---|---|---|
| `customer_name` | ✅ | ✅ | ✅ | ✅ | DB: `bookings.customer_name`. Email: `sendBookingAdminNotification` (email.js:601). Telegram: `formatBookingAlert` (telegram.js:61). CRM: `lead.name`. |
| `customer_email` | ✅ | ✅ | ✅ | ✅ | Standard path. |
| `customer_phone` | ✅ | ✅ ⚠️ | ✅ ⚠️ | ✅ | Conditional display. CRM: clickable tel: link. |
| `customer_address` | ✅ | ✅ | ✅ | ✅ | DB: `bookings.customer_address`. Email: email.js:617. Telegram: telegram.js:65. CRM: shown in booking detail (AdminCRMClient.jsx:1375). |
| `postal_code` | ✅ | ✅ | ✅ | ❌ | DB: `bookings.postal_code`. Email: email.js:620 (`${esc(booking.postal_code)}`). Telegram: appended after address (telegram.js:65). CRM: **not shown** in AdminCRMClient booking detail section (AdminCRMClient.jsx:1374-1379 shows only `customer_address` and `preferred_date`/`preferred_time`). |
| `preferred_date` | ✅ | ✅ | ✅ | ✅ | Standard path. |
| `preferred_time` | ✅ | ✅ | ✅ | ✅ | Standard path. |
| `flooring_type` | ✅ | ✅ | ✅ | ❌ | DB: `bookings.flooring_type`. Email: "Project" row (email.js:618). Telegram: telegram.js:66. CRM: **not shown** in booking detail block. Only visible in `lead.details` string as part of the date+address composite. |
| `service_type` | ✅ | ✅ | ✅ ⚠️ | ❌ | DB: `bookings.service_type`. Email: `serviceLabel` row if present (email.js:619). Telegram: appended after `flooring_type` if present (telegram.js:66). CRM: not shown in detail. |
| `notes` | ✅ | ✅ | ✅ ⚠️ | ❌ | DB: `bookings.notes`. Email: shown (email.js:622). Telegram: truncated at 200 chars (telegram.js:72). CRM: **not shown** in AdminCRMClient booking detail (AdminCRMClient.jsx:1374-1379). BookingCalendar.jsx also doesn't show notes. |

### 5b. `QuoteBookingClient.jsx` (additional fields)

Adds `{ postal_code, flooring_type: productName || 'quote_estimate', service_type: 'quote_estimate', product_name, quote_total, square_footage }` to the standard booking fields.

| Field (as submitted) | Saved to DB? | In Admin Email? | In Telegram? | In CRM UI? | NOTES |
|---|---|---|---|---|---|
| `product_name` | ✅ | ❌ | ✅ | ❌ | DB: `bookings.product_name`. Telegram: telegram.js:68. Email: `sendBookingAdminNotification` does **not** have a `product_name` row (email.js:601-637). CRM: not shown in detail. |
| `quote_total` | ✅ | ❌ | ✅ | ❌ | DB: `bookings.quote_total`. Telegram: `💰 $X.XX` line (telegram.js:70). Email: `sendBookingAdminNotification` does **not** include quote_total (email.js:601-637). CRM: not shown. |
| `square_footage` | ✅ | ❌ | ✅ | ❌ | DB: `bookings.square_footage`. Telegram: telegram.js:67. Email: `sendBookingAdminNotification` does **not** include square_footage. CRM: not in booking detail block. |
| `postal_code` | ✅ | ✅ | ✅ | ❌ | (Covered above in 5a.) |

---

## 6. Contractor Registration (`ContractorRegistrationForm.jsx` → `/api/contractor/register/route.js`)

Submitted fields: `{ company_name, contact_name, phone, email, trade_type, monthly_volume, message }`.

| Field (as submitted) | Saved to DB? | In Admin Email? | In Telegram? | In CRM UI? | NOTES |
|---|---|---|---|---|---|
| `contact_name` | ✅ | ✅ | ✅ | ✅ | DB: `contact_leads.customer_name`. Email: `sendContactAdminNotification` called with `name: '[CONTRACTOR] contact_name — company_name'` (route.js:43). Telegram: `formatContractorAlert` (telegram.js:119). CRM: `lead.name`. |
| `email` | ✅ | ✅ | ✅ | ✅ | Standard path. |
| `phone` | ✅ | ✅ | ✅ | ✅ | Standard path. |
| `company_name` | ✅ ⚠️ | ✅ ⚠️ | ✅ | ✅ ⚠️ | DB: baked into `contact_leads.message` as "Company: X" AND in `contact_leads.metadata.company_name`. Email: embedded in the `name` prefix `'[CONTRACTOR] contact_name — company_name'` — not a standalone field. Telegram: standalone `🏢` field (telegram.js:121). CRM: only visible in the raw `message` text shown in detail; `metadata.company_name` is **never read** by AdminCRMClient. |
| `trade_type` | ✅ ⚠️ | ✅ ⚠️ | ✅ | ❌ | DB: in `contact_leads.message` ("Trade: X") AND `metadata.trade_type`. Email: inside `message` text block only (route.js:48). Telegram: `🔨` standalone field. CRM: readable only in raw `message` text; metadata not surfaced. |
| `monthly_volume` | ✅ ⚠️ | ✅ ⚠️ | ✅ | ❌ | DB: in message AND `metadata.monthly_volume`. Email: inside message text. Telegram: `📦 Volume:` line. CRM: readable only in raw message. |
| `message` (optional free-text note) | ✅ | ✅ ⚠️ | ❌ | ✅ ⚠️ | DB: appended to `detailMessage` ("Message: X") if non-empty. Email: inside the message block. Telegram: `formatContractorAlert` signature does **not** accept `message` — it only takes `{ contact_name, email, phone, company_name, trade_type, monthly_volume }` (telegram.js:118). Free-text note is **silently dropped** by Telegram. CRM: visible in raw `message` text block. |

---

## DROPPED FIELDS — FIX LIST

Ordered by impact: customer-entered free-text and contact info first, then structured data, then admin-only fields.

| Priority | Form | Field | Destination Missing | Fix Description |
|---|---|---|---|---|
| 🔴 1 | CarpetRemovalEstimator | `stairs` (boolean) | Admin Email, Telegram, CRM structured | The route regex doesn't extract `stairs` from the message. Add `stairs` to `sendRemovalEstimateAdminNotification` signature (email.js:225) and parse it: `const stairsMatch = message?.match(/Stairs:\s*(Yes|No)/i)`. Pass to Telegram via a dedicated `formatRemovalAlert` that includes stairs flag. |
| 🔴 2 | Contractor | `message` (free-text note) | Telegram | `formatContractorAlert` in telegram.js:118 does not accept `message`. Add `message` param and a `message ? \`💬 <i>${esc(message).substring(0,300)}</i>\` : null` line. |
| 🔴 3 | Contact / All forms | `smsConsent` | Admin Email, Telegram, CRM | `smsConsent` is only stored in `metadata.sms_consent`. Admin email should show a prominent "📱 SMS Consent: YES/NO" row. CRM detail should surface `o.metadata?.sms_consent`. This matters for CASL compliance — admin needs to see consent at a glance. |
| 🔴 4 | Quote (all paths) | `notes` | Admin Email, Telegram | `sendQuoteAdminNotification` never renders `quote.notes` (email.js:383-500). `formatQuoteAlert` has notes in signature but the `lines` array never includes a notes push (telegram.js:78-116). Add a `notes` row to both. |
| 🟠 5 | Booking (QuoteBookingClient) | `product_name` | Admin Email | `sendBookingAdminNotification` template (email.js:601-637) has no product_name row. The booking includes it, but admin email never shows it. Add a `${booking.product_name ? \`<tr>...\` : ''}` row. |
| 🟠 6 | Booking (QuoteBookingClient) | `quote_total` | Admin Email | Same function — `quote_total` is saved to DB and sent in Telegram but never in admin email. Add it to `sendBookingAdminNotification`. |
| 🟠 7 | Booking (QuoteBookingClient) | `square_footage` | Admin Email | Same — `square_footage` in DB and Telegram but missing from admin email HTML. |
| 🟠 8 | Quote (all paths) | `customer_address` | Admin Email, CRM | `sendQuoteAdminNotification` has no address row. `AdminCRMClient` quote detail block doesn't show `o.customer_address`. Both need a simple conditional row. |
| 🟠 9 | Booking | `postal_code` | CRM UI | Saved to DB, shown in email and Telegram, but `AdminCRMClient.jsx` booking detail block (lines 1374-1379) shows only `customer_address` and appointment — not postal code. |
| 🟠 10 | Booking | `flooring_type` | CRM UI | Same section — not shown in the detail panel. |
| 🟠 11 | Booking | `service_type` | CRM UI | Same. |
| 🟠 12 | Booking | `notes` | CRM UI | `bookings.notes` is set and shown in email and Telegram but AdminCRMClient booking detail block never renders `o.notes`. |
| 🟡 13 | Quote (main calculator) | `is_member` | Telegram, CRM | `formatQuoteAlert` signature accepts `is_member` but it's never added to the message lines (telegram.js:78). AdminCRMClient never shows member status. Knowing if it's a contractor/member quote matters for follow-up. |
| 🟡 14 | Quote (main calculator) | `subtotal` + `tax` | CRM (AdminCRMClient) | AdminCRMClient detail panel shows line costs but not subtotal/tax rows. AdminQuotesClient does show them, but if admin is using the CRM as primary view (which they are) these are invisible. |
| 🟡 15 | Removal Estimators | `sqft`, `hauling`, `total`, `removalType` | Telegram | Telegram alert for removal forms fires `formatContactAlert` which shows only name/phone/email/message. A dedicated `formatRemovalAlert` should be added to telegram.js (or the route should call `formatContactAlert` with structured additions) to show sqft, haul-away, and dollar estimate prominently. |
| 🟡 16 | Contractor | `trade_type`, `monthly_volume`, `company_name` | CRM (structured view) | Currently only readable inside raw `message` text in the CRM detail panel. The metadata columns (`metadata.trade_type`, `metadata.company_name`, `metadata.monthly_volume`) are saved but AdminCRMClient never reads `o.metadata`. A dedicated "Contractor Details" card in the CRM contact detail view would surface these. |
| 🟡 17 | Stair Calculator (and all quotes) | All stair fields | CRM UI | AdminCRMClient quote detail block renders cost fields (flooring_cost, installation_cost, etc.) but has zero stair-specific rendering. If `stair_tread_count > 0`, the detail panel should show the stair configuration. |
| 🟢 18 | Quote / PDP | `product_id` | Admin Email, Telegram, CRM | Sent in quote payload but `sendQuoteAdminNotification` and `formatQuoteAlert` ignore it. Not useful for humans, but useful for programmatic lookups. Low urgency. |
| 🟢 19 | Removal Estimators | `MINIMUM_CHARGE` flag | Admin Email, Telegram | The "minimum applied" note is text-only inside the packed message. A structured boolean would help. Low urgency since the rendered total already reflects the minimum. |

---

## Summary Counts

| Form | Total Fields | ✅ All 4 Destinations | ❌ At Least One Gap |
|---|---|---|---|
| Contact (ContactClient) | 5 | 4 | 1 (`smsConsent` dropped from 3/4 destinations) |
| RequestQuoteBox (PDP) | 6 | 4 | 2 (`product.name` structured, `selectedVariant` structured) |
| RemovalEstimator (hardwood/tile/vinyl) | 7 | 3 | 4 (`sqft`, `hauling`, `total`, `removalType` dropped from Telegram) |
| CarpetRemovalEstimator | 8 | 3 | 5 (same as above + `stairs` dropped from 3/4 destinations) |
| Quote Calculator | 18 | 10 | 8 (`notes`, `customer_address`, `is_member`, cost items missing from various) |
| Stair Calculator | 14 | 4 | 10 (all stair fields missing from CRM UI; `notes`, `customer_address` missing) |
| Booking (FreeMeasurement) | 9 | 5 | 4 (`postal_code`, `flooring_type`, `service_type`, `notes` missing from CRM) |
| Booking (QuoteBooking extras) | 4 | 0 | 4 (`product_name`, `quote_total`, `sqft` missing from admin email; all 4 missing from CRM) |
| Contractor | 7 | 3 | 4 (`message` dropped from Telegram; `trade_type`/`monthly_volume`/`company_name` unstructured in CRM) |
