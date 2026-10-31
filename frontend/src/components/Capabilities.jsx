import {
  FlagIcon,
  ShieldIcon,
  BeakerIcon,
  GaugeIcon,
  KeyIcon,
  ScrollIcon,
} from './icons'

const CAPS = [
  {
    icon: FlagIcon,
    title: 'Feature flags',
    body: 'Release, Experiment, Ops and Permission flags, each with an on/off state and a rollout percentage you control.',
  },
  {
    icon: ShieldIcon,
    title: 'Governed change',
    body: 'Every production change to a governed flag becomes a change request, and a second person has to sign off before it reaches a user.',
  },
  {
    icon: BeakerIcon,
    title: 'Experiments',
    body: 'Turn any flag into an experiment and track exposures and conversions per variant, gated by sample size and a fixed horizon.',
  },
  {
    icon: GaugeIcon,
    title: 'Guarded rollback',
    body: 'When a metric breaches, one guarded action disables the flag, drops the rollout to zero, and records why.',
  },
  {
    icon: KeyIcon,
    title: 'Break-glass access',
    body: 'Time-boxed emergency access around the approval gate, notified on grant and auto-revoked at expiry.',
  },
  {
    icon: ScrollIcon,
    title: 'Immutable audit',
    body: 'One append-only entry for every change, whether it came from a person, an ops toggle, break-glass, or an automatic rollback, each with a before and after diff.',
  },
]

export default function Capabilities() {
  return (
    <section id="capabilities" className="container-ff py-24 md:py-32">
      <div className="max-w-2xl">
        <p className="eyebrow">The platform</p>
        <h2 className="display mt-4 text-4xl text-ink md:text-5xl">
          One loop, closed end to end
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          Controlling exposure, reviewing every change, measuring impact, and
          protecting production. FeatureForge brings these together in one
          governed workflow.
        </p>
      </div>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CAPS.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="card group p-7 transition-shadow hover:shadow-[0_20px_50px_-30px_rgba(16,15,13,0.4)]"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-canvas text-ink transition-colors group-hover:bg-ink group-hover:text-surface">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">
              {title}
            </h3>
            <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
