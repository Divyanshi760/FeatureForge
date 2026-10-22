const test = require('node:test');
const assert = require('node:assert');
const { computePriority } = require('../models/Issue');

test('computePriority maps report counts to tiers at the boundaries', () => {
  assert.strictEqual(computePriority(1), 'low');
  assert.strictEqual(computePriority(2), 'medium');
  assert.strictEqual(computePriority(4), 'medium');
  assert.strictEqual(computePriority(5), 'high');
  assert.strictEqual(computePriority(9), 'high');
  assert.strictEqual(computePriority(10), 'critical');
  assert.strictEqual(computePriority(14), 'critical');
});
