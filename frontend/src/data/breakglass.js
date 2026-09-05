/**
 * Mock break-glass sessions. Mirrors the `breakGlassSessions` collection:
 * an emergency grant that bypasses the approval requirement for a capped
 * window, auto-revoked at expiry by a sweep job.
 *
 * `expiresAt` is a real Date offset from load time so the page can tick a
 * live countdown against it.
 */

// Sessions may not be requested for longer than this.
export const MAX_DURATION_MIN = 120

// Durations offered in the request form, all within the cap.
export const DURATION_OPTIONS = [
  { label: '15 minutes', min: 15 },
  { label: '30 minutes', min: 30 },
  { label: '1 hour', min: 60 },
  { label: '2 hours', min: 120 },
]

const now = Date.now()
const mins = (m) => m * 60 * 1000

export const ACTIVE_SESSIONS = [
  {
    id: 'BG-77',
    user: 'sam@',
    flag: 'payments-kill',
    key: 'payments_kill',
    env: 'prod',
    reason: 'The payment provider is throwing 5xx all over checkout. I need to flip the kill switch now, there isn\'t time to wait on a second reviewer.',
    grantedLabel: '18m ago',
    durationMin: 60,
    grantedAt: new Date(now - mins(18)),
    expiresAt: new Date(now + mins(42)),
    used: 'Enabled payments-kill · 1 change under this session',
  },
  {
    id: 'BG-78',
    user: 'dana@',
    flag: 'search-ranking-v2',
    key: 'search_ranking_v2',
    env: 'staging',
    reason: 'Ranking model shipped a bad index in staging, rolling back ahead of the demo.',
    grantedLabel: '4m ago',
    durationMin: 30,
    grantedAt: new Date(now - mins(4)),
    expiresAt: new Date(now + mins(26)),
    used: 'No changes yet',
  },
]

export const PAST_SESSIONS = [
  {
    id: 'BG-71',
    user: 'sam@',
    flag: 'payments-kill',
    key: 'payments_kill',
    env: 'prod',
    reason: 'Payment provider outage, had to hit the emergency kill switch.',
    durationMin: 120,
    status: 'expired',
    endedLabel: 'Yesterday 14:03',
    closedBy: 'auto-revoked at expiry',
    changes: 2,
  },
  {
    id: 'BG-68',
    user: 'lee@',
    flag: 'legacy-cart',
    key: 'legacy_cart',
    env: 'prod',
    reason: 'Cutover regression, needed to force the legacy cart off immediately.',
    durationMin: 30,
    status: 'revoked',
    endedLabel: 'Aug 30 · 09:12',
    closedBy: 'force-revoked by xyz@',
    changes: 1,
  },
  {
    id: 'BG-64',
    user: 'dana@',
    flag: 'checkout-redesign',
    key: 'checkout_redesign_v2',
    env: 'prod',
    reason: 'Manual rollback while the guard threshold was being retuned.',
    durationMin: 60,
    status: 'expired',
    endedLabel: 'Aug 28 · 20:41',
    closedBy: 'auto-revoked at expiry',
    changes: 3,
  },
]
