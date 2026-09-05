/**
 * Mock project settings. Stands in for the settings endpoints: environment
 * management, SDK/server API keys, and webhook/alert configuration.
 */

export const PROJECT = {
  org: 'Northwind',
  name: 'Checkout Platform',
}

// A short random key body so rotate produces a visibly different value.
export function genKey(prefix) {
  const body = Array.from({ length: 24 }, () =>
    'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)],
  ).join('')
  return `${prefix}${body}`
}

export const ENVIRONMENTS = [
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
]

export const WEBHOOK = {
  url: 'https://hooks.slack.com/services/T024F/B071Q/xY7c9Za2',
  events: {
    auto_rollback: true,
    break_glass: true,
    approval: true,
    config_change: false,
  },
}

export const EVENT_LABELS = {
  auto_rollback: {
    label: 'Auto-rollback fired',
    desc: 'The guard disables a flag after a sustained breach.',
  },
  break_glass: {
    label: 'Break-glass granted',
    desc: 'Emergency access bypasses approval.',
  },
  approval: {
    label: 'Change request resolved',
    desc: 'A governed change is approved or rejected.',
  },
  config_change: {
    label: 'Any config change',
    desc: 'Every flag edit, including routine ones. Noisy.',
  },
}
