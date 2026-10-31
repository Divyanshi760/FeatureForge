import { useEffect, useMemo, useState } from 'react'
import {
  FlagIcon,
  ShieldIcon,
  BeakerIcon,
  BoltIcon,
  CheckIcon,
  ArrowIcon,
  ScrollIcon,
} from '../components/icons'
import { api } from '../lib/api'

const TONE_DOT = {
  red: 'bg-[#c0392b]',
  green: 'bg-signal-green',
  amber: 'bg-[#b5811f]',
  blue: 'bg-signal-blue',
  ink: 'bg-ink',
  faint: 'bg-ink-faint',
}

const ACTION_META = {
  auto_rollback: { icon: BoltIcon, tone: 'red' },
  approval: { icon: CheckIcon, tone: 'green' },
  config_change: { icon: FlagIcon, tone: 'ink' },
  ops_toggle: { icon: FlagIcon, tone: 'ink' },
  break_glass: { icon: ShieldIcon, tone: 'amber' },
}

const PROJECTS = [
  { name: 'Checkout Platform', flags: 28, envs: ['dev', 'staging', 'prod'] },
  { name: 'Growth', flags: 11, envs: ['dev', 'prod'] },
  { name: 'Internal Tools', flags: 3, envs: ['dev'] },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function SectionCard({ title, action, children }) {
  return (
    <section className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = async () => {
    try {
      setLoading(true)
      setError(null)
      const [flags, approvals, audit, rollouts, experiments] = await Promise.all([
        api.get('/flags'),
        api.get('/approvals'),
        api.get('/audit'),
        api.get('/rollouts'),
        api.get('/experiments'),
      ])
      setData({ flags, approvals, audit, rollouts, experiments })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const stats = useMemo(() => {
    if (!data) return []
    const activeFlags = data.flags.filter((f) => f.on)
    const governed = activeFlags.filter((f) => f.type !== 'Ops')
    const pending = data.approvals.filter((a) => a.status === 'pending')
    const liveExperiments = data.experiments.filter((e) => !e.draft)
    const autoRollbacks = data.audit.filter((a) => a.action === 'auto_rollback')
    return [
      { label: 'Active flags', value: activeFlags.length, sub: `${governed.length} governed`, icon: FlagIcon },
      { label: 'Pending approvals', value: pending.length, sub: 'waiting on you', icon: ShieldIcon, accent: true },
      { label: 'Experiments running', value: liveExperiments.length, sub: `${data.experiments.length} total`, icon: BeakerIcon },
      { label: 'Auto-rollbacks', value: autoRollbacks.length, sub: autoRollbacks[0]?.flag || 'none recorded', icon: BoltIcon },
    ]
  }, [data])

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="card px-6 py-20 text-center text-ink-faint">Loading dashboard…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="card px-6 py-16 text-center">
          <p className="font-medium text-ink">Could not load the dashboard</p>
          <p className="mt-1 text-sm text-ink-faint">{error}</p>
          <button type="button" onClick={reload} className="btn-ghost mx-auto mt-6">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const lastRollback = data.audit.find((a) => a.action === 'auto_rollback')
  const pendingApprovals = data.approvals.filter((a) => a.status === 'pending')
  const activity = data.audit.slice(0, 5)
  const experiments = data.experiments

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{today}</p>
          <h1 className="display mt-2 text-3xl text-ink md:text-4xl">{greeting()}</h1>
          <p className="mt-2 text-ink-soft">
            Here is what moved in <span className="font-medium text-ink">Checkout Platform · prod</span> today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/audit" className="btn-ghost py-2.5">
            <ScrollIcon className="h-4 w-4" />
            View audit log
          </a>
        </div>
      </div>

      {/* Auto-rollback alert */}
      {lastRollback && (
        <div className="card overflow-hidden border-[#f0c9c4]">
          <div className="flex flex-col gap-4 bg-[#fbeae8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#c0392b] text-white">
                <BoltIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-[#7d2018]">Auto-rollback fired on {lastRollback.flag}</p>
                <p className="mt-0.5 text-sm text-[#95443b]">
                  {lastRollback.summary || 'The flag was disabled and the rollout dropped to zero.'}
                </p>
              </div>
            </div>
            <a
              href="/rollouts"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-[#c0392b] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#a5332a] sm:self-center"
            >
              Review incident
              <ArrowIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, accent }) => (
          <div key={label} className={`card p-5 ${accent ? 'ring-1 ring-accent/40' : ''}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-soft">{label}</span>
              <span
                className={`grid h-9 w-9 place-items-center rounded-xl ${
                  accent ? 'bg-accent-soft text-accent-strong' : 'bg-canvas text-ink'
                }`}
              >
                <Icon className="h-[1.15rem] w-[1.15rem]" />
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="display text-4xl text-ink">{value}</span>
              <span className="text-sm text-ink-faint">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Recent activity */}
        <SectionCard
          title="Recent activity"
          action={
            <a href="/audit" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
              See all
            </a>
          }
        >
          {activity.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line-strong px-4 py-8 text-center text-sm text-ink-faint">
              No activity recorded yet.
            </p>
          ) : (
            <ol className="space-y-1">
              {activity.map((a) => {
                const meta = ACTION_META[a.action] || ACTION_META.config_change
                const Icon = meta.icon
                return (
                  <li key={a.id} className="flex items-start gap-3.5 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface">
                    <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-canvas text-ink">
                      <Icon className="h-[1.05rem] w-[1.05rem]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink">
                        <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle ${TONE_DOT[meta.tone]}`} />
                        {a.summary || a.flag}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-ink-faint">
                        {a.actor} · {a.flag}
                      </p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap text-xs text-ink-faint">{a.when}</span>
                  </li>
                )
              })}
            </ol>
          )}
        </SectionCard>

        {/* Right column */}
        <div className="space-y-6">
          <SectionCard
            title="Pending approvals"
            action={
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong">
                {pendingApprovals.length} waiting
              </span>
            }
          >
            {pendingApprovals.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line-strong px-4 py-8 text-center text-sm text-ink-faint">
                Nothing waiting on review.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingApprovals.map((c) => (
                  <div key={c.id} className="rounded-xl border border-line bg-surface px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-sm text-ink">{c.flag}</span>
                      <span className="rounded-full bg-[#fdf0d9] px-2 py-0.5 text-[0.7rem] font-semibold text-[#b5811f]">
                        Pending
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-faint">
                      {c.summary} · by {c.requestedBy}
                    </p>
                    <div className="mt-3">
                      <a
                        href="/approvals"
                        className="inline-flex rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-surface transition-colors hover:bg-[#26251f]"
                      >
                        Review in approvals
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Projects">
            <ul className="space-y-2.5">
              {PROJECTS.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-ink-faint">{p.flags} flags</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {p.envs.map((e) => (
                      <span key={e} className="rounded-full border border-line bg-canvas px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-ink-faint">
                        {e}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>

      {/* Experiments strip */}
      <SectionCard
        title="Experiments in flight"
        action={
          <a href="/experiments" className="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
            Manage
          </a>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          {experiments.slice(0, 3).map((x) => {
            const minN = Math.min(...(x.variants || []).map((v) => v.exposures), 0)
            const progress = x.horizon?.target ? Math.min(100, Math.round((minN / x.horizon.target) * 100)) : 0
            const state = x.draft ? 'Draft' : minN >= x.minSampleSize ? 'Collecting' : 'Insufficient data'
            const tone = x.draft ? 'faint' : minN >= x.minSampleSize ? 'blue' : 'faint'
            return (
              <div key={x.id} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-ink">{x.name}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-faint">
                    <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[tone]}`} />
                    {state}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-ink">{x.metricLabel}</span>
                </div>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-ink-faint">{progress}% to horizon</p>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}
