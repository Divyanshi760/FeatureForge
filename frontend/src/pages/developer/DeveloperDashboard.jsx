import { ISSUES, PRIORITY_META, STATUS_META } from '../../data/issues'

// Mock: issues assigned to the current developer (dev-1: Dana Walsh)
const MY_ISSUES = ISSUES.filter((i) => i.assignedTo?.id === 'dev-1')
const OPEN_ISSUES = ISSUES.filter((i) => i.status === 'open')

export default function DeveloperDashboard() {
  const activeCount = MY_ISSUES.filter(
    (i) => i.status === 'assigned' || i.status === 'in_progress'
  ).length
  const resolvedCount = MY_ISSUES.filter((i) => i.status === 'resolved' || i.status === 'closed').length

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Welcome back, Dana 👋
        </h1>
        <p className="text-sm text-ink-faint mt-1">
          Here's your issue overview for today
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card px-5 py-4">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Active</p>
          <p className="text-3xl font-semibold text-ink mt-1">{activeCount}</p>
          <p className="text-xs text-ink-faint mt-1">Issues assigned to you</p>
        </div>
        <div className="card px-5 py-4">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</p>
          <p className="text-3xl font-semibold text-emerald-700 mt-1">{resolvedCount}</p>
          <p className="text-xs text-ink-faint mt-1">Completed issues</p>
        </div>
        <div className="card px-5 py-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Open Pool</p>
          <p className="text-3xl font-semibold text-blue-700 mt-1">{OPEN_ISSUES.length}</p>
          <p className="text-xs text-ink-faint mt-1">Available to pick up</p>
        </div>
        <div className="card px-5 py-4">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Status</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-lg font-semibold text-ink">Free</span>
          </div>
          <p className="text-xs text-ink-faint mt-1">Your availability</p>
        </div>
      </div>

      {/* My Active Issues */}
      <div>
        <h2 className="text-lg font-semibold text-ink mb-4">My Active Issues</h2>
        {MY_ISSUES.length === 0 ? (
          <div className="card px-6 py-12 text-center text-ink-faint">
            No issues assigned to you. Browse available issues to pick one up!
          </div>
        ) : (
          <div className="space-y-3">
            {MY_ISSUES.map((issue) => {
              const pri = PRIORITY_META[issue.priority]
              const sta = STATUS_META[issue.status]
              return (
                <div key={issue.id} className="card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-ink-faint">{issue.id}</span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold border ${pri.color}`}>
                        {pri.label}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold border ${sta.color}`}>
                        {sta.label}
                      </span>
                    </div>
                    <p className="font-medium text-ink truncate">{issue.title}</p>
                    <p className="text-xs text-ink-faint mt-0.5">
                      Reported by {issue.reportedBy.name} · {new Date(issue.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {issue.status === 'assigned' && (
                      <button className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-[#1a0f00] hover:bg-accent-strong transition-colors">
                        Start Working
                      </button>
                    )}
                    {issue.status === 'in_progress' && (
                      <button className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors">
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Open Issues */}
      <div>
        <h2 className="text-lg font-semibold text-ink mb-4">Recent Open Issues</h2>
        <div className="space-y-3">
          {OPEN_ISSUES.slice(0, 3).map((issue) => {
            const pri = PRIORITY_META[issue.priority]
            return (
              <div key={issue.id} className="card p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:shadow-md transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-ink-faint">{issue.id}</span>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-semibold border ${pri.color}`}>
                      {pri.label}
                    </span>
                  </div>
                  <p className="font-medium text-ink truncate">{issue.title}</p>
                  <p className="text-xs text-ink-faint mt-0.5">
                    Reported by {issue.reportedBy.name}
                  </p>
                </div>
                <button className="rounded-lg border border-ink px-3 py-1.5 text-xs font-semibold text-ink hover:bg-ink hover:text-surface transition-colors">
                  Pick Up
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
