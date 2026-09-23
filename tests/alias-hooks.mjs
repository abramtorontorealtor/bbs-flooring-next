// Resolve hook for tests/alias-loader.mjs. `@/foo` → <repo>/foo, appending
// `.js` / `.jsx` / `/index.js` when the specifier is extensionless.
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CANDIDATES = ['', '.js', '.mjs', '.jsx', '/index.js', '/index.mjs'];

function isFile(p) {
  try { return statSync(p).isFile(); } catch { return false; }
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const base = path.join(ROOT, specifier.slice(2));
    for (const suffix of CANDIDATES) {
      const candidate = base + suffix;
      if (existsSync(candidate) && isFile(candidate)) {
        return nextResolve(pathToFileURL(candidate).href, context);
      }
    }
  }
  return nextResolve(specifier, context);
}
