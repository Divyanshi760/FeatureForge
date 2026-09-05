/**
 * Mock change requests for the approval queue. Mirrors what the management
 * API would return: who requested what, on which flag/environment, the
 * before/after diff, and where it sits in the four-eyes flow.
 */

// The signed-in reviewer. Used to hide approve/reject on your own requests.
export const CURRENT_USER = 'xyz@'

export const CHANGE_REQUESTS = [
  {
    id: 'CR-418',
    flag: 'payments-retry',
    key: 'payments_retry',
    type: 'Release',
    env: 'prod',
    requestedBy: 'sam@',
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
    requestedBy: 'lee@',
    requestedAt: '48m ago',
    status: 'pending',
    needed: 2,
    approvals: ['dana@'],
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
    requestedBy: 'ada@',
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
    requestedBy: 'xyz@',
    requestedAt: '3h ago',
    status: 'pending',
    needed: 2,
    approvals: ['lee@'],
    summary: 'Push the tour to half of prod traffic.',
    diff: [{ field: 'rolloutPercent', before: '25', after: '50' }],
  },
  {
    id: 'CR-412',
    flag: 'search-ranking-v2',
    key: 'search_ranking_v2',
    type: 'Experiment',
    env: 'prod',
    requestedBy: 'dana@',
    requestedAt: '5h ago',
    status: 'approved',
    needed: 2,
    approvals: ['lee@', 'xyz@'],
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
    requestedBy: 'sam@',
    requestedAt: '1d ago',
    status: 'rejected',
    needed: 2,
    approvals: [],
    summary: 'Re-enable the legacy cart flow.',
    diff: [{ field: 'state', before: 'off', after: 'on' }],
  },
]
