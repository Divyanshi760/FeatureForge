import { CheckIcon, ShieldIcon } from './icons'

/** A stylised product screenshot: a flag detail panel with a guarded rollout. */
export default function FlagCard() {
  return (
    <div className="card overflow-hidden shadow-[0_30px_80px_-30px_rgba(16,15,13,0.35)]">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b border-line bg-surface px-5 py-3">
        <span className="h-3 w-3 rounded-full bg-line-strong" />
        <span className="h-3 w-3 rounded-full bg-line-strong" />
        <span className="h-3 w-3 rounded-full bg-line-strong" />
        <span className="ml-3 text-xs font-medium text-ink-faint">
          featureforge · prod · checkout-redesign
        </span>
      </div>

      <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
        {/* Left: flag + rollout */}
        <div className="border-line p-6 md:border-r">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-ink">
                  checkout-redesign
                </h3>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.7rem] font-semibold text-accent-strong">
                  Experiment
                </span>
              </div>
              <p className="mt-1 text-sm text-ink-faint">
                key: <span className="font-mono">checkout_redesign_v2</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e6f6ec] px-2.5 py-1 text-xs font-semibold text-[#2e8b57]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2e8b57]" /> Live
            </span>
          </div>

          {/* rollout slider */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-ink-soft">Rollout</span>
              <span className="font-semibold text-ink">35%</span>
            </div>
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full"
                style={{
                  width: '35%',
                  background: 'linear-gradient(90deg,#ff8933,#f5761a)',
                }}
              />
            </div>
            <p className="mt-2 text-xs text-ink-faint">
              Deterministic bucketing · sticky per user
            </p>
          </div>

          {/* targeting rules */}
          <div className="mt-6 space-y-2">
            <p className="eyebrow">Targeting</p>
            {[
              'country in [US, CA, GB]',
              'plan = enterprise',
              'app_version ≥ 4.2.0',
            ].map((r) => (
              <div
                key={r}
                className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 font-mono text-[0.8rem] text-ink-soft"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-signal-blue" />
                {r}
              </div>
            ))}
          </div>
        </div>

        {/* Right: governance + health */}
        <div className="bg-surface p-6">
          <div className="rounded-xl border border-line bg-panel p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <ShieldIcon className="h-4 w-4 text-ink" />
              Change request
            </div>
            <p className="mt-1.5 text-xs text-ink-faint">
              Rollout 20% → 35% · requested by dana@
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f6ec] px-2 py-0.5 text-[0.7rem] font-semibold text-[#2e8b57]">
                <CheckIcon className="h-3 w-3" /> 2 / 2 approved
              </span>
            </div>
          </div>

          <div className="mt-4">
            <p className="eyebrow">Guarded rollout</p>
            <div className="mt-3 space-y-3">
              <HealthRow label="Error rate" value="0.4%" ok />
              <HealthRow label="p95 latency" value="182ms" ok />
              <HealthRow label="Breach windows" value="0 / 3" ok />
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-[#e6f6ec] px-3 py-2.5 text-xs font-medium text-[#2e8b57]">
            Healthy · auto-rollback armed
          </div>
        </div>
      </div>
    </div>
  )
}

function HealthRow({ label, value, ok }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-soft">{label}</span>
      <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
        {value}
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            ok ? 'bg-[#2e8b57]' : 'bg-[#d9534f]'
          }`}
        />
      </span>
    </div>
  )
}
