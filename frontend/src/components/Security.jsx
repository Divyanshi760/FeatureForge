import { PlugIcon, GlobeIcon, KeyIcon, ScrollIcon } from './icons'

const ITEMS = [
  {
    icon: GlobeIcon,
    title: 'Self-hosted',
    body: 'Runs on your own infrastructure with Docker Compose, on MongoDB, Redis, and Node. Nothing leaves your network.',
  },
  {
    icon: PlugIcon,
    title: 'Real-time SDK',
    body: 'Config diffs push over Server-Sent Events, fanned out through Redis pub/sub across every API instance.',
  },
  {
    icon: KeyIcon,
    title: 'Scoped access',
    body: 'JWT for the dashboard, env-scoped keys for the SDK, and RBAC roles bound per org, project and flag.',
  },
  {
    icon: ScrollIcon,
    title: 'Compliance-ready',
    body: 'An append-only audit log with before/after diffs and CSV/JSON export for every reviewer who asks.',
  },
]

export default function Security() {
  return (
    <section id="security" className="bg-surface">
      <div className="container-ff py-24 md:py-32">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Integration &amp; security</p>
            <h2 className="display mt-4 text-4xl text-ink md:text-5xl">
              Yours to run, safe by design
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ink-soft">
              FeatureForge is built to sit inside your stack, degrade
              gracefully, and never hard-fail. If it loses connection, the SDK
              keeps serving the last config it knows is good, so your users
              never notice.
            </p>
            <a href="#cta" className="btn-primary mt-8">
              Read the integration guide
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
