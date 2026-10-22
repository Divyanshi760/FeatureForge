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

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/featureforge';

async function seedDatabase() {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    // 1. Clear existing data
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
    ]);
    console.log('Collections cleared.');

    // 2. Seed Users & Developers & Team Members
    console.log('Seeding Users & Developers...');
    const users = [
      // Admins
      {
        name: 'Administrator',
        email: 'admin@gmail.com',
        password: 'password123',
        role: 'admin',
        avatar: 'AD',
        status: 'active',
        owner: true,
        scope: 'Project-wide',
      },
      {
        name: 'Ada Ofori',
        email: 'ada@example.com',
        password: 'password123',
        role: 'admin',
        avatar: 'AO',
        status: 'active',
        owner: false,
        scope: 'Project-wide',
      },
      {
        name: 'xyz',
        email: 'xyz@example.com',
        password: 'password123',
        role: 'admin',
        avatar: 'XY',
        status: 'active',
        owner: true,
        scope: 'Project-wide',
      },

      // Developers (with free / occupied statuses, specialties & metrics)
      {
        name: 'Dana Walsh',
        email: 'dana@example.com',
        password: 'password123',
        role: 'developer',
        avatar: 'DW',
        status: 'occupied',
        specialty: 'Frontend',
        activeIssues: 2,
        resolvedTotal: 14,
        currentIssue: 'ISS-001',
        joinedAt: new Date('2026-03-15T00:00:00Z'),
      },
      {
        name: 'Sam Reyes',
        email: 'sam@example.com',
        password: 'password123',
        role: 'developer',
        avatar: 'SR',
        status: 'occupied',
        specialty: 'Backend',
        activeIssues: 1,
        resolvedTotal: 22,
        currentIssue: 'ISS-002',
        joinedAt: new Date('2026-01-10T00:00:00Z'),
      },
      {
        name: 'Lee Nakamura',
        email: 'lee@example.com',
        password: 'password123',
        role: 'developer',
        avatar: 'LN',
        status: 'occupied',
        specialty: 'Infrastructure',
        activeIssues: 1,
        resolvedTotal: 9,
        currentIssue: 'ISS-005',
        joinedAt: new Date('2026-06-01T00:00:00Z'),
      },
      {
        name: 'Priya Menon',
        email: 'priya@example.com',
        password: 'password123',
        role: 'developer',
        avatar: 'PM',
        status: 'free',
        specialty: 'Full Stack',
        activeIssues: 0,
        resolvedTotal: 18,
        currentIssue: null,
        joinedAt: new Date('2026-02-20T00:00:00Z'),
      },
      {
        name: 'Kai Hernandez',
        email: 'kai@example.com',
        password: 'password123',
        role: 'developer',
        avatar: 'KH',
        status: 'free',
        specialty: 'DevOps',
        activeIssues: 0,
        resolvedTotal: 7,
        currentIssue: null,
        joinedAt: new Date('2026-08-10T00:00:00Z'),
      },
      {
        name: 'Aisha Okafor',
        email: 'aisha@example.com',
        password: 'password123',
        role: 'developer',
        avatar: 'AO',
        status: 'free',
        specialty: 'Backend',
        activeIssues: 0,
        resolvedTotal: 11,
        currentIssue: null,
        joinedAt: new Date('2026-04-05T00:00:00Z'),
      },

      // End Users (Issue reporters)
      {
        name: 'Riya Sharma',
        email: 'riya@example.com',
        password: 'password123',
        role: 'user',
        avatar: 'RS',
        status: 'active',
      },
      {
        name: 'Arjun Patel',
        email: 'arjun@example.com',
        password: 'password123',
        role: 'user',
        avatar: 'AP',
        status: 'active',
      },
      {
        name: 'Meera Joshi',
        email: 'meera@example.com',
        password: 'password123',
        role: 'user',
        avatar: 'MJ',
        status: 'active',
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@example.com',
        password: 'password123',
        role: 'user',
        avatar: 'VS',
        status: 'active',
      },
      {
        name: 'Neha Kapoor',
        email: 'neha@example.com',
        password: 'password123',
        role: 'user',
        avatar: 'NK',
        status: 'active',
      },
    ];

    for (const u of users) {
      await User.create(u);
    }
    console.log(`Seeded ${users.length} users/developers.`);

    // 3. Seed Issues (with auto-priority based on reportCount)
    console.log('Seeding Issues...');
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
          { id: 'user-7', name: 'Anita Rao', email: 'anita@example.com' },
          { id: 'user-9', name: 'Kiran Desai', email: 'kiran@example.com' },
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
          { id: 'user-8', name: 'Rohan Mehta', email: 'rohan@example.com' },
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
          { id: 'user-6', name: 'Dev Ops Bot', email: 'ops-bot@example.com' },
          { id: 'user-10', name: 'Sanya Gupta', email: 'sanya@example.com' },
          { id: 'user-11', name: 'Rahul Nair', email: 'rahul@example.com' },
        ],
        status: 'open',
        reportedBy: { id: 'user-3', name: 'Meera Joshi', email: 'meera@example.com' },
        assignedTo: null,
        assignmentType: null,
        adminApproved: false,
        selfPickRequest: {
          requestedBy: { id: 'dev-4', name: 'Priya Menon', email: 'priya@example.com' },
          requestedAt: new Date('2026-10-22T14:30:00Z'),
        },
        createdAt: new Date('2026-10-22T08:45:00Z'),
        updatedAt: new Date('2026-10-22T08:45:00Z'),
      },
      {
        id: 'ISS-004',
        title: 'CSV export truncates records after 10,000 rows',
        description: 'Large data exports via CSV are silently truncated. No error or warning is shown to the user. Expected behavior: paginated download or streaming.',
        reportCount: 2,
        reporters: [
          { id: 'user-1', name: 'Riya Sharma', email: 'riya@example.com' },
          { id: 'user-6', name: 'Dev Ops Bot', email: 'ops-bot@example.com' },
        ],
        status: 'open',
        reportedBy: { id: 'user-1', name: 'Riya Sharma', email: 'riya@example.com' },
        assignedTo: null,
        assignmentType: null,
        adminApproved: false,
        createdAt: new Date('2026-10-21T16:10:00Z'),
        updatedAt: new Date('2026-10-21T16:10:00Z'),
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
          { id: 'user-5', name: 'Neha Kapoor', email: 'neha@example.com' },
          { id: 'user-7', name: 'Anita Rao', email: 'anita@example.com' },
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
        id: 'ISS-007',
        title: 'Webhook payload missing timestamp field',
        description: 'The webhook payload for flag change events is missing the `changed_at` timestamp. Downstream services rely on this field for ordering.',
        reportCount: 4,
        reporters: [
          { id: 'user-5', name: 'Neha Kapoor', email: 'neha@example.com' },
          { id: 'user-6', name: 'Dev Ops Bot', email: 'ops-bot@example.com' },
          { id: 'user-10', name: 'Sanya Gupta', email: 'sanya@example.com' },
          { id: 'user-11', name: 'Rahul Nair', email: 'rahul@example.com' },
        ],
        status: 'open',
        reportedBy: { id: 'user-5', name: 'Neha Kapoor', email: 'neha@example.com' },
        assignedTo: null,
        assignmentType: null,
        adminApproved: false,
        selfPickRequest: {
          requestedBy: { id: 'dev-1', name: 'Dana Walsh', email: 'dana@example.com' },
          requestedAt: new Date('2026-10-22T13:15:00Z'),
        },
        createdAt: new Date('2026-10-22T12:00:00Z'),
        updatedAt: new Date('2026-10-22T12:00:00Z'),
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

    // 4. Seed Feature Flags
    console.log('Seeding Feature Flags...');
    const flagsData = [
      { name: 'checkout-redesign', key: 'checkout_redesign_v2', type: 'Experiment', on: true, rollout: 35, by: 'dana@example.com', when: '18m ago', description: 'Bound to an experiment. Variants split by weight and results gate on sample size before a winner is called.', envs: { dev: true, staging: true, prod: true }, variants: [{ name: 'control', weight: 50 }, { name: 'variant-b', weight: 50 }] },
      { name: 'payments-retry', key: 'payments_retry', type: 'Release', on: true, rollout: 20, by: 'sam@example.com', when: '1h ago', description: 'Gradual release flag. Rolled out by percentage with deterministic, sticky bucketing per user.', envs: { dev: true, staging: true, prod: true }, rules: [{ attr: 'country', op: 'in', value: 'US, CA, GB' }, { attr: 'plan', op: '=', value: 'enterprise' }] },
      { name: 'new-nav', key: 'new_nav', type: 'Release', on: false, rollout: 0, by: 'lee@example.com', when: '2h ago', description: 'Gradual release flag. Rolled out by percentage with deterministic, sticky bucketing per user.', envs: { dev: true, staging: true, prod: false } },
      { name: 'onboarding-tour', key: 'onboarding_tour', type: 'Release', on: true, rollout: 50, by: 'lee@example.com', when: '3h ago', description: 'Gradual release flag. Rolled out by percentage with deterministic, sticky bucketing per user.', envs: { dev: true, staging: true, prod: true } },
      { name: 'search-ranking-v2', key: 'search_ranking_v2', type: 'Experiment', on: true, rollout: 100, by: 'dana@example.com', when: '5h ago', description: 'Bound to an experiment.', envs: { dev: true, staging: true, prod: true }, variants: [{ name: 'control', weight: 50 }, { name: 'variant-b', weight: 50 }] },
      { name: 'maintenance-banner', key: 'maintenance_banner', type: 'Ops', on: false, rollout: 0, by: 'ops-bot', when: '6h ago', description: 'Operational kill switch. Exempt from approval so it can be flipped fast in an incident.', envs: { dev: true, staging: true, prod: false } },
      { name: 'payments-kill', key: 'payments_kill', type: 'Ops', on: false, rollout: 0, by: 'sam@example.com', when: '8h ago', description: 'Operational kill switch.', envs: { dev: true, staging: true, prod: false } },
      { name: 'beta-dashboard', key: 'beta_dashboard', type: 'Permission', on: true, rollout: 100, by: 'ada@example.com', when: '1d ago', description: 'Entitlement flag.', envs: { dev: true, staging: true, prod: true }, rules: [{ attr: 'plan', op: 'in', value: 'enterprise, business' }, { attr: 'role', op: '=', value: 'admin' }] },
      { name: 'pricing-v3', key: 'pricing_v3', type: 'Experiment', on: false, rollout: 0, by: 'ada@example.com', when: '1d ago', description: 'Bound to an experiment.', envs: { dev: true, staging: true, prod: false } },
      { name: 'admin-export', key: 'admin_export', type: 'Permission', on: true, rollout: 100, by: 'ada@example.com', when: '2d ago', description: 'Entitlement flag.', envs: { dev: true, staging: true, prod: true } },
      { name: 'price-anchor', key: 'price_anchor', type: 'Experiment', on: true, rollout: 25, by: 'lee@example.com', when: '3d ago', description: 'Bound to an experiment.', envs: { dev: true, staging: true, prod: true } },
      { name: 'legacy-cart', key: 'legacy_cart', type: 'Release', on: false, rollout: 0, by: 'sam@example.com', when: '5d ago', description: 'Gradual release flag.', envs: { dev: true, staging: true, prod: false } },
    ];

    await Flag.insertMany(flagsData);
    console.log(`Seeded ${flagsData.length} feature flags.`);

    // 5. Seed Guarded Rollouts
    console.log('Seeding Rollouts...');
    const rolloutsData = [
      {
        id: 'RO-52',
        flag: 'payments-retry',
        key: 'payments_retry',
        env: 'prod',
        rollout: 20,
        startedLabel: 'ramping 1h',
        trend: 'healthy',
        metric: {
          key: 'error_rate',
          label: 'Error rate',
          unit: '%',
          threshold: 3,
          control: 0.9,
          variant: 1.1,
          noise: 0.35,
          windowLabel: '60s',
          windowsToRollback: 2,
          minSample: 200,
        },
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
        metric: {
          key: 'error_rate',
          label: 'Error rate',
          unit: '%',
          threshold: 3,
          control: 1,
          variant: 2.1,
          noise: 0.3,
          windowLabel: '60s',
          windowsToRollback: 3,
          minSample: 200,
        },
        rollbacks: [],
      },
      {
        id: 'RO-53',
        flag: 'onboarding-tour',
        key: 'onboarding_tour',
        env: 'prod',
        rollout: 50,
        startedLabel: 'ramping 3h',
        trend: 'healthy',
        metric: {
          key: 'latency_p95',
          label: 'Latency p95',
          unit: 'ms',
          threshold: 500,
          control: 240,
          variant: 268,
          noise: 55,
          windowLabel: '120s',
          windowsToRollback: 3,
          minSample: 150,
        },
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
        metric: {
          key: 'error_rate',
          label: 'Error rate',
          unit: '%',
          threshold: 3,
          control: 0.9,
          variant: 4.8,
          noise: 0.3,
          windowLabel: '60s',
          windowsToRollback: 2,
          minSample: 200,
        },
        rollbacks: [
          {
            at: '18m ago',
            reason: 'Error rate hit 4.8% against control at 0.9%, over the 3.0% threshold for two windows in a row.',
            detail: 'The flag was disabled, the new config went out to 6 SDKs, and Slack got pinged. Nobody had to lift a finger.',
          },
        ],
      },
    ];

    await Rollout.insertMany(rolloutsData);
    console.log(`Seeded ${rolloutsData.length} rollouts.`);

    // 6. Seed Approvals / Change Requests
    console.log('Seeding Approvals...');
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
        id: 'CR-417',
        flag: 'new-nav',
        key: 'new_nav',
        type: 'Release',
        env: 'prod',
        requestedBy: 'lee@example.com',
        requestedAt: '48m ago',
        status: 'pending',
        needed: 2,
        approvals: ['dana@example.com'],
        summary: 'Turn the redesigned nav on for the first prod cohort.',
        diff: [
          { field: 'state', before: 'off', after: 'on' },
          { field: 'rolloutPercent', before: '0', after: '10' },
          { field: 'rule[+]', before: null, after: 'country in [US, CA]' },
        ],
      },
      {
        id: 'CR-416',
        flag: 'pricing-v3',
        key: 'pricing_v3',
        type: 'Experiment',
        env: 'prod',
        requestedBy: 'ada@example.com',
        requestedAt: '2h ago',
        status: 'pending',
        needed: 2,
        approvals: [],
        summary: 'Add an enterprise targeting rule before starting the test.',
        diff: [
          { field: 'rule[+]', before: null, after: 'plan = enterprise' },
          { field: 'variant.weight[control]', before: '50', after: '40' },
          { field: 'variant.weight[variant-b]', before: '50', after: '60' },
        ],
      },
      {
        id: 'CR-415',
        flag: 'onboarding-tour',
        key: 'onboarding_tour',
        type: 'Release',
        env: 'prod',
        requestedBy: 'xyz@example.com',
        requestedAt: '3h ago',
        status: 'pending',
        needed: 2,
        approvals: ['lee@example.com'],
        summary: 'Push the tour to half of prod traffic.',
        diff: [{ field: 'rolloutPercent', before: '25', after: '50' }],
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
        approvals: ['lee@example.com', 'xyz@example.com'],
        summary: 'Ship the winning variant to everyone.',
        diff: [
          { field: 'rolloutPercent', before: '50', after: '100' },
          { field: 'winner', before: null, after: 'variant-b' },
        ],
      },
      {
        id: 'CR-409',
        flag: 'legacy-cart',
        key: 'legacy_cart',
        type: 'Release',
        env: 'prod',
        requestedBy: 'sam@example.com',
        requestedAt: '1d ago',
        status: 'rejected',
        needed: 2,
        approvals: [],
        summary: 'Re-enable the legacy cart flow.',
        diff: [{ field: 'state', before: 'off', after: 'on' }],
      },
    ];

    await Approval.insertMany(approvalsData);
    console.log(`Seeded ${approvalsData.length} change requests.`);

    // 7. Seed Experiments
    console.log('Seeding Experiments...');
    const experimentsData = [
      {
        id: 'EXP-31',
        name: 'signup-cta',
        flag: 'onboarding-tour',
        key: 'onboarding_tour',
        metric: 'signup_complete',
        metricLabel: 'Signup completion',
        startedLabel: 'Started Aug 29',
        minSampleSize: 5000,
        horizon: { type: 'sample', target: 8000, dateLabel: 'Sep 6' },
        variants: [
          { name: 'control', exposures: 8210, conversions: 574 },
          { name: 'variant-b', exposures: 8155, conversions: 735 },
        ],
      },
      {
        id: 'EXP-29',
        name: 'search-ranking-v2',
        flag: 'search-ranking-v2',
        key: 'search_ranking_v2',
        metric: 'result_click',
        metricLabel: 'Result click-through',
        startedLabel: 'Started Aug 24',
        minSampleSize: 6000,
        horizon: { type: 'sample', target: 10000, dateLabel: 'Sep 2' },
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
        startedLabel: 'Started Sep 1',
        minSampleSize: 5000,
        horizon: { type: 'sample', target: 5000, dateLabel: 'Sep 9' },
        variants: [
          { name: 'control', exposures: 3105, conversions: 402 },
          { name: 'variant-b', exposures: 3048, conversions: 431 },
        ],
      },
      {
        id: 'EXP-35',
        name: 'price-anchor',
        flag: 'price-anchor',
        key: 'price_anchor',
        metric: 'purchase',
        metricLabel: 'Purchase',
        startedLabel: 'Started Sep 3',
        minSampleSize: 5000,
        horizon: { type: 'sample', target: 6000, dateLabel: 'Sep 12' },
        variants: [
          { name: 'control', exposures: 1210, conversions: 96 },
          { name: 'variant-b', exposures: 1185, conversions: 101 },
        ],
      },
      {
        id: 'EXP-36',
        name: 'pricing-v3',
        flag: 'pricing-v3',
        key: 'pricing_v3',
        metric: 'upgrade',
        metricLabel: 'Plan upgrade',
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

    // 8. Seed Audit Log
    console.log('Seeding Audit Log...');
    const auditData = [
      {
        id: 'AL-2041',
        action: 'auto_rollback',
        actor: 'guard',
        system: true,
        flag: 'checkout-redesign',
        key: 'checkout_redesign_v2',
        env: 'prod',
        day: 'Today',
        at: '09:12',
        when: '18m ago',
        summary: 'Error rate crossed the threshold for 2 consecutive windows. Flag disabled and pushed to 6 SDKs.',
        diff: [
          { field: 'status', before: 'enabled', after: 'disabled' },
          { field: 'rolloutPercent', before: '35', after: '0' },
        ],
        note: 'Window: err 4.8% vs control 0.9% (threshold 3.0%) · 2/2 breaches',
      },
      {
        id: 'AL-2040',
        action: 'approval',
        actor: 'xyz@example.com',
        flag: 'search-ranking-v2',
        key: 'search_ranking_v2',
        env: 'prod',
        day: 'Today',
        at: '08:03',
        when: '1h ago',
        summary: 'CR-412 approved, so the winning variant went out to everyone.',
        diff: [
          { field: 'rolloutPercent', before: '50', after: '100' },
          { field: 'winner', before: null, after: 'variant-b' },
        ],
        note: 'Second approval on CR-412 · reviewers lee@, xyz@',
      },
      {
        id: 'AL-2039',
        action: 'config_change',
        actor: 'lee@example.com',
        flag: 'onboarding-tour',
        key: 'onboarding_tour',
        env: 'prod',
        day: 'Today',
        at: '06:41',
        when: '3h ago',
        summary: 'Rollout raised after CR-415 cleared four-eyes review.',
        diff: [{ field: 'rolloutPercent', before: '25', after: '50' }],
        note: 'Applied via CR-415',
      },
      {
        id: 'AL-2038',
        action: 'ops_toggle',
        actor: 'ops-bot',
        flag: 'maintenance-banner',
        key: 'maintenance_banner',
        env: 'prod',
        day: 'Today',
        at: '04:15',
        when: '5h ago',
        summary: 'Turned off maintenance banner after scheduled cluster maintenance completed cleanly.',
        diff: [{ field: 'state', before: 'on', after: 'off' }],
        note: 'Automated toggle by cluster-deploy workflow',
      },
      {
        id: 'AL-2037',
        action: 'break_glass',
        actor: 'sam@example.com',
        flag: 'payments-kill',
        key: 'payments_kill',
        env: 'prod',
        day: 'Today',
        at: '01:10',
        when: '8h ago',
        summary: 'Emergency break-glass session BG-77 initiated for payment gateway outage.',
        diff: [{ field: 'state', before: 'off', after: 'on' }],
        note: 'Bypassed 2-person approval under incident INC-4921',
      },
    ];

    await AuditLog.insertMany(auditData);
    console.log(`Seeded ${auditData.length} audit log entries.`);

    // 9. Seed Break-Glass Sessions
    console.log('Seeding Break-glass Sessions...');
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
        id: 'BG-78',
        user: 'dana@example.com',
        flag: 'search-ranking-v2',
        key: 'search_ranking_v2',
        env: 'staging',
        reason: 'Ranking model shipped a bad index in staging, rolling back ahead of the demo.',
        grantedLabel: '4m ago',
        durationMin: 30,
        grantedAt: new Date(now - mins(4)),
        expiresAt: new Date(now + mins(26)),
        status: 'active',
        used: 'No changes yet',
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
        user: 'lee@example.com',
        flag: 'legacy-cart',
        key: 'legacy_cart',
        env: 'prod',
        reason: 'Cutover regression, needed to force the legacy cart off immediately.',
        durationMin: 30,
        status: 'revoked',
        endedLabel: 'Aug 30 · 09:12',
        closedBy: 'force-revoked by xyz@',
        changes: 1,
        grantedAt: new Date(now - mins(2880)),
        expiresAt: new Date(now - mins(2850)),
      },
    ];

    await Breakglass.insertMany(breakglassData);
    console.log(`Seeded ${breakglassData.length} break-glass sessions.`);

    // 10. Seed Settings
    console.log('Seeding Project Settings...');
    const settingsData = {
      key: 'global_settings',
      project: {
        org: 'Northwind',
        name: 'Checkout Platform',
      },
      environments: [
        {
          id: 'env-dev',
          name: 'Development',
          slug: 'dev',
          sdkKey: 'ff_sdk_dev_a91c4d7e2b6f08d3c1a7e5b2',
          serverKey: 'ff_srv_dev_5f2a9c1d8e3b7061f4a2c9d5',
          lastUsed: '2m ago',
        },
        {
          id: 'env-staging',
          name: 'Staging',
          slug: 'staging',
          sdkKey: 'ff_sdk_stg_7d1e93a0c4b28f65d0a1e7c3',
          serverKey: 'ff_srv_stg_2c8b4f1a6d90e3752b8c1a4f',
          lastUsed: '14m ago',
        },
        {
          id: 'env-prod',
          name: 'Production',
          slug: 'prod',
          sdkKey: 'ff_sdk_prod_e4a7c2910b8d3f65a1c7e029',
          serverKey: 'ff_srv_prod_9a1f6c3d0e2b8475c9a3f1d6',
          lastUsed: 'just now',
        },
      ],
      webhook: {
        url: 'https://hooks.slack.com/services/T024F/B071Q/xY7c9Za2',
        events: {
          auto_rollback: true,
          break_glass: true,
          approval: true,
          config_change: false,
        },
      },
    };

    await Setting.create(settingsData);
    console.log('Seeded project settings.');

    console.log('\n=============================================');
    console.log('🎉 MongoDB database successfully seeded with all dashboard data!');
    console.log('Database Name: featureforge');
    console.log('Collections created and populated:');
    console.log('  - users (Admins, Developers [free/occupied], Users)');
    console.log('  - issues (Auto-computed priority, reporters, approvals)');
    console.log('  - flags (Feature flags, environments, rules)');
    console.log('  - rollouts (Guarded rollouts, thresholds, auto-rollbacks)');
    console.log('  - approvals (Change requests, governance review)');
    console.log('  - experiments (A/B testing, variants, conversion metrics)');
    console.log('  - auditlogs (System and human mutation trail)');
    console.log('  - breakglasses (Emergency bypass sessions)');
    console.log('  - settings (Project keys, environments, webhooks)');
    console.log('=============================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding MongoDB:', err);
    process.exit(1);
  }
}

seedDatabase();
