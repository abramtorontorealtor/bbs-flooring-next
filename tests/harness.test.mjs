import { test } from 'node:test';
import assert from 'node:assert/strict';

test('harness: node:test runs', () => {
  assert.equal(1 + 1, 2);
});

test('harness: @/ alias resolves to repo root', async () => {
  const mod = await import('@/tests/fixtures/alias-target.mjs');
  assert.equal(mod.ALIAS_OK, true);
});
