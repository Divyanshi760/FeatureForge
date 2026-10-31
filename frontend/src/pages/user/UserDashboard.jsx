import { PRIORITY_META, STATUS_META } from '../../data/issues'
import { useAuth } from '../../context/AuthContext'
import { useIssues } from '../../hooks/useIssues'
import { Loading, ErrorState } from '../../components/AsyncState'

export default function UserDashboard() {
  const { user } = useAuth()
  const { issues, loading, error, reload } = useIssues()

  const myReports = issues.filter(
    (i) =>
      i.reportedBy?.email === user?.email ||
      (i.reporters || []).some((r) => (user?.email && r.email === user?.email) || (user?.id && r.id === user?.id))
  )
  const openCount = myReports.filter((i) => i.status === 'open').length
  const inProgressCount = myReports.filter(
    (i) => i.status === 'assigned' || i.status === 'in_progress'
  ).length
  const resolvedCount = myReports.filter(
    (i) => i.status === 'resolved' || i.status === 'closed'
  ).length

  if (loading) return <Loading label="Loading your dashboard…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  const firstName = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Welcome, {firstName} 👋
        </h1>
        <p className="text-sm text-ink-faint mt-1">
          Track your reported issues and their progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card px-5 py-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Open</p>
          <p className="text-3xl font-semibold text-blue-700 mt-1">{openCount}</p>
          <p className="text-xs text-ink-faint mt-1">Waiting for assignment</p>
        </div>
        <div className="card px-5 py-4">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Progress</p>
          <p className="text-3xl font-semibold text-amber-700 mt-1">{inProgressCount}</p>
          <p className="text-xs text-ink-faint mt-1">Being worked on</p>
        </div>
        <div className="card px-5 py-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</p>
          <p className="text-3xl font-semibold text-emerald-700 mt-1">{resolvedCount}</p>
          <p className="text-xs text-ink-faint mt-1">Completed</p>
        </div>
      </div>

      {/* Recent reports */}
      <div>
        <h2 className="text-lg font-semibold text-ink mb-4">Your Recent Reports</h2>
        {myReports.length === 0 ? (
          <div className="card px-6 py-12 text-center text-ink-faint">
            You haven't reported any issues yet.
          </div>
        ) : (
          <div className="space-y-3">
            {myReports.map((issue) => {
              const pri = PRIORITY_META[issue.priority]
              const sta = STATUS_META[issue.status]
              return (
                <div key={issue.id} className="card p-4 hover:shadow-md transition-shadow">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-ink-faint">{issue.id}</span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold border ${pri.color}`}>
                          {pri.label}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold border ${sta.color}`}>
                          {sta.label}
                        </span>
                      </div>
                      <p className="font-medium text-ink">{issue.title}</p>
                      <p className="text-sm text-ink-soft">{issue.description}</p>
                    </div>

                    {/* Developer assignment info */}
                    {issue.assignedTo && (
                      <div className="shrink-0 rounded-lg bg-surface px-3 py-2 text-xs">
                        <p className="text-ink-faint">Assigned to</p>
                        <p className="font-semibold text-ink mt-0.5">{issue.assignedTo.name}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 text-xs text-ink-faint mt-3 pt-3 border-t border-line">
                    <span>Created {new Date(issue.createdAt).toLocaleDateString()}</span>
                    <span>Updated {new Date(issue.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
