import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { test } from 'node:test';

const require = createRequire(import.meta.url);

test('require() and import resolve to the same public API', async () => {
  const cjs = require('@dayflow/blossom-color-picker');
  const esm = await import('@dayflow/blossom-color-picker');

  assert.equal(typeof cjs.BlossomColorPicker, 'function');
  assert.equal(typeof cjs.ChromePicker, 'function');
  assert.deepEqual(Object.keys(cjs).toSorted(), Object.keys(esm).toSorted());
});
