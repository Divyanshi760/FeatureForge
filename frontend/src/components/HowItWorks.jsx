import { BranchIcon, ShieldIcon, GaugeIcon } from './icons'

const STEPS = [
  {
    icon: BranchIcon,
    step: '01',
    title: 'Propose a change',
    body: 'Any change to a governed flag becomes a change request with a before and after diff, instead of a live edit. Ops flags stay fast where speed matters.',
  },
  {
    icon: ShieldIcon,
    step: '02',
    title: 'Review and approve',
    body: 'A second reviewer signs off before the change applies. Break-glass is there for real emergencies, time-boxed and recorded.',
  },
  {
    icon: GaugeIcon,
    step: '03',
    title: 'Roll back when needed',
    body: 'If a rollout misbehaves, the guarded rollback disables the flag, zeroes the rollout, and writes it to the audit log as an auto-rollback.',
  },
]

export default function HowItWorks() {
  return (
    <section className="container-ff py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">How it works</p>
        <h2 className="display mt-4 text-4xl text-ink md:text-5xl">
          From proposal to rollback
        </h2>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">
          A React dashboard talks to a single Express and MongoDB backend over a
          JWT-authed API. Admins, developers, and users each get a role-scoped
          view of the same governed workflow.
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
