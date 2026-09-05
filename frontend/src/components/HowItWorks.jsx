import { BranchIcon, BeakerIcon, ShieldIcon } from './icons'

const STEPS = [
  {
    icon: BranchIcon,
    step: '01',
    title: 'Deterministic targeting',
    body: 'The SDK checks rules locally against a cached ruleset (eq, in, contains, gt/lt, semver, regex), then buckets each user with a stable hash. The same user always gets the same variant.',
  },
  {
    icon: BeakerIcon,
    step: '02',
    title: 'Statistical rigor',
    body: 'Exposure and conversion events stream back in batches. The stats engine gates on sample size and a fixed horizon before it ever calls a winner.',
  },
  {
    icon: ShieldIcon,
    step: '03',
    title: 'Automatic protection',
    body: 'Health metrics feed a rolling-window guard. When a rollout misbehaves past the threshold, it’s reversed and recorded before anyone opens a dashboard.',
  },
]

export default function HowItWorks() {
  return (
    <section className="container-ff py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">How it works</p>
        <h2 className="display mt-4 text-4xl text-ink md:text-5xl">
          Specialised where it counts
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          A single Express backend serves a JWT-authed management API and an
          env-scoped SDK API. Your app evaluates flags in-process, so there is
          no round trip on the hot path.
        </p>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {STEPS.map(({ icon: Icon, step, title, body }) => (
          <div key={step} className="relative">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-surface">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-mono text-sm text-ink-faint">{step}</span>
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-ink">
              {title}
            </h3>
            <p className="mt-2.5 text-[0.95rem] leading-relaxed text-ink-soft">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
