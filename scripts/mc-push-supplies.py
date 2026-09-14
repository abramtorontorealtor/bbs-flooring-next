#!/usr/bin/env python3
"""Push the `supplies` catalogue into Google Merchant Center (Merchant API v1,
via scripts/lib/mc_api.py in the OpenClaw workspace — same helper the existing
per-brand product feed scripts use: scripts/mc-push-impressive.py,
scripts/mc-push-triforest.py). Ported to the family/variant shape used by
lib/supplyFamilies.js + lib/suppliesCatalog.js (S5, Sep 12 2026): one Merchant
Center ROW per member SKU, grouped under item_group_id = the family slug
(`variant_group`, or the row's own `code` when it has no group — i.e. a
singleton family), same pattern as the `productGroupID` used in the on-site
Product JSON-LD (app/flooring-accessories/[code]/page.jsx `productSchema()`).

⚠️ THIS SCRIPT LIVES IN THE bbs-flooring-next REPO (unlike the product mc-push-*
scripts, which live in the OpenClaw workspace scripts/ dir) but still depends
on two workspace-only files for credentials, exactly like those scripts do:
  - {WS}/bbs-supabase-db.yaml   (Postgres pooler creds — read-only query)
  - {WS}/gsc-creds.yaml         (Merchant Center OAuth — via mc_api.py)
Run it FROM the workspace (or set BBS_WS to point at the workspace) so those
paths resolve. It is a DRY RUN by default; nothing is pushed without --apply.

Scope query — mirrors the RLS policy on `supplies` + the extra image_url gate
from lib/suppliesCatalog.js (`getSuppliesCatalog`):
  active = true, retail_approved = true, discontinued = false,
  retail IS NOT NULL, image_url IS NOT NULL AND image_url <> ''
Columns selected are the SAME anon-readable set lib/suppliesCatalog.js reads
(SELECT_COLUMNS) — `supplier` and `supplier_desc` are NEVER selected, mirroring
the S5 hard rule (Sep 12 2026) that the supplier name never appears on-site or
in anything derived from this table.

HARD RULE (Abram): the word "Prosol" (or any supplier name) must never appear
in any field this script emits. `assert_no_supplier_leak()` greps every string
value of every built row before anything is printed or pushed and aborts the
whole run if it finds a hit.

Usage:
  .venv/bin/python scripts/mc-push-supplies.py                 # DRY RUN (default)
  .venv/bin/python scripts/mc-push-supplies.py --sample 5       # print first 5 rows only
  .venv/bin/python scripts/mc-push-supplies.py --apply           # actually push (Opus-only,
                                                                   money/public gate — never
                                                                   run this without Abram's
                                                                   explicit go-ahead)

Created Sep 13 2026 (mc-supplies-feed branch). Design notes + open questions
for Abram: findings/MC-SUPPLIES-FEED-2026-09-13.md.
"""
import os
import re
import sys
import json
import yaml
import psycopg2

WS = os.environ.get('BBS_WS', '/home/ubuntu/.openclaw/workspace')
sys.path.insert(0, os.path.join(WS, 'scripts', 'lib'))
import mc_api  # noqa: E402  (workspace-only helper, see module docstring)

SITE = 'https://bbsflooring.ca'
GPC_FLOORING = '2826'  # Hardware > Building Materials > Flooring & Carpet

# Verified LIVE against Google's product taxonomy file
# (https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt,
# fetched Sep 13 2026 — Google_Product_Taxonomy_Version 2021-09-21). Every ID
# below is a real leaf/near-leaf node from that file, not guessed.
GPC_BY_CATEGORY = {
    'adhesive': '503742',          # Hardware > Building Consumables > Hardware Glue & Adhesives
    'primer': '2058',              # Hardware > Building Consumables > Painting Consumables > Primers
    'subfloor_prep': GPC_FLOORING, # Hardware > Building Materials > Flooring & Carpet (levellers/patch = flooring install prep)
    'underlay': GPC_FLOORING,      # Hardware > Building Materials > Flooring & Carpet
    'moisture_barrier': GPC_FLOORING,
    'transition': '7112',          # Hardware > Building Materials > Molding
    'baseboard': '7112',
    'trim': '7112',
    'floor_vent': '2766',          # Hardware > Heating, Ventilation & Air Conditioning > Vents & Flues
    'tools': '1167',               # Hardware > Tools
}

CATEGORY_LABEL = {
    'adhesive': 'Adhesive', 'primer': 'Primer', 'subfloor_prep': 'Subfloor Prep',
    'underlay': 'Underlay', 'moisture_barrier': 'Moisture Barrier', 'transition': 'Transition',
    'baseboard': 'Baseboard', 'trim': 'Trim', 'floor_vent': 'Floor Vent', 'tools': 'Tools',
}

# In stock at showroom / next-day GTA pickup = genuinely in stock. Everything
# else is an order-in tier (Ontario warehouse transfer or special order) — per
# Abram's brief, represent those as "preorder" rather than "in stock" so the
# feed doesn't overpromise same-day pickup on a special-order item.
IN_STOCK_TIERS = {'showroom', 'gta'}

