const test = require('node:test');
const assert = require('node:assert');
const { authorize } = require('../middleware/auth');

function run(roles, user) {
  const req = { user };
  let status = null;
  let body = null;
  let nextCalled = false;
  const res = {
    status(code) { status = code; return this; },
    json(payload) { body = payload; return this; },
  };
  authorize(...roles)(req, res, () => { nextCalled = true; });
  return { status, body, nextCalled };
}

test('allows a user whose role is in the allowed set', () => {
  const r = run(['admin'], { role: 'admin' });
  assert.strictEqual(r.nextCalled, true);
  assert.strictEqual(r.status, null);
});

test('403s a user whose role is not allowed', () => {
  const r = run(['admin'], { role: 'developer' });
  assert.strictEqual(r.nextCalled, false);
  assert.strictEqual(r.status, 403);
  assert.strictEqual(r.body.message, 'Insufficient permissions');
});

test('403s when there is no authenticated user', () => {
  const r = run(['admin'], undefined);
  assert.strictEqual(r.nextCalled, false);
  assert.strictEqual(r.status, 403);
});

test('supports multiple allowed roles', () => {
  assert.strictEqual(run(['admin', 'developer'], { role: 'developer' }).nextCalled, true);
  assert.strictEqual(run(['admin', 'developer'], { role: 'user' }).status, 403);
});
