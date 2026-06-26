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
export const _internals = { looksLikeGibberish, looksLikeDotStuffedGmail };