SUPPLIER_LEAK_RE = re.compile(r'prosol', re.IGNORECASE)

# ⚠️ DISCOVERED Sep 13 2026: 121 of 166 in-scope rows (323 of all supplies rows)
# had `image_url` = `/images/accessories/prosol/<file>.webp` — the supplier's
# name was the live image path. Fixed in the same commit as this script:
#   1. public/images/accessories/prosol/ -> public/images/accessories/install-supplies/
#      (git mv, 283 files) + a permanent redirect for the old path in
#      next.config.mjs so nothing breaks before the DB is backfilled.
#   2. This script remaps the old prefix when it builds `imageLink`, so the
#      feed is correct as soon as the branch is deployed, even if the DB
#      backfill (`--sql` prints it) hasn't run yet.
IMAGE_PATH_REMAP = {'/images/accessories/prosol/': '/images/accessories/install-supplies/'}

# GTA delivery on supplies is the same flat $140 the site quotes
# (components/SupplyBuyBox.jsx) and the same shipping line the existing
# product feed scripts emit — pickup is free on-site and needs no MC pickup
# fields (the existing feed doesn't use them either).
SHIPPING = [{'price': {'value': '140.00', 'currency': 'CAD'}, 'country': 'CA'}]

# Same select set as lib/suppliesCatalog.js SELECT_COLUMNS — `supplier` and
# `supplier_desc` are deliberately excluded (S5 hard rule).
SELECT_COLUMNS = (
    'code, brand, name, description, category, uom, pack_size, coverage_sqft, '
    'length_ft, retail, upc, image_url, attach_default, variant_group, '
    'variant_label, variant_order, stock_tier'
)


def strip_html(s):
    if not s:
        return ''
    return re.sub(r'<[^>]+>', '', s).replace('&amp;', '&').replace('&nbsp;', ' ').strip()


def fetch_rows():
    db = yaml.safe_load(open(f'{WS}/bbs-supabase-db.yaml'))
    conn = psycopg2.connect(host=db['pooler_host'], port=db['pooler_port'],
                             user=db['pooler_user'], password=db['password'], dbname=db['database'])
    cur = conn.cursor()
    cur.execute(f"""
        SELECT {SELECT_COLUMNS}
        FROM supplies
        WHERE active = true
          AND retail_approved = true
          AND discontinued = false
          AND retail IS NOT NULL
          AND image_url IS NOT NULL
          AND image_url <> ''
        ORDER BY category, code
    """)
    cols = [d[0] for d in cur.description]
    rows = [dict(zip(cols, r)) for r in cur.fetchall()]
    conn.close()
    return rows


def load_family_copy():
    path = os.path.join(os.path.dirname(__file__), '..', 'data', 'supplyFamilies.json')
    with open(path) as f:
        return json.load(f)


def build_families(rows):
    """Port of lib/supplyFamilies.js buildFamilies() — slug + primary-member
    selection only (the parts the feed needs). Simplified name fallback: use
    the copy JSON's `name` when present, else the primary member's own DB
    `name` (skips the JS common-label-prefix heuristic — a deliberate
    simplification, see findings/MC-SUPPLIES-FEED-2026-09-13.md)."""
    copy = load_family_copy()
    by_slug = {}
    for r in rows:
        slug = r['variant_group'] or r['code']
        by_slug.setdefault(slug, []).append(r)

    families = {}
    for slug, members in by_slug.items():
        members.sort(key=lambda m: (m['variant_order'] or 0, float(m['retail'])))
        primary = next((m for m in members if m['attach_default']), members[0])
        is_multi = len(members) > 1
        fam_name = (copy.get(slug, {}) or {}).get('name') or primary['name']
        families[slug] = {
            'slug': slug, 'members': members, 'primary': primary,
            'is_multi': is_multi, 'name': fam_name, 'category': primary['category'],
        }
    return families


def family_link(fam, member):
    base = f"{SITE}/flooring-accessories/{fam['slug']}"
    if not fam['is_multi'] or member['code'] == fam['primary']['code']:
        return base
    return f"{base}?v={member['code']}"


def image_link(url):
    """Absolute image URL with the renamed supplies folder applied."""
    for old, new in IMAGE_PATH_REMAP.items():
        if url.startswith(old):
            url = new + url[len(old):]
    if url.startswith('http://') or url.startswith('https://'):
        return url
    return SITE + (url if url.startswith('/') else '/' + url)


def backfill_sql():
    """DB statement to move image_url off the old folder. Run AFTER the branch
    is deployed (the redirect keeps old URLs alive either way)."""
    old, new = next(iter(IMAGE_PATH_REMAP.items()))
    return (f"UPDATE supplies SET image_url = replace(image_url, '{old}', '{new}') "
            f"WHERE image_url LIKE '{old}%';")


