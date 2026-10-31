import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useIssues } from '../../hooks/useIssues'
import { Loading, ErrorState } from '../../components/AsyncState'

export default function UserProfile() {
  const { user, logout } = useAuth()
  const { issues, loading, error, reload } = useIssues()
  const navigate = useNavigate()

  if (loading) return <Loading label="Loading your profile…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const myReports = issues.filter(
    (i) =>
      i.reportedBy?.email === user?.email ||
      (i.reporters || []).some(
        (r) => (user?.email && r.email === user?.email) || (user?.id && r.id === user?.id)
      )
  )

  const total = myReports.length
  const active = myReports.filter((i) =>
    ['open', 'assigned', 'in_progress'].includes(i.status)
  ).length
  const resolved = myReports.filter((i) =>
    ['resolved', 'closed'].includes(i.status)
  ).length

  const name = user?.name || 'User'
  const email = user?.email || ''
  const avatar = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Profile</h1>
        <p className="text-sm text-ink-faint mt-1">Your account and reporting activity</p>
      </div>

      {/* Identity card */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-ink text-xl font-semibold text-surface">
            {avatar}
          </span>
          <div>
            <p className="text-lg font-semibold text-ink">{name}</p>
            <p className="text-sm text-ink-faint">{email}</p>
            <p className="text-xs text-ink-faint mt-1 capitalize">Reporter</p>
          </div>
        </div>
      </div>

      {/* Report stats */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-ink-faint uppercase tracking-wider mb-4">
          Reporting activity
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-2xl font-semibold text-ink">{total}</p>
            <p className="text-xs text-ink-faint mt-0.5">Total reports</p>
          </div>
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-2xl font-semibold text-ink">{active}</p>
            <p className="text-xs text-ink-faint mt-0.5">In progress</p>
          </div>
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-2xl font-semibold text-ink">{resolved}</p>
            <p className="text-xs text-ink-faint mt-0.5">Resolved</p>
          </div>
        </div>
      </div>

      {/* Profile details */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-ink-faint uppercase tracking-wider mb-4">
          Account details
        </h2>
        <div className="space-y-4">
          {[
            ['Full Name', name],
            ['Email', email],
            ['Role', 'User'],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between py-2 border-b border-line last:border-0"
            >
              <span className="text-sm text-ink-faint">{label}</span>
              <span className="text-sm font-medium text-ink">{value}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-line flex justify-end">
          <button
            onClick={handleSignOut}
            className="rounded-xl border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
