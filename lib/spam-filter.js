/**
 * Lead spam filter — heuristics to silently drop obvious bot submissions
 * on /api/contact (and other lead endpoints).
 *
 * Goal: catch the gibberish-name / dot-stuffed-gmail / random-string-message
 * bot signature WITHOUT adding any friction (no CAPTCHA) and WITHOUT ever
 * rejecting a real customer. Tuned conservatively — when unsure, ALLOW.
 *
 * Real examples that must be blocked (observed Jun 2026):
 *   name "wzbYiKfrsNLxhlmwiGbgiu"  email "ch.ap.pa5.2.6.7@gmail.com"  msg "XAnbbeunwoUFcOPuSMAp"
 *   name "BjvssmebbHpmcxOkPfyiGOF" email "ji.n.eda.ha.k.81@gmail.com"  msg "rtbqQZkdhYiTekRFfBA"
 *   name "RyLCCTJkhHvkVJiZAJaphX"  email "nt.as.e.ff@gmail.com"
 * Real leads that must pass:
 *   name "Jared Honquest" email "j.honquest@gatherup-llc.com"
 *   name "Abram Girgis"   email "info@bbsflooring.ca"
 */

// A "word" that looks like random keyboard mashing: long, no spaces,
// many case transitions, no vowel rhythm. Used for name + message checks.
function looksLikeGibberish(str) {
  if (!str) return false;
  const s = String(str).trim();
  if (s.length < 10) return false;            // too short to judge — allow
  if (/\s/.test(s)) return false;             // has spaces → real names/messages have spaces
  const letters = s.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 8) return false;
  // Count lower→upper / upper→lower transitions. "wzbYiKfrsNL..." has many.
  let caseShifts = 0;
  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1], b = s[i];
    if (/[a-z]/.test(a) && /[A-Z]/.test(b)) caseShifts++;
    if (/[A-Z]/.test(a) && /[a-z]/.test(b)) caseShifts++;
  }
  // Vowel ratio — random strings are usually consonant-heavy.
  const vowels = (letters.match(/[aeiouAEIOU]/g) || []).length;
  const vowelRatio = vowels / letters.length;
  // Mixed case AND many case shifts AND consonant-heavy = mashing.
  const hasUpper = /[A-Z]/.test(s);
  const hasLower = /[a-z]/.test(s);
  if (hasUpper && hasLower && caseShifts >= 4 && vowelRatio < 0.35) return true;
  // Single long token, consonant-heavy, no spaces (e.g. all-caps junk) → likely junk.
  if (s.length >= 14 && vowelRatio < 0.28) return true;
  return false;
}

// Oct 2026 bot wave: TWO-word "names" built from random consonant soup,
// paired with harvested-but-real emails and US phone numbers, submitted via
// the removal estimators (which build their own message, so the message
// check never fires). Observed: "Gjsmomx Resagre", "Dupivipj Vrvlar",
// "Wyuixf Ojvxkpllm", "Xqtqyy Xhwff", "Ebqd Sbensprwj", "Exanfqo Tgezcmx",
// "Nuxeg Xrnjpz". Real names that MUST pass: Krzysztof Wojciechowski,
// Przybylski, Szczepanski, Iqbal, Tariq, Nguyen, Sultan Abu Lteif, Mcnutt,
// Hajariwala, Hobson-Garcia, Schmidt, Strzelecki.
// Per-token signals (y counts as a vowel so Polish names stay clean):
//   consonant run >= 4, vowel ratio < 0.2, q wedged between consonants,
//   impossible start/end/inner bigrams. A token with >= 3 signals is junk on
//   its own; a multi-token name where EVERY token trips >= 1 signal, one
//   trips >= 2, and some token has an impossible letter pair is junk.
//   Anything less → allow (Srdjan Krstic is consonant-heavy but real).
const BAD_START = new Set(['gj', 'tg', 'xq', 'xr', 'xh', 'bq', 'jv', 'nx', 'kx', 'xk', 'qx', 'zx', 'jz', 'pj', 'vx', 'xf', 'qt', 'qy', 'fq', 'wj']);
const BAD_END = new Set(['pj', 'xf', 'wj', 'mx', 'jp', 'qd', 'zx', 'jz', 'xq', 'vx', 'qt', 'qy', 'gj', 'fq', 'bq', 'xk', 'jv']);
const BAD_INNER = new Set(['xq', 'qt', 'qy', 'bq', 'jv', 'vx', 'xk', 'jp', 'pj', 'xf', 'fq', 'wj', 'jz', 'zx', 'gj', 'qd', 'kpl', 'cmx', 'nfq', 'tqy']);