def build_entry(fam, member):
    cat = member['category']
    gpc = GPC_BY_CATEGORY.get(cat)
    unmapped = gpc is None
    if unmapped:
        gpc = GPC_FLOORING  # safe fallback — flagged in the run summary, never silently dropped

    title = member['name']
    if fam['is_multi'] and member.get('variant_label'):
        title = f"{fam['name']} — {member['variant_label']}"
    elif member.get('pack_size'):
        title = f"{member['name']}"  # name already carries size for most rows; avoid duplicating

    desc = strip_html(member.get('description'))
    if not desc:
        desc = (f"{member['name']} by {member['brand']} — {CATEGORY_LABEL.get(cat, cat)}. "
                 f"Available at BBS Flooring, 6061 Highway 7, Markham ON. Shop online or visit "
                 f"our showroom.")

    tier = member.get('stock_tier') or 'none'
    availability = 'in stock' if tier in IN_STOCK_TIERS else 'preorder'

    entry = {
        'offerId': member['code'],  # supplies `code` — brief: id = code, mpn = code
        'title': title[:150],
        'description': desc[:5000],
        'link': family_link(fam, member),
        'imageLink': image_link(member['image_url']),
        'contentLanguage': 'en',
        'targetCountry': 'CA',
        'feedLabel': 'CA',
        'channel': 'online',
        'availability': availability,
        'condition': 'new',
        'brand': member['brand'],
        'googleProductCategory': gpc,
        'mpn': member['code'],
        'price': {'value': f"{float(member['retail']):.2f}", 'currency': 'CAD'},
        'productTypes': [f"Flooring Accessories > {CATEGORY_LABEL.get(cat, cat)}"],
        'itemGroupId': fam['slug'],
        'shipping': SHIPPING,
    }
    if member.get('upc'):
        upc = re.sub(r'\D', '', str(member['upc']))
        # UPC-A is 12 digits; supplier lists drop the leading zero (14 rows were
        # 11 digits) -> MC flags "Ambiguous GTIN value". Pad to 12.
        if len(upc) == 11:
            upc = '0' + upc
        if len(upc) in (12, 13, 14):
            entry['gtin'] = upc
    if availability == 'preorder':
        # MC requires availability_date for preorder offers ("Missing attribute
        # [availability_date]"). Order-in stock = longest handling window of the tier.
        from datetime import date, timedelta
        entry['availabilityDate'] = (date.today() + timedelta(days=14)).isoformat() + 'T00:00:00Z'
    entry['_unmapped_category'] = unmapped  # internal flag, stripped before push/print
    return entry


def assert_no_supplier_leak(entries):
    hits = []
    for e in entries:
        for k, v in e.items():
            # serialise so nested values (shipping, productTypes, gtin) are covered too
            blob = v if isinstance(v, str) else json.dumps(v)
            if SUPPLIER_LEAK_RE.search(blob):
                hits.append((e.get('offerId'), k, blob))
    if hits:
        print("\n🚨 SUPPLIER-NAME LEAK DETECTED — ABORTING (hard rule violation):")
        for oid, k, v in hits[:10]:
            print(f"   {oid} / {k}: {v[:80]}")
        sys.exit(2)


def main():
    apply_ = '--apply' in sys.argv[1:]
    if '--sql' in sys.argv[1:]:
        print(backfill_sql())
        return
    sample_n = 5
    if '--sample' in sys.argv[1:]:
        sample_n = int(sys.argv[sys.argv.index('--sample') + 1])

    rows = fetch_rows()
    families = build_families(rows)
    entries = []
    unmapped_cats = set()
    for fam in families.values():
        for member in fam['members']:
            e = build_entry(fam, member)
            if e.pop('_unmapped_category'):
                unmapped_cats.add(fam['category'])
            entries.append(e)

    assert_no_supplier_leak(entries)

    print(f"Supplies rows (active, retail_approved, imaged, sellable): {len(rows)}")
    print(f"Families (item_group_id groups): {len(families)}")
    from collections import Counter
    cats = Counter(r['category'] for r in rows)
    for c, n in sorted(cats.items(), key=lambda x: -x[1]):
        print(f"   {c}: {n} rows (GPC {GPC_BY_CATEGORY.get(c, '?')})")
    if unmapped_cats:
        print(f"⚠️  Unmapped categories (fell back to {GPC_FLOORING}): {sorted(unmapped_cats)}")
    else:
        print("✅ Every category has a GPC mapping — none unmapped.")

    print(f"\n--- sample entries (first {sample_n}) ---")
    for e in entries[:sample_n]:
        print(json.dumps(e, indent=2))

    bad = [e for e in entries if not e.get('imageLink') or not e['price']['value'] or not e.get('brand')]
    if bad:
        print(f"\n⚠️ {len(bad)} entries missing image/price/brand — ABORT (should be 0 given the query).")
        sys.exit(1)

    if not apply_:
        print("\nDRY RUN — re-run with --apply to push to Merchant Center. (Money/public gate: get "
              "Abram's explicit go-ahead first — see findings/MC-SUPPLIES-FEED-2026-09-13.md.)")
        return

    ok = err = 0
    errors = []
    for e in entries:
        r = mc_api.insert(e)
        if r.status_code == 200:
            ok += 1
        else:
            err += 1
            errors.append((e.get('offerId'), r.text))
    print(f"\nPushed OK: {ok} | errors: {err}")
    for oid, errs in errors[:15]:
        print('  ERR', oid, errs)


if __name__ == '__main__':
    main()
