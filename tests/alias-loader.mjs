// Test-only module loader: maps the Next.js `@/` path alias to the repo root so
// `node:test` can import app modules that use `@/lib/...` specifiers.
// Usage: node --import ./tests/alias-loader.mjs --test ...
import { register } from 'node:module';

register('./alias-hooks.mjs', import.meta.url);
