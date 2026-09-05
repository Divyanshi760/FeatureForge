/**
 * Mock experiments. Each binds a flag's variants to a target metric and
 * carries raw exposure/conversion counts per variant , the same shape the
 * event-ingestion pipeline would aggregate. Statistics (rate, lift, z-test,
 * confidence interval, significance) are computed from these counts in
 * `computeResults`, so the numbers on screen are real, not canned.
 */

export const EXPERIMENTS = [
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
]

/* ------------------------------- stats -------------------------------- */

// Abramowitz & Stegun 7.1.26 error-function approximation.
function erf(x) {
  const s = x < 0 ? -1 : 1
  x = Math.abs(x)
  const t = 1 / (1 + 0.3275911 * x)
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-x * x)
  return s * y
}

function normCdf(z) {
  return 0.5 * (1 + erf(z / Math.SQRT2))
}

/**
 * Two-proportion z-test between control (variant 0) and each other variant,
 * plus min-sample and horizon gating. Returns everything the results page
 * renders: per-variant rates, the winning variant, p-value, CI and a status.
 */
export function computeResults(exp) {
  const [control, ...rest] = exp.variants
  const rate = (v) => (v.exposures ? v.conversions / v.exposures : 0)

  const withRates = exp.variants.map((v) => ({
    ...v,
    rate: rate(v),
  }))

  const started = !exp.draft && exp.variants.some((v) => v.exposures > 0)
  const minN = Math.min(...exp.variants.map((v) => v.exposures))
  const sampleMet = minN >= exp.minSampleSize
  const horizonReached =
    exp.horizon.type === 'sample' && minN >= exp.horizon.target
  const progress = Math.min(100, Math.round((minN / exp.horizon.target) * 100))

  // Compare the best non-control variant against control.
  let best = rest[0]
  for (const v of rest) if (rate(v) > rate(best)) best = v

  const p1 = rate(control)
  const p2 = rate(best)
  const n1 = control.exposures
  const n2 = best.exposures

  let z = 0
  let pValue = 1
  let ciLow = 0
  let ciHigh = 0
  let lift = 0

  if (started && n1 > 0 && n2 > 0) {
    const pPool = (control.conversions + best.conversions) / (n1 + n2)
    const sePool = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2))
    z = sePool ? (p2 - p1) / sePool : 0
    pValue = 2 * (1 - normCdf(Math.abs(z)))
    const seDiff = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2)
    ciLow = p2 - p1 - 1.96 * seDiff
    ciHigh = p2 - p1 + 1.96 * seDiff
    lift = p1 ? (p2 - p1) / p1 : 0
  }

  const significant = pValue < 0.05
  const decisionGrade = horizonReached && sampleMet

  let status
  if (!started) status = 'draft'
  else if (!sampleMet) status = 'insufficient'
  else if (!decisionGrade) status = 'collecting'
  else if (significant) status = 'significant'
  else status = 'no_effect'

  return {
    variants: withRates,
    control,
    best,
    winner: status === 'significant' ? best.name : null,
    z,
    pValue,
    ciLow,
    ciHigh,
    lift,
    minN,
    sampleMet,
    horizonReached,
    decisionGrade,
    progress,
    status,
  }
}

export const STATUS_META = {
  draft: { label: 'Draft', tone: 'faint' },
  insufficient: { label: 'Insufficient data', tone: 'faint' },
  collecting: { label: 'Collecting', tone: 'blue' },
  significant: { label: 'Significant', tone: 'green' },
  no_effect: { label: 'No clear effect', tone: 'amber' },
}

export const TONE = {
  faint: { text: 'text-ink-faint', dot: 'bg-ink-faint', soft: 'bg-canvas text-ink-faint' },
  blue: { text: 'text-signal-blue', dot: 'bg-signal-blue', soft: 'bg-[#eaf0fb] text-signal-blue' },
  green: { text: 'text-signal-green', dot: 'bg-signal-green', soft: 'bg-[#e6f6ec] text-signal-green' },
  amber: { text: 'text-[#b5811f]', dot: 'bg-[#b5811f]', soft: 'bg-[#fdf0d9] text-[#b5811f]' },
}
