import { CheckIcon, BoltIcon } from './icons'

function Bullet({ children }) {
  return (
    <li className="flex gap-3">
      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-canvas text-ink">
        <CheckIcon className="h-3.5 w-3.5" />
      </span>
      <span className="text-[0.95rem] leading-relaxed text-ink-soft">{children}</span>
    </li>
  )
}

function Row({ id, eyebrow, title, body, bullets, visual, reverse }) {
  return (
    <div
      id={id}
      className={`grid items-center gap-12 lg:grid-cols-2 ${
        reverse ? 'lg:[&>*:first-child]:order-2' : ''
      }`}
    >
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display mt-4 text-3xl text-ink md:text-[2.6rem]">{title}</h2>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">{body}</p>
        <ul className="mt-7 space-y-3.5">
          {bullets.map((b) => (
            <Bullet key={b}>{b}</Bullet>
          ))}
        </ul>
      </div>
      <div>{visual}</div>
    </div>
  )
}

/* ----------------------------- visuals ----------------------------- */

function GovernanceVisual() {
  return (
    <div className="card p-6">
      <p className="eyebrow">Approval queue</p>
      <div className="mt-4 space-y-3">
        {[
          { flag: 'payments-retry', who: 'sam@', state: 'Pending', tone: 'amber' },
          { flag: 'new-nav', who: 'lee@', state: 'Approved', tone: 'green' },
          { flag: 'pricing-v3', who: 'ada@', state: 'Rejected', tone: 'red' },
        ].map((c) => (
          <div
            key={c.flag}
            className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3"
          >
            <div>
              <div className="font-mono text-sm text-ink">{c.flag}</div>
              <div className="text-xs text-ink-faint">requested by {c.who}</div>
            </div>
            <span
              className={
                'rounded-full px-2.5 py-1 text-xs font-semibold ' +
                (c.tone === 'green'
                  ? 'bg-[#e6f6ec] text-[#2e8b57]'
                  : c.tone === 'amber'
                    ? 'bg-[#fdf0d9] text-[#b5811f]'
                    : 'bg-[#fbe6e5] text-[#c0392b]')
              }
            >
              {c.state}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-line-strong px-4 py-3 text-xs text-ink-faint">
        Diff · rolloutPercent <span className="font-mono">20 → 35</span> · requires 2
        approvals
      </div>
    </div>
  )
}

function ExperimentVisual() {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Experiment · signup-cta</p>
        <span className="rounded-full bg-[#e6f6ec] px-2.5 py-1 text-xs font-semibold text-[#2e8b57]">
          Tracking
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        {[
          { name: 'Control', rate: '4.1%', w: '41%', c: '#8b877e' },
          { name: 'Variant B', rate: '5.3%', w: '53%', c: '#ff8933' },
        ].map((v) => (
          <div key={v.name} className="rounded-xl border border-line bg-surface p-4">
            <div className="text-sm text-ink-soft">{v.name}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              {v.rate}
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full"
                style={{ width: v.w, background: v.c }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[
          ['Exposures', '18.4k'],
          ['Conversions', '970'],
          ['Lift', '+29%'],
        ].map(([k, val]) => (
          <div key={k} className="rounded-lg bg-canvas py-2.5">
            <div className="text-sm font-semibold text-ink">{val}</div>
            <div className="text-[0.7rem] uppercase tracking-wide text-ink-faint">
              {k}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RolloutVisual() {
  const bars = [38, 42, 40, 45, 44, 78, 91]
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Guarded rollout · error rate</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fbe6e5] px-2.5 py-1 text-xs font-semibold text-[#c0392b]">
          <BoltIcon className="h-3.5 w-3.5" /> Auto-rollback
        </span>
      </div>
      <div className="mt-6 flex h-32 items-end gap-2">
        {bars.map((h, i) => {
          const breach = h > 60
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div
                className="w-full rounded-t-md"
                style={{
                  height: `${h}%`,
                  background: breach ? '#d9534f' : '#cbd8ea',
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-faint">
        <span>threshold breached · window 6, 7</span>
        <span className="font-semibold text-[#c0392b]">flag disabled · logged</span>
      </div>
    </div>
  )
}

export default function FeatureSections() {
  return (
    <section className="bg-surface">
      <div className="container-ff space-y-28 py-24 md:space-y-36 md:py-32">
        <Row
          id="governance"
          eyebrow="Governance"
          title="Nothing reaches users without a second look"
          body="Any change to a Release, Experiment, or Permission flag in production becomes a change request instead of a live edit. Ops flags stay fast where speed matters, and break-glass is there for the real emergencies."
          bullets={[
            'Four-eyes approval enforced on governed flags',
            'Ops-flag exemption for pre-approved, low-risk toggles',
            'Time-boxed break-glass, auto-revoked when it expires',
            'Immutable audit entry on every path, human or automatic',
          ]}
          visual={<GovernanceVisual />}
        />
        <Row
          id="experiments"
          eyebrow="Experimentation"
          title="See what each variant did"
          body="Tie a flag's variants to a metric and track exposures and conversions for each one. Results stay directional until you reach the sample size and the horizon you set up front, so an early read never gets mistaken for a result."
          bullets={[
            'Per-variant exposure and conversion tracking',
            'Sample-size gating with an insufficient-data state',
            'A fixed evaluation horizon set up front',
            'Results stay directional until the horizon is met',
          ]}
          visual={<ExperimentVisual />}
          reverse
        />
        <Row
          id="rollouts"
          eyebrow="Guarded rollback"
          title="Contain the damage in one action"
          body="When a metric breaches its threshold, trigger the guarded rollback from the rollouts view. FeatureForge disables the flag, drops the rollout to zero, records the reason on the rollout, and writes it to the audit log as an auto-rollback."
          bullets={[
            'Drops the rollout to zero and disables the flag',
            'Reason recorded on the rollout and in the audit log',
            'Auto-rollback tagged distinctly from manual changes',
            'One guarded action from the rollouts view',
          ]}
          visual={<RolloutVisual />}
        />
      </div>
    </section>
  )
}
