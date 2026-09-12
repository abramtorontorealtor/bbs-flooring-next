# Supplies TDS Sources — S3 (Sep 12 2026)

Every number in `lib/supplyGuides.js` "how to use" steps traces to one of these. Coverage/pack-size facts shown on pages always come from the DB (`supplies.coverage_sqft` / `pack_size`), never these — these sources are only used for technique facts (mix ratio, trowel size, open/cure/dry time) the DB doesn't carry.

| Code | Product | Source | Key facts used |
|---|---|---|---|
| AR630-04 | Henry 630 PeachPro | https://www.wwhenry.com/product/henry-630-peachpro/ | Sq notch 1/16"×1/16"×1/16"; pressure-sensitive (dry to touch) or wet-set; solvent-free |
| ARH695-04 | Henry 695 High-RH | https://www.wwhenry.com/wp-content/uploads/2018/06/HENRY-695-Technical-Data.pdf (snippet); https://www.buildsite.com/pdf/ardex/HENRY-695-High-RH-Vinyl-Flooring-Adhesive-Product-Data-2911268.pdf | 99% RH moisture resistant; dry-to-touch (pressure-sensitive) or wet-set; concrete/plywood/gypsum substrates |
| ECO983-15 | Mapei Ultrabond ECO 983 | https://cdnmedia.mapei.com/docs/.../ultrabond-eco-wood-flooring-installation-systems-en.pdf ; https://www.mapei.com/us/en-us/products-and-solutions/products/detail/ultrabond-eco-983 | Moisture control to 90% RH / 15 lb MVER; special trowel clips for monolithic moisture-control layer; also usable with standard trowel when no moisture issue |
| AR-K-15 | Ardex K 15 | https://chasephipps.com/ardex-k-15-s-l-underlayment-55lb-bg/ (Ardex TDS content) | Prime concrete with Ardex P 51 first; coverage 30 sqft/bag at 1/4"; flow time 10 min; walkable 2–3 hrs; install floor coverings 6–16 hrs after (moisture-insensitive tile/stone 6 hrs, everything else 16 hrs) |
| CLQESL50 | Custom LevelQuik ES | https://www.custombuildingproducts.com/products/levelquik-es-extended-setting-self-leveling-underlayment ; https://www.homehardware.ca/en/levelquik-es-self-levelling-underlayment-227-kg/p/1625367 | Extended-setting (more working time than RS); pours to 1.5" in one shot; self-levels in minutes |
| ARP51-04 | Ardex P 51 Primer | https://chasephipps.com/ardex-p-51-primer-gallon | Mix 1:1 primer:water (standard concrete); 1:3 then 1:1 second coat for extremely absorbent concrete; coverage 400–600 sqft/gal; dry time min 3 hrs, max 24 hrs |
| ARP4-04 | Ardex P 4 | https://www.ardexamericas.com/product/ardex-p-4/ (multipurpose primer, general category knowledge — concrete/wood/gypsum bonding primer ahead of adhesives) | Multipurpose primer for concrete, wood, gypsum before adhesive/leveler |
| ARSDFWT-10 | Ardex Feather Finish | https://discountcontractorsupply.com/products/ardex-sdf-feather-finish-10lb-bag | Mix 10 lb bag with 2.5 qt water (2.4 L); smaller batches 2 parts powder : 1 part water; coverage up to 300 sqft/bag skim coat, 16.7 sqft/bag at 1/4"; install flooring in as fast as 15 min |
| AR-GPS | Ardex GPS | https://www.ardexamericas.com/product/ardex-gps/ (general patch/skimcoat category knowledge) | General-purpose patch & skimcoat, mixes with water only, feather to zero |
| Q70115 | Roberts Moisture Barricade | https://www.robertsconsolidated.com/products/moisture-barricade-polyethylene-film/ ; https://www.amazon.com/Roberts-70-115-Barricade-Underlayment-Polyethylene/dp/B0026T3Q2W | 6-mil poly, Class 1 vapor barrier; built-in adhesive strip for 3" overlaps; roll out, overlap, press |
| M30 | Toolway Wax Paper Underlayment | Standard trade practice for rosin/wax paper under nail-down hardwood (no branded TDS found — generic step language only, no invented numbers) | Staple down, overlap seams ~4", butt against walls |
| AD532P-15 / AT89975 (AcoustiTECH) | AcoustiTECH AD-532+ / LV | prosol.ca category listing (no public TDS found this session) | Generic urethane adhesive / acoustic underlay steps only — no brand-specific numbers invented |

## Recurring buyer-question facts used in FAQ (from demand check, not TDS)
- "Do I need a primer before self-leveler over concrete?" — near-universal yes across Ardex/Custom/Mapei documentation.
- "How thick can I pour a self-leveler in one shot?" — Ardex K15 tapered/rapid; Custom LevelQuik ES to 1.5" in one pour (both cited above).
- "What moisture barrier thickness do I need over concrete?" — 6-mil poly (or thicker) is the number that recurs across independent sources (Reddit DIY, aaflooring.net, wallyscarpet.com) — matches Roberts Moisture Barricade's spec exactly.

## Not fetched this session (generic category copy only, no invented brand numbers)
Floor vents (Fittes, Six Points), installer tools (Bullet Tools, Roberts pull bar/kit), Roberts underlay rolls (First Step/Serenity/Unison), Sika Layer-03, Romus seam sealer, AcoustiTECH LV/AD-532+, Henry 1171N SureLock. These pages use the DB `description`/`supplier_desc` fields + safe generic installation language (e.g. "drop into the joist opening", "roll out with the printed side up") rather than fabricated brand-specific technical claims.
