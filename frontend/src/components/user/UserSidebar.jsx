import { Link, NavLink } from 'react-router-dom'
import { USER_NAV_SECTIONS } from './nav'
import { BugIcon } from '../icons'

function Mark() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-2">
      <span
        className="grid h-7 w-7 place-items-center rounded-md border border-ink"
        aria-hidden="true"
      >
        <BugIcon className="h-4 w-4" />
      </span>
      <span className="text-[1.05rem] font-semibold tracking-[-0.02em] text-ink">
        FeatureForge
      </span>
    </Link>
  )
}

export default function UserSidebar({ onNavigate }) {
  return (
    <div className="flex h-full flex-col gap-8 py-6">
      <Mark />

      <nav className="flex flex-1 flex-col gap-7 px-3">
        {USER_NAV_SECTIONS.map((section) => (
          <div key={section.heading}>
            <p className="eyebrow px-3 pb-2 text-[0.65rem]">{section.heading}</p>
            <ul className="space-y-0.5">
              {section.items.map(({ label, to, icon: Icon, badge }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-ink text-surface'
                          : 'text-ink-soft hover:bg-surface hover:text-ink'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className="h-[1.15rem] w-[1.15rem] shrink-0" />
                        <span className="flex-1">{label}</span>
                        {badge ? (
                          <span
                            className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[0.7rem] font-semibold ${
                              isActive
                                ? 'bg-surface/20 text-surface'
                                : 'bg-accent-soft text-accent-strong'
                            }`}
                          >
                            {badge}
                          </span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mx-3 flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-signal-blue/30 text-sm font-semibold text-signal-blue">
          RS
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">Riya Sharma</p>
          <p className="truncate text-xs text-ink-faint">User</p>
        </div>
      </div>
    </div>
  )
}