function tokenSignals(token) {
  const t = String(token || '').toLowerCase().replace(/[^a-z]/g, '');
  if (t.length < 4) return 0;
  let signals = 0;
  const isVowel = (c) => 'aeiouy'.includes(c);
  // 1. Consonant run >= 4
  let run = 0, maxRun = 0;
  for (const c of t) { run = isVowel(c) ? 0 : run + 1; if (run > maxRun) maxRun = run; }
  if (maxRun >= 4) signals++;
  // 2. Vowel-starved
  const vowels = [...t].filter(isVowel).length;
  if (vowels / t.length < 0.2) signals++;
  // 3. q between consonants (Iqbal/Tariq/Qin are vowel-adjacent → safe)
  for (let i = 0; i < t.length; i++) {
    if (t[i] !== 'q') continue;
    const prev = t[i - 1], next = t[i + 1];
    if (prev && next && !isVowel(prev) && !isVowel(next)) { signals++; break; }
  }
  // 4. Impossible bigrams
  if (BAD_START.has(t.slice(0, 2))) signals++;
  if (BAD_END.has(t.slice(-2))) signals++;
  let inner = false;
  for (let i = 0; i < t.length - 1 && !inner; i++) {
    if (BAD_INNER.has(t.slice(i, i + 2)) || BAD_INNER.has(t.slice(i, i + 3))) inner = true;
  }
  if (inner) signals++;
  return signals;
}

// Does the token contain an impossible letter pair (as opposed to merely being
// consonant-heavy, which Serbian/Polish names legitimately are)?
function tokenHasBadBigram(token) {
  const t = String(token || '').toLowerCase().replace(/[^a-z]/g, '');
  if (t.length < 4) return false;
  if (BAD_START.has(t.slice(0, 2)) || BAD_END.has(t.slice(-2))) return true;
  for (let i = 0; i < t.length - 1; i++) {
    if (BAD_INNER.has(t.slice(i, i + 2)) || BAD_INNER.has(t.slice(i, i + 3))) return true;
    const c = t[i], prev = t[i - 1], next = t[i + 1];
    if (c === 'q' && prev && next && !'aeiouy'.includes(prev) && !'aeiouy'.includes(next)) return true;
  }
  return false;
}

function looksLikeConsonantSoupName(name) {
  if (!name) return false;
  const tokens = String(name).trim().split(/[\s\-]+/).filter((w) => w.replace(/[^a-zA-Z]/g, '').length >= 4);
  if (!tokens.length) return false;
  const scores = tokens.map(tokenSignals);
  if (scores.some((s) => s >= 3)) return true;
  // Multi-token: every token suspicious, one strongly so, AND at least one
  // impossible letter pair somewhere (Srdjan Krstic is consonant-heavy but
  // every pair is real; Dupivipj Vrvlar ends in "pj").
  if (tokens.length >= 2 && scores.every((s) => s >= 1) && scores.some((s) => s >= 2) && tokens.some(tokenHasBadBigram)) return true;
  return false;
}

// Gmail dot-stuffing abuse: Gmail ignores dots, so bots generate infinite
// aliases like "ch.ap.pa5.2.6.7@gmail.com". A real gmail local-part rarely
// has 4+ dot-separated single/double-char fragments.
function looksLikeDotStuffedGmail(email) {
  if (!email) return false;
  const m = String(email).toLowerCase().match(/^([^@]+)@(gmail|googlemail)\.com$/);
  if (!m) return false;
  const local = m[1];
  const dotCount = (local.match(/\./g) || []).length;
  if (dotCount < 3) return false;             // normal gmails have 0–2 dots
  const frags = local.split('.');
  const tiny = frags.filter((f) => f.length <= 2).length;
  // 4+ dots OR mostly tiny fragments = synthetic alias pattern.
  if (dotCount >= 4) return true;
  if (tiny >= Math.ceil(frags.length / 2)) return true;
  return false;
}

/**
 * Returns { spam: boolean, reason: string|null }.
 * Conservative: only flags when the signature is strong.
 */
export function detectSpamLead({ name, email, phone, message, honeypot } = {}) {
  // 1. Honeypot — any value here means a bot filled a hidden field.
  if (honeypot && String(honeypot).trim().length > 0) {
    return { spam: true, reason: 'honeypot' };
  }

  // 2. Name is a gibberish single token.
  if (looksLikeGibberish(name)) {
    return { spam: true, reason: 'gibberish_name' };
  }

  // 2b. Multi-word consonant-soup name (Oct 2026 estimator bot wave).
  if (looksLikeConsonantSoupName(name)) {
    return { spam: true, reason: 'consonant_soup_name' };
  }

  // 3. Dot-stuffed gmail alias + (gibberish name OR gibberish message).
  if (looksLikeDotStuffedGmail(email) && (looksLikeGibberish(name) || looksLikeGibberish(message))) {
    return { spam: true, reason: 'dotstuffed_gmail_plus_gibberish' };
  }

  // 4. Message is a single gibberish token AND name is also suspicious/short.
  if (looksLikeGibberish(message) && (looksLikeGibberish(name) || looksLikeDotStuffedGmail(email))) {
    return { spam: true, reason: 'gibberish_message' };
  }

  // 5. Email embedded in the name field (common bot artifact).
  if (name && /@.+\..+/.test(String(name)) && /https?:\/\/|www\./i.test(String(name + ' ' + (message || '')))) {
    return { spam: true, reason: 'email_and_url_in_name' };
  }

  return { spam: false, reason: null };
}

// Exported for unit-style sanity checks / reuse.
export const _internals = { looksLikeGibberish, looksLikeDotStuffedGmail, looksLikeConsonantSoupName, tokenSignals };
