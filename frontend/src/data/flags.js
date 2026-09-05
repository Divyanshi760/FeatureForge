/**
 * Mock flag data shared by the flag list and the flag detail page.
 * Stands in for the management API until the backend is wired up.
 */

export const TYPE_BADGE = {
  Release: 'bg-canvas text-ink border border-line-strong',
  Experiment: 'bg-accent-soft text-accent-strong',
  Ops: 'bg-[#e6f6ec] text-signal-green',
  Permission: 'bg-[#eaf0fb] text-signal-blue',
}

export const FLAGS = [
  { name: 'checkout-redesign', key: 'checkout_redesign_v2', type: 'Experiment', on: true, rollout: 35, by: 'dana@', when: '18m ago' },
  { name: 'payments-retry', key: 'payments_retry', type: 'Release', on: true, rollout: 20, by: 'sam@', when: '1h ago' },
  { name: 'new-nav', key: 'new_nav', type: 'Release', on: false, rollout: 0, by: 'lee@', when: '2h ago' },
  { name: 'onboarding-tour', key: 'onboarding_tour', type: 'Release', on: true, rollout: 50, by: 'lee@', when: '3h ago' },
  { name: 'search-ranking-v2', key: 'search_ranking_v2', type: 'Experiment', on: true, rollout: 100, by: 'dana@', when: '5h ago' },
  { name: 'maintenance-banner', key: 'maintenance_banner', type: 'Ops', on: false, rollout: 0, by: 'ops-bot', when: '6h ago' },
  { name: 'payments-kill', key: 'payments_kill', type: 'Ops', on: false, rollout: 0, by: 'sam@', when: '8h ago' },
  { name: 'beta-dashboard', key: 'beta_dashboard', type: 'Permission', on: true, rollout: 100, by: 'ada@', when: '1d ago' },
  { name: 'pricing-v3', key: 'pricing_v3', type: 'Experiment', on: false, rollout: 0, by: 'ada@', when: '1d ago' },
  { name: 'admin-export', key: 'admin_export', type: 'Permission', on: true, rollout: 100, by: 'ada@', when: '2d ago' },
  { name: 'price-anchor', key: 'price_anchor', type: 'Experiment', on: true, rollout: 25, by: 'lee@', when: '3d ago' },
  { name: 'legacy-cart', key: 'legacy_cart', type: 'Release', on: false, rollout: 0, by: 'sam@', when: '5d ago' },
]

const DESCRIPTIONS = {
  Experiment: 'Bound to an experiment. Variants split by weight and results gate on sample size before a winner is called.',
  Release: 'Gradual release flag. Rolled out by percentage with deterministic, sticky bucketing per user.',
  Ops: 'Operational kill switch. Exempt from approval so it can be flipped fast in an incident.',
  Permission: 'Entitlement flag. Grants access to a capability for the targeted segment.',
}

// Governed types need four-eyes approval to change in prod; ops flags do not.
export const GOVERNED = { Release: true, Experiment: true, Permission: true, Ops: false }

function defaultRules(type) {
  if (type === 'Permission') {
    return [
      { attr: 'plan', op: 'in', value: 'enterprise, business' },
      { attr: 'role', op: '=', value: 'admin' },
    ]
  }
  if (type === 'Ops') return []
  return [
    { attr: 'country', op: 'in', value: 'US, CA, GB' },
    { attr: 'plan', op: '=', value: 'enterprise' },
    { attr: 'app_version', op: '>=', value: '4.2.0' },
  ]
}

function defaultVariants(type) {
  if (type !== 'Experiment') return null
  return [
    { name: 'control', weight: 50 },
    { name: 'variant-b', weight: 50 },
  ]
}

/** Look up a flag by key and expand it into the full editable detail model. */
export function getFlag(key) {
  const base = FLAGS.find((f) => f.key === key)
  if (!base) return null
  return {
    ...base,
    description: DESCRIPTIONS[base.type],
    createdBy: base.by,
    createdAt: 'Aug 14, 2026',
    envs: { dev: true, staging: true, prod: base.on },
    rules: defaultRules(base.type),
    variants: defaultVariants(base.type),
  }
}
