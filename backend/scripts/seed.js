const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const User = require('../models/User');
const Issue = require('../models/Issue');
const Flag = require('../models/Flag');
const Rollout = require('../models/Rollout');
const Approval = require('../models/Approval');
const Experiment = require('../models/Experiment');
const AuditLog = require('../models/AuditLog');
const Breakglass = require('../models/Breakglass');
const Setting = require('../models/Setting');
const Notification = require('../models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/featureforge';

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Issue.deleteMany({}),
      Flag.deleteMany({}),
      Rollout.deleteMany({}),
      Approval.deleteMany({}),
      Experiment.deleteMany({}),
      AuditLog.deleteMany({}),
      Breakglass.deleteMany({}),
      Setting.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('Collections cleared.');

    console.log('Seeding users...');
    const users = [
      { name: 'Administrator', email: 'admin@gmail.com', password: 'password123', role: 'admin', avatar: 'AD', status: 'active', owner: true, scope: 'Project-wide' },
      { name: 'Ada Ofori', email: 'ada@example.com', password: 'password123', role: 'admin', avatar: 'AO', status: 'active', owner: false, scope: 'Project-wide' },
      { name: 'Xavier Yung', email: 'xyz@example.com', password: 'password123', role: 'admin', avatar: 'XY', status: 'active', owner: false, scope: 'Project-wide' },

      { name: 'Dana Walsh', email: 'dana@example.com', password: 'password123', role: 'developer', avatar: 'DW', status: 'occupied', specialty: 'Frontend', activeIssues: 1, resolvedTotal: 14, currentIssue: 'ISS-001', joinedAt: new Date('2026-03-15T00:00:00Z') },
      { name: 'Sam Reyes', email: 'sam@example.com', password: 'password123', role: 'developer', avatar: 'SR', status: 'occupied', specialty: 'Backend', activeIssues: 1, resolvedTotal: 22, currentIssue: 'ISS-002', joinedAt: new Date('2026-01-10T00:00:00Z') },
      { name: 'Lee Nakamura', email: 'lee@example.com', password: 'password123', role: 'developer', avatar: 'LN', status: 'occupied', specialty: 'Infrastructure', activeIssues: 1, resolvedTotal: 9, currentIssue: 'ISS-005', joinedAt: new Date('2026-06-01T00:00:00Z') },
      { name: 'Priya Menon', email: 'priya@example.com', password: 'password123', role: 'developer', avatar: 'PM', status: 'free', specialty: 'Full Stack', activeIssues: 0, resolvedTotal: 18, currentIssue: null, joinedAt: new Date('2026-02-20T00:00:00Z') },

      { name: 'Riya Sharma', email: 'riya@example.com', password: 'password123', role: 'user', avatar: 'RS', status: 'active' },
      { name: 'Arjun Patel', email: 'arjun@example.com', password: 'password123', role: 'user', avatar: 'AP', status: 'active' },
      { name: 'Meera Joshi', email: 'meera@example.com', password: 'password123', role: 'user', avatar: 'MJ', status: 'active' },
      { name: 'Vikram Singh', email: 'vikram@example.com', password: 'password123', role: 'user', avatar: 'VS', status: 'active' },
      { name: 'Neha Kapoor', email: 'neha@example.com', password: 'password123', role: 'user', avatar: 'NK', status: 'active' },
    ];

    for (const u of users) {
      await User.create(u);
    }
    console.log(`Seeded ${users.length} users.`);

    // reportCount drives the auto-computed priority (>=10 critical, >=5 high, >=2 medium).
    console.log('Seeding issues...');
    const issuesData = [
      {
        id: 'ISS-001',
        title: 'Login page crashes on Safari 17',
        description: 'When attempting to login using Safari 17 on macOS Sonoma, the page becomes unresponsive after submitting credentials. Console shows a TypeError related to the fetch API polyfill.',
        reportCount: 14,
        reporters: [
          { id: 'user-1', name: 'Riya Sharma', email: 'riya@example.com' },
          { id: 'user-2', name: 'Arjun Patel', email: 'arjun@example.com' },
          { id: 'user-4', name: 'Vikram Singh', email: 'vikram@example.com' },
          { id: 'user-5', name: 'Neha Kapoor', email: 'neha@example.com' },
        ],
        status: 'assigned',
        reportedBy: { id: 'user-1', name: 'Riya Sharma', email: 'riya@example.com' },
        assignedTo: { id: 'dev-1', name: 'Dana Walsh', email: 'dana@example.com' },
        assignmentType: 'admin_assigned',
        adminApproved: true,
        createdAt: new Date('2026-10-20T09:15:00Z'),
        updatedAt: new Date('2026-10-21T14:30:00Z'),
      },
      {
        id: 'ISS-002',
        title: 'Dark mode toggle does not persist across sessions',
        description: 'Users report that the dark mode preference resets to light mode every time they close and reopen the browser. The setting should be stored in localStorage.',
        reportCount: 3,
        reporters: [
          { id: 'user-2', name: 'Arjun Patel', email: 'arjun@example.com' },
          { id: 'user-5', name: 'Neha Kapoor', email: 'neha@example.com' },
        ],
        status: 'in_progress',
        reportedBy: { id: 'user-2', name: 'Arjun Patel', email: 'arjun@example.com' },
        assignedTo: { id: 'dev-2', name: 'Sam Reyes', email: 'sam@example.com' },
        assignmentType: 'self_picked',
        adminApproved: true,
        createdAt: new Date('2026-10-18T11:20:00Z'),
        updatedAt: new Date('2026-10-22T10:00:00Z'),
      },
      {
        id: 'ISS-003',
        title: 'API rate limiting returns wrong error code',
        description: 'When rate limit is exceeded, the API returns 500 instead of 429. This confuses client-side retry logic and causes infinite retry loops.',
        reportCount: 7,
        reporters: [
          { id: 'user-3', name: 'Meera Joshi', email: 'meera@example.com' },
          { id: 'user-1', name: 'Riya Sharma', email: 'riya@example.com' },
          { id: 'user-4', name: 'Vikram Singh', email: 'vikram@example.com' },
        ],
        status: 'open',
        reportedBy: { id: 'user-3', name: 'Meera Joshi', email: 'meera@example.com' },
        assignedTo: null,
        assignmentType: null,
        adminApproved: false,
        requests: [
          {
            developer: { id: 'dev-4', name: 'Priya Menon', email: 'priya@example.com' },
            estimatedDays: 2,
            note: 'I can refactor the middleware and add test coverage in 2 days.',
            requestedAt: new Date('2026-10-22T14:30:00Z'),
            status: 'pending',
          },
          {
            developer: { id: 'dev-2', name: 'Sam Reyes', email: 'sam@example.com' },
            estimatedDays: 4,
            note: 'Need to inspect the Redis rate limiter cluster configuration.',
            requestedAt: new Date('2026-10-22T15:10:00Z'),
            status: 'pending',
          },
        ],
        selfPickRequest: {
          requestedBy: { id: 'dev-4', name: 'Priya Menon', email: 'priya@example.com' },
          estimatedDays: 2,
          requestedAt: new Date('2026-10-22T14:30:00Z'),
        },
        createdAt: new Date('2026-10-22T08:45:00Z'),
        updatedAt: new Date('2026-10-22T08:45:00Z'),
      },
      {
        id: 'ISS-005',
        title: 'Email notifications arriving with 6-hour delay',
        description: 'Transactional emails (password reset, approval notifications) are delayed by up to 6 hours. The queue processor seems to be throttled incorrectly.',
        reportCount: 8,
        reporters: [
          { id: 'user-4', name: 'Vikram Singh', email: 'vikram@example.com' },
          { id: 'user-2', name: 'Arjun Patel', email: 'arjun@example.com' },
          { id: 'user-3', name: 'Meera Joshi', email: 'meera@example.com' },
        ],
        status: 'assigned',
        reportedBy: { id: 'user-4', name: 'Vikram Singh', email: 'vikram@example.com' },
        assignedTo: { id: 'dev-3', name: 'Lee Nakamura', email: 'lee@example.com' },
        assignmentType: 'admin_assigned',
        adminApproved: true,
        createdAt: new Date('2026-10-19T13:00:00Z'),
        updatedAt: new Date('2026-10-20T09:20:00Z'),
      },
      {
        id: 'ISS-006',
        title: 'Mobile menu overlay blocks scroll on iOS',
        description: 'On iOS devices, when the mobile hamburger menu is opened and then closed, the underlying page scroll remains locked. Users have to refresh to regain scroll.',
        reportCount: 1,
        reporters: [
          { id: 'user-2', name: 'Arjun Patel', email: 'arjun@example.com' },
        ],
        status: 'resolved',
        reportedBy: { id: 'user-2', name: 'Arjun Patel', email: 'arjun@example.com' },
        assignedTo: { id: 'dev-1', name: 'Dana Walsh', email: 'dana@example.com' },
        assignmentType: 'self_picked',
        adminApproved: true,
        createdAt: new Date('2026-10-15T10:30:00Z'),
        updatedAt: new Date('2026-10-19T17:45:00Z'),
      },
      {
        id: 'ISS-008',
        title: 'Search results not updating on filter change',
        description: 'When changing the filter dropdown on the flags search page, results are not re-fetched. User has to manually clear and re-type the search query.',
        reportCount: 1,
        reporters: [
          { id: 'user-3', name: 'Meera Joshi', email: 'meera@example.com' },
        ],
        status: 'closed',
        reportedBy: { id: 'user-3', name: 'Meera Joshi', email: 'meera@example.com' },
        assignedTo: { id: 'dev-2', name: 'Sam Reyes', email: 'sam@example.com' },
        assignmentType: 'admin_assigned',
        adminApproved: true,
        createdAt: new Date('2026-10-10T09:00:00Z'),
        updatedAt: new Date('2026-10-17T14:00:00Z'),
      },
    ];

    for (const item of issuesData) {
      await Issue.create(item);
    }
    console.log(`Seeded ${issuesData.length} issues with auto-priority.`);

    console.log('Seeding feature flags...');
    const flagsData = [
      { name: 'checkout-redesign', key: 'checkout_redesign_v2', type: 'Experiment', on: false, rollout: 0, by: 'guard', when: '18m ago', description: 'Bound to an experiment. Variants split by weight and results gate on sample size before a winner is called.', envs: { dev: true, staging: true, prod: false }, variants: [{ name: 'control', weight: 50 }, { name: 'variant-b', weight: 50 }] },
      { name: 'payments-retry', key: 'payments_retry', type: 'Release', on: true, rollout: 20, by: 'sam@example.com', when: '1h ago', description: 'Gradual release flag. Rolled out by percentage with deterministic, sticky bucketing per user.', envs: { dev: true, staging: true, prod: true }, rules: [{ attr: 'country', op: 'in', value: 'US, CA, GB' }, { attr: 'plan', op: '=', value: 'enterprise' }] },
      { name: 'new-nav', key: 'new_nav', type: 'Release', on: true, rollout: 10, by: 'lee@example.com', when: '12m ago', description: 'Gradual release flag. Rolled out by percentage with deterministic, sticky bucketing per user.', envs: { dev: true, staging: true, prod: true } },
      { name: 'search-ranking-v2', key: 'search_ranking_v2', type: 'Experiment', on: true, rollout: 100, by: 'ada@example.com', when: '1h ago', description: 'Bound to an experiment. Variants split by weight and results gate on sample size before a winner is called.', envs: { dev: true, staging: true, prod: true }, variants: [{ name: 'control', weight: 50 }, { name: 'variant-b', weight: 50 }] },
      { name: 'onboarding-tour', key: 'onboarding_tour', type: 'Release', on: true, rollout: 50, by: 'ada@example.com', when: '3h ago', description: 'Gradual release flag. Rolled out by percentage with deterministic, sticky bucketing per user.', envs: { dev: true, staging: true, prod: true } },
      { name: 'payments-kill', key: 'payments_kill', type: 'Ops', on: true, rollout: 0, by: 'sam@example.com', when: '8h ago', description: 'Operational kill switch. Exempt from approval so it can be flipped fast in an incident.', envs: { dev: true, staging: true, prod: true } },
    ];

    await Flag.insertMany(flagsData);
    console.log(`Seeded ${flagsData.length} feature flags.`);

    console.log('Seeding rollouts...');
    const rolloutsData = [
      {
        id: 'RO-52',
        flag: 'payments-retry',
        key: 'payments_retry',
        env: 'prod',
        rollout: 20,
        startedLabel: 'ramping 1h',
        trend: 'healthy',
        metric: { key: 'error_rate', label: 'Error rate', unit: '%', threshold: 3, control: 0.9, variant: 1.1, noise: 0.35, windowLabel: '60s', windowsToRollback: 2, minSample: 200 },
        rollbacks: [],
      },
      {
        id: 'RO-54',
        flag: 'new-nav',
        key: 'new_nav',
        env: 'prod',
        rollout: 10,
        startedLabel: 'ramping 12m',
        trend: 'degrading',
        metric: { key: 'error_rate', label: 'Error rate', unit: '%', threshold: 3, control: 1, variant: 2.1, noise: 0.3, windowLabel: '60s', windowsToRollback: 3, minSample: 200 },
        rollbacks: [],
      },
      {
        id: 'RO-49',
        flag: 'checkout-redesign',
        key: 'checkout_redesign_v2',
        env: 'prod',
        rollout: 0,
        startedLabel: 'disabled 18m ago',
        trend: 'rolled_back',
        metric: { key: 'error_rate', label: 'Error rate', unit: '%', threshold: 3, control: 0.9, variant: 4.8, noise: 0.3, windowLabel: '60s', windowsToRollback: 2, minSample: 200 },
        rollbacks: [
          {
            at: '18m ago',
            reason: 'Error rate hit 4.8% against control at 0.9%, over the 3.0% threshold for two windows in a row.',
            detail: 'The flag was disabled and the new config pushed to every SDK.',
          },
        ],
      },
    ];

    await Rollout.insertMany(rolloutsData);
    console.log(`Seeded ${rolloutsData.length} rollouts.`);

    console.log('Seeding change requests...');
    const approvalsData = [
      {
        id: 'CR-418',
        flag: 'payments-retry',
        key: 'payments_retry',
        type: 'Release',
        env: 'prod',
        requestedBy: 'sam@example.com',
        requestedAt: '12m ago',
        status: 'pending',
        needed: 2,
        approvals: [],
        summary: 'Raise rollout after a clean canary on 20%.',
        diff: [
          { field: 'rolloutPercent', before: '20', after: '35' },
          { field: 'state', before: 'on', after: 'on' },
        ],
      },
      {
        id: 'CR-416',
        flag: 'onboarding-tour',
        key: 'onboarding_tour',
        type: 'Release',
        env: 'prod',
        requestedBy: 'lee@example.com',
        requestedAt: '2h ago',
        status: 'pending',
        needed: 2,
        approvals: ['ada@example.com'],
        summary: 'Push the tour from half of prod traffic up to three quarters.',
        diff: [{ field: 'rolloutPercent', before: '50', after: '75' }],
      },
      {
        id: 'CR-412',
        flag: 'search-ranking-v2',
        key: 'search_ranking_v2',
        type: 'Experiment',
        env: 'prod',
        requestedBy: 'dana@example.com',
        requestedAt: '5h ago',
        status: 'approved',
        needed: 2,
        approvals: ['ada@example.com', 'xyz@example.com'],
        summary: 'Ship the winning variant to everyone.',
        diff: [
          { field: 'rolloutPercent', before: '50', after: '100' },
          { field: 'winner', before: null, after: 'variant-b' },
        ],
      },
      {
        id: 'CR-409',
        flag: 'new-nav',
        key: 'new_nav',
        type: 'Release',
        env: 'prod',
        requestedBy: 'sam@example.com',
        requestedAt: '1d ago',
        status: 'rejected',
        needed: 2,
        approvals: [],
        summary: 'Expand the new nav to a quarter of traffic.',
        diff: [{ field: 'rolloutPercent', before: '10', after: '25' }],
      },
    ];

    await Approval.insertMany(approvalsData);
    console.log(`Seeded ${approvalsData.length} change requests.`);

    console.log('Seeding experiments...');
    const experimentsData = [
      {
        id: 'EXP-29',
        name: 'search-ranking-v2',
        flag: 'search-ranking-v2',
        key: 'search_ranking_v2',
        metric: 'result_click',
        metricLabel: 'Result click-through',
        startedLabel: 'Started Oct 14',
        minSampleSize: 6000,
        horizon: { type: 'sample', target: 10000, dateLabel: 'Oct 23' },
        variants: [
          { name: 'control', exposures: 12040, conversions: 3130 },
          { name: 'variant-b', exposures: 11920, conversions: 3451 },
        ],
      },
      {
        id: 'EXP-33',
        name: 'checkout-redesign',
        flag: 'checkout-redesign',
        key: 'checkout_redesign_v2',
        metric: 'checkout_complete',
        metricLabel: 'Checkout completion',
        startedLabel: 'Started Oct 18',
        minSampleSize: 5000,
        horizon: { type: 'sample', target: 5000, dateLabel: 'Oct 26' },
        variants: [
          { name: 'control', exposures: 3105, conversions: 402 },
          { name: 'variant-b', exposures: 3048, conversions: 431 },
        ],
      },
      {
        id: 'EXP-36',
        name: 'onboarding-tour',
        flag: 'onboarding-tour',
        key: 'onboarding_tour',
        metric: 'signup_complete',
        metricLabel: 'Signup completion',
        startedLabel: 'Not started',
        draft: true,
        minSampleSize: 5000,
        horizon: { type: 'sample', target: 8000, dateLabel: 'TBD' },
        variants: [
          { name: 'control', exposures: 0, conversions: 0 },
          { name: 'variant-b', exposures: 0, conversions: 0 },
        ],
      },
    ];

    await Experiment.insertMany(experimentsData);
    console.log(`Seeded ${experimentsData.length} experiments.`);

    console.log('Seeding audit log...');
    const auditData = [
      {
        id: 'AUD-0005',
        action: 'auto_rollback',
        actor: 'system',
        system: true,
        flag: 'checkout-redesign',
        key: 'checkout_redesign_v2',
        env: 'prod',
        day: 'Today',
        at: '09:12',
        when: '18m ago',
        summary: 'Error rate crossed the threshold for 2 consecutive windows. Flag disabled and pushed to every SDK.',
        diff: [
          { field: 'state', before: 'on', after: 'off' },
          { field: 'rolloutPercent', before: '35', after: '0' },
        ],
        note: 'Window: err 4.8% vs control 0.9% (threshold 3.0%) · 2/2 breaches',
      },
      {
        id: 'AUD-0004',
        action: 'approval',
        actor: 'xyz@example.com',
        flag: 'search-ranking-v2',
        key: 'search_ranking_v2',
        env: 'prod',
        day: 'Today',
        at: '08:03',
        when: '1h ago',
        summary: 'CR-412 approved and applied after reaching 2 approvals.',
        diff: [
          { field: 'rolloutPercent', before: '50', after: '100' },
          { field: 'winner', before: null, after: 'variant-b' },
        ],
        note: 'Reviewers: ada@example.com, xyz@example.com',
      },
      {
        id: 'AUD-0003',
        action: 'config_change',
        actor: 'ada@example.com',
        flag: 'onboarding-tour',
        key: 'onboarding_tour',
        env: 'prod',
        day: 'Today',
        at: '06:41',
        when: '3h ago',
        summary: 'Rollout raised on onboarding-tour after four-eyes review.',
        diff: [{ field: 'rolloutPercent', before: '25', after: '50' }],
        note: 'Applied via CR-410',
      },
      {
        id: 'AUD-0002',
        action: 'break_glass',
        actor: 'sam@example.com',
        flag: 'payments-kill',
        key: 'payments_kill',
        env: 'prod',
        day: 'Today',
        at: '01:10',
        when: '8h ago',
        summary: 'Break-glass session BG-77 granted for 60m, bypassing approval.',
        diff: [{ field: 'access', before: 'none', after: 'granted · 60m' }],
        note: 'Reason: "PSP returning 5xx, need to flip the kill switch now"',
      },
      {
        id: 'AUD-0001',
        action: 'ops_toggle',
        actor: 'sam@example.com',
        flag: 'payments-kill',
        key: 'payments_kill',
        env: 'prod',
        day: 'Today',
        at: '01:11',
        when: '8h ago',
        summary: 'Kill switch payments-kill switched on under an active break-glass session.',
        diff: [{ field: 'state', before: 'off', after: 'on' }],
        note: 'Ops flag · exempt from approval · session BG-77',
      },
    ];

    await AuditLog.insertMany(auditData);
    console.log(`Seeded ${auditData.length} audit log entries.`);

    console.log('Seeding break-glass sessions...');
    const now = Date.now();
    const mins = (m) => m * 60 * 1000;
    const breakglassData = [
      {
        id: 'BG-77',
        user: 'sam@example.com',
        flag: 'payments-kill',
        key: 'payments_kill',
        env: 'prod',
        reason: "The payment provider is throwing 5xx all over checkout. I need to flip the kill switch now, there isn't time to wait on a second reviewer.",
        grantedLabel: '18m ago',
        durationMin: 60,
        grantedAt: new Date(now - mins(18)),
        expiresAt: new Date(now + mins(42)),
        status: 'active',
        used: 'Enabled payments-kill · 1 change under this session',
      },
      {
        id: 'BG-71',
        user: 'sam@example.com',
        flag: 'payments-kill',
        key: 'payments_kill',
        env: 'prod',
        reason: 'Payment provider outage, had to hit the emergency kill switch.',
        durationMin: 120,
        status: 'expired',
        endedLabel: 'Yesterday 14:03',
        closedBy: 'auto-revoked at expiry',
        changes: 2,
        grantedAt: new Date(now - mins(1440)),
        expiresAt: new Date(now - mins(1320)),
      },
      {
        id: 'BG-68',
        user: 'dana@example.com',
        flag: 'checkout-redesign',
        key: 'checkout_redesign_v2',
        env: 'prod',
        reason: 'Manual rollback while the guard threshold was being retuned.',
        durationMin: 60,
        status: 'revoked',
        endedLabel: 'Oct 21 · 20:41',
        closedBy: 'force-revoked by xyz@example.com',
        changes: 1,
        grantedAt: new Date(now - mins(2880)),
        expiresAt: new Date(now - mins(2820)),
      },
    ];

    await Breakglass.insertMany(breakglassData);
    console.log(`Seeded ${breakglassData.length} break-glass sessions.`);

    console.log('Seeding project settings...');
    const settingsData = {
      key: 'global_settings',
      project: { org: 'Northwind', name: 'Checkout Platform' },
      environments: [
        { id: 'env-dev', name: 'Development', slug: 'dev', sdkKey: 'ff_sdk_dev_a91c4d7e2b6f08d3c1a7e5b2', serverKey: 'ff_srv_dev_5f2a9c1d8e3b7061f4a2c9d5', lastUsed: '2m ago' },
        { id: 'env-staging', name: 'Staging', slug: 'staging', sdkKey: 'ff_sdk_stg_7d1e93a0c4b28f65d0a1e7c3', serverKey: 'ff_srv_stg_2c8b4f1a6d90e3752b8c1a4f', lastUsed: '14m ago' },
        { id: 'env-prod', name: 'Production', slug: 'prod', sdkKey: 'ff_sdk_prod_e4a7c2910b8d3f65a1c7e029', serverKey: 'ff_srv_prod_9a1f6c3d0e2b8475c9a3f1d6', lastUsed: 'just now' },
      ],
      webhook: {
        url: 'https://hooks.slack.com/services/T024F/B071Q/xY7c9Za2',
        events: { auto_rollback: true, break_glass: true, approval: true, config_change: false },
      },
    };

    await Setting.create(settingsData);
    console.log('Seeded project settings.');

    console.log('\nSeed complete: users, issues, flags, rollouts, approvals, experiments, audit log, break-glass, settings.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
    process.exit(1);
  }
}

seedDatabase();
