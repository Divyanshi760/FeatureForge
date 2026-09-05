import Logo from './Logo'

const COLUMNS = [
  {
    heading: 'Product',
    links: ['Feature flags', 'Governance', 'Experiments', 'Guarded rollouts', 'SDK'],
  },
  {
    heading: 'Platform',
    links: ['Audit log', 'RBAC', 'Break-glass', 'Webhooks', 'Self-hosting'],
  },
  {
    heading: 'Resources',
    links: ['Docs', 'Integration guide', 'API reference', 'Changelog', 'Status'],
  },
  {
    heading: 'Company',
    links: ['About', 'Blog', 'Careers', 'Security', 'Contact'],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-line bg-canvas">
      <div className="container-ff py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              A self-hosted release management platform. Ship the code, control
              the release.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h4 className="text-sm font-semibold text-ink">{col.heading}</h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#top"
                        className="text-sm text-ink-soft transition-colors hover:text-ink"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-sm text-ink-faint sm:flex-row">
          <span>© {new Date().getFullYear()} FeatureForge. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#top" className="transition-colors hover:text-ink">
              Privacy
            </a>
            <a href="#top" className="transition-colors hover:text-ink">
              Terms
            </a>
            <a href="#top" className="transition-colors hover:text-ink">
              Security
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
