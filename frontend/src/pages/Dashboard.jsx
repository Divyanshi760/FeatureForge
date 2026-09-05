import {
  FlagIcon,
  ShieldIcon,
  BeakerIcon,
  BoltIcon,
  CheckIcon,
  ArrowIcon,
  ScrollIcon,
} from '../components/icons'

/* -------------------------------- data -------------------------------- */

const STATS = [
  { label: 'Active flags', value: '42', sub: '8 governed', icon: FlagIcon },
  {
    label: 'Pending approvals',
    value: '3',
    sub: 'waiting on you',
    icon: ShieldIcon,
    accent: true,
  },
  { label: 'Experiments running', value: '5', sub: '2 near horizon', icon: BeakerIcon },
  { label: 'Auto-rollbacks · 7d', value: '1', sub: 'checkout-redesign', icon: BoltIcon },
]

const APPROVALS = [
  { flag: 'payments-retry', who: 'sam@', change: 'rolloutPercent 20 → 35', tone: 'amber' },
  { flag: 'new-nav', who: 'lee@', change: 'enable in prod', tone: 'amber' },
  { flag: 'pricing-v3', who: 'ada@', change: 'add rule plan = enterprise', tone: 'amber' },
]

const ACTIVITY = [
  {
    kind: 'auto_rollback',
    title: 'checkout-redesign disabled by guard',
    meta: 'error rate breached 2 windows · pushed to 6 SDKs',
    time: '18m ago',
    icon: BoltIcon,
    tone: 'red',
  },
  {
    kind: 'approval',
    title: 'search-ranking-v2 approved',
    meta: 'dana@ · 2 / 2 approvals',
    time: '1h ago',
    icon: CheckIcon,
    tone: 'green',
  },
  {
    kind: 'config_change',
    title: 'onboarding-tour rollout raised to 50%',
    meta: 'lee@ · release flag',
    time: '3h ago',
    icon: FlagIcon,
    tone: 'ink',
  },
  {
    kind: 'break_glass',
    title: 'break-glass granted on payments-kill',
    meta: 'sam@ · expires in 42m',
    time: '4h ago',
    icon: ShieldIcon,
    tone: 'amber',
  },
  {
    kind: 'ops_toggle',
    title: 'maintenance-banner switched off',
    meta: 'ops flag · no approval needed',
    time: '6h ago',
    icon: FlagIcon,
    tone: 'ink',
  },
]

const PROJECTS = [
  { name: 'Checkout Platform', flags: 28, envs: ['dev', 'staging', 'prod'] },
  { name: 'Growth', flags: 11, envs: ['dev', 'prod'] },
  { name: 'Internal Tools', flags: 3, envs: ['dev'] },
]

const EXPERIMENTS = [
  { name: 'signup-cta', lift: '+29%', state: 'Significant', tone: 'green', progress: 92 },
  { name: 'checkout-redesign', lift: 'n/a', state: 'Collecting', tone: 'blue', progress: 61 },
  { name: 'price-anchor', lift: '+4%', state: 'Insufficient data', tone: 'faint', progress: 24 },
]

/* ------------------------------ helpers ------------------------------- */

const TONE_DOT = {
  red: 'bg-[#c0392b]',
  green: 'bg-signal-green',
  amber: 'bg-[#b5811f]',
  blue: 'bg-signal-blue',
  ink: 'bg-ink',
  faint: 'bg-ink-faint',
}

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

/* -------------------------------- page -------------------------------- */

export default function Dashboard() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">{today}</p>
          <h1 className="display mt-2 text-3xl text-ink md:text-4xl">
            {greeting()}, xyz
          </h1>
          <p className="mt-2 text-ink-soft">
            Here is what moved in <span className="font-medium text-ink">Checkout Platform · prod</span> today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="btn-ghost py-2.5">
            <ScrollIcon className="h-4 w-4" />
            View audit log
          </button>
        </div>
      </div>

      {/* Auto-rollback alert */}
      <div className="card overflow-hidden border-[#f0c9c4]">
        <div className="flex flex-col gap-4 bg-[#fbeae8] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#c0392b] text-white">
              <BoltIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-[#7d2018]">
                Auto-rollback fired on checkout-redesign
              </p>
              <p className="mt-0.5 text-sm text-[#95443b]">
                Error rate crossed the threshold for 2 consecutive windows. The flag
                was disabled and the new config pushed to every SDK 18 minutes ago.
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

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map(({ label, value, sub, icon: Icon, accent }) => (
          <div
            key={label}
            className={`card p-5 ${accent ? 'ring-1 ring-accent/40' : ''}`}
          >
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
            <a
              href="/audit"
              className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
            >
              See all
            </a>
          }
        >
          <ol className="space-y-1">
            {ACTIVITY.map((a, i) => (
              <li
                key={i}
                className="flex items-start gap-3.5 rounded-xl px-2 py-2.5 transition-colors hover:bg-surface"
              >
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-canvas text-ink">
                  <a.icon className="h-[1.05rem] w-[1.05rem]" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">
                    <span
                      className={`mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle ${TONE_DOT[a.tone]}`}
                    />
                    {a.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-ink-faint">{a.meta}</p>
                </div>
                <span className="shrink-0 whitespace-nowrap text-xs text-ink-faint">
                  {a.time}
                </span>
              </li>
            ))}
          </ol>
        </SectionCard>

        {/* Right column */}
        <div className="space-y-6">
          {/* Pending approvals */}
          <SectionCard
            title="Pending approvals"
            action={
              <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong">
                {APPROVALS.length} waiting
              </span>
            }
          >
            <div className="space-y-3">
              {APPROVALS.map((c) => (
                <div
                  key={c.flag}
                  className="rounded-xl border border-line bg-surface px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-sm text-ink">{c.flag}</span>
                    <span className="rounded-full bg-[#fdf0d9] px-2 py-0.5 text-[0.7rem] font-semibold text-[#b5811f]">
                      Pending
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-faint">
                    {c.change} · by {c.who}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-lg bg-ink py-1.5 text-xs font-semibold text-surface transition-colors hover:bg-[#26251f]"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-line-strong py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-canvas"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Projects */}
          <SectionCard title="Projects">
            <ul className="space-y-2.5">
              {PROJECTS.map((p) => (
                <li
                  key={p.name}
                  className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{p.name}</p>
                    <p className="text-xs text-ink-faint">{p.flags} flags</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {p.envs.map((e) => (
                      <span
                        key={e}
                        className="rounded-full border border-line bg-canvas px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-ink-faint"
                      >
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
          <a
            href="/experiments"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Manage
          </a>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          {EXPERIMENTS.map((x) => (
            <div key={x.name} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-ink">{x.name}</span>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                    x.tone === 'green'
                      ? 'text-signal-green'
                      : x.tone === 'blue'
                        ? 'text-signal-blue'
                        : 'text-ink-faint'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${TONE_DOT[x.tone]}`} />
                  {x.state}
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-semibold tracking-tight text-ink">
                  {x.lift}
                </span>
                <span className="text-xs text-ink-faint">{x.progress}% to horizon</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                <div
                  className="h-full rounded-full bg-ink"
                  style={{ width: `${x.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}
