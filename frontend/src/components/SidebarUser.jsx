import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_LABEL = { admin: 'Admin', developer: 'Developer', user: 'User' }

export default function SidebarUser({ accentClass = 'bg-ink text-surface' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="mx-3 space-y-2">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5">
        <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold ${accentClass}`}>
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{user?.name || 'Unknown'}</p>
          <p className="truncate text-xs text-ink-faint">{ROLE_LABEL[user?.role] || user?.role}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface hover:text-ink transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
        </svg>
        Sign out
      </button>
    </div>
  )
}
