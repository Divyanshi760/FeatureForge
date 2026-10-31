import { PlugIcon, GlobeIcon, KeyIcon, ScrollIcon } from './icons'

const ITEMS = [
  {
    icon: GlobeIcon,
    title: 'Modern stack',
    body: 'A React and Vite dashboard on one side, an Express and MongoDB API on the other, deployed on Vercel and Render.',
  },
  {
    icon: PlugIcon,
    title: 'Change requests',
    body: 'Every governed flag edit becomes a change request that needs a second reviewer before it applies to users.',
  },
  {
    icon: KeyIcon,
    title: 'Scoped access',
    body: 'A JWT-authed dashboard with admin, developer, and user roles, each limited to the actions it should have.',
  },
  {
    icon: ScrollIcon,
    title: 'Audit trail',
    body: 'An append-only audit log with a before and after diff for every change, whether it came from a person or a rollback.',
  },
]

export default function Security() {
  return (
    <section id="security" className="bg-surface">
      <div className="container-ff py-24 md:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Governance &amp; access</p>
            <h2 className="display mt-4 text-4xl text-ink md:text-5xl">
              Governed, audited, role-scoped
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              FeatureForge keeps a clear line between who can propose a change
              and who can approve it, and writes down everything that happens.
              Every action a reviewer takes is captured with its before and
              after state, so nothing moves without a trail.
            </p>
            <a href="#cta" className="btn-primary mt-8">
              Explore governance
            </a>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {ITEMS.map(({ icon: Icon, title, body }) => (
              <div key={title} className="card p-6">
                <Icon className="h-6 w-6 text-ink" />
                <h3 className="mt-4 font-semibold tracking-tight text-ink">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
