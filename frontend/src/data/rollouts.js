/**
 * Mock guarded rollouts for the monitoring page. Each actively-ramping flag
 * declares a health metric plus the guard config the auto-rollback engine
 * runs against: threshold, window length, consecutive-breach count, and the
 * minimum sample per window below which a window is skipped as noise.
 *
 * The page drives a live simulation from these seeds , sampling a new window
 * on an interval, counting consecutive breaches, and firing an auto-rollback
 * exactly as the backend job would.
 */

export const ROLLOUTS = [
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
    trend: 'degrading', // will breach and auto-roll back live
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
    trend: 'rolled_back', // the incident already surfaced on the dashboard
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
]
