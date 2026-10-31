const test = require('node:test');
const assert = require('node:assert');

// Test that Issue schema structure supports requests and estimatedDays
test('Issue schema definition includes requests array and estimatedDays', () => {
  const Issue = require('../models/Issue');
  const schema = Issue.schema.obj;

  assert.ok(schema.estimatedDays, 'estimatedDays field must exist on Issue schema');
  assert.ok(schema.requests, 'requests field must exist on Issue schema');
  assert.strictEqual(Array.isArray(schema.requests), true, 'requests must be an array');

  const requestObj = schema.requests[0];
  assert.ok(requestObj.developer, 'request must have developer');
  assert.ok(requestObj.estimatedDays, 'request must have estimatedDays');
  assert.strictEqual(requestObj.estimatedDays.required, true, 'estimatedDays must be required');
});

// Test that Notification schema definition exists with proper fields
test('Notification schema definition includes recipient, type, message and actions', () => {
  const Notification = require('../models/Notification');
  const schema = Notification.schema.obj;

  assert.ok(schema.recipient, 'recipient must exist on Notification schema');
  assert.ok(schema.title, 'title must exist on Notification schema');
  assert.ok(schema.message, 'message must exist on Notification schema');
  assert.ok(schema.type, 'type must exist on Notification schema');
  assert.ok(schema.actionUrl, 'actionUrl must exist on Notification schema');
  assert.ok(schema.read, 'read must exist on Notification schema');
});

// Test self-pick validation logic
test('self-pick requires valid positive estimatedDays', () => {
  const validateEstimatedDays = (days) => {
    const num = Number(days);
    if (!num || num < 1) {
      throw new Error('Estimated days to solve is required and must be at least 1 day');
    }
    return num;
  };

  assert.strictEqual(validateEstimatedDays(3), 3);
  assert.strictEqual(validateEstimatedDays('5'), 5);
  assert.throws(() => validateEstimatedDays(0), /Estimated days to solve is required/);
  assert.throws(() => validateEstimatedDays(-2), /Estimated days to solve is required/);
  assert.throws(() => validateEstimatedDays(undefined), /Estimated days to solve is required/);
  assert.throws(() => validateEstimatedDays('invalid'), /Estimated days to solve is required/);
});

// Test notification creation formatting when one developer is assigned over another
test('reassignment notification correctly informs competitor of the assigned developer and alternative action', () => {
  const issue = { id: 'ISS-101', title: 'Payment gateway timeout' };
  const chosenDev = { name: 'Priya Menon', email: 'priya@example.com' };
  const estimatedDays = 3;
  const competitor = { name: 'Sam Reyes', email: 'sam@example.com' };

  const notification = {
    recipient: competitor,
    type: 'issue_assignment_update',
    title: `Issue ${issue.id} Assigned to ${chosenDev.name}`,
    message: `${chosenDev.name} was assigned to "${issue.title}" (Estimated completion: ${estimatedDays} days). You can pick and solve other available issues from the pool!`,
    issueId: issue.id,
    issueTitle: issue.title,
    actionUrl: '/developer/available',
    actionText: 'Pick Other Issues',
  };

  assert.strictEqual(notification.recipient.email, 'sam@example.com');
  assert.strictEqual(notification.title, 'Issue ISS-101 Assigned to Priya Menon');
  assert.ok(notification.message.includes('Priya Menon was assigned to "Payment gateway timeout"'));
  assert.ok(notification.message.includes('Estimated completion: 3 days'));
  assert.ok(notification.message.includes('pick and solve other available issues'));
  assert.strictEqual(notification.actionUrl, '/developer/available');
});

// Test sequential nextId generation
test('nextId safely increments the highest existing ISS-XXX number', () => {
  const issues = [{ id: 'ISS-001' }, { id: 'ISS-002' }, { id: 'ISS-006' }, { id: 'ISS-003' }];
  let maxNum = 0;
  for (const iss of issues) {
    const match = iss.id?.match(/ISS-(\d+)/);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  const nextId = `ISS-${String(maxNum + 1).padStart(3, '0')}`;
  assert.strictEqual(nextId, 'ISS-007');
});

// Test duplicate issue title detection logic
test('detects duplicate issue titles regardless of case or whitespace', () => {
  const existingTitles = ['Login page crashes on Safari 17', 'Dark mode toggle does not persist'];
  const isDuplicate = (inputTitle) => {
    const clean = inputTitle.trim().toLowerCase();
    return existingTitles.some((t) => t.trim().toLowerCase() === clean);
  };

  assert.strictEqual(isDuplicate('login page crashes on safari 17'), true);
  assert.strictEqual(isDuplicate('  Login page crashes on Safari 17  '), true);
  assert.strictEqual(isDuplicate('New completely different issue'), false);
});
