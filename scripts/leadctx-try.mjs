// Live try of lib/leadContext.js against prod Supabase (read-only).
// usage: node scripts/leadctx-try.mjs <phone> <email> [visitor_id] [session_id] [address] [postal]
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { buildLeadContext } from '../lib/leadContext.js';

const y = readFileSync('/home/ubuntu/.openclaw/workspace/supabase-creds.yaml', 'utf8');
const get = (k) => (y.match(new RegExp(`^${k}:\\s*["']?([^"'\\n]+)`, 'm')) || [])[1];
const sb = createClient(get('url'), get('jwt'), { auth: { persistSession: false } });
const [phone, email, visitor_id, session_id, address, postal_code] = process.argv.slice(2);
const t0 = Date.now();
const r = await buildLeadContext(sb, { phone, email, visitor_id, session_id, address, postal_code }, { budgetMs: Number(process.env.BUDGET || 5000) });
console.log(`-- ${Date.now() - t0}ms timedOut=${r.timedOut} sections=${r.sections.join(',')} chars=${r.text.length}\n`);
console.log(r.text);
