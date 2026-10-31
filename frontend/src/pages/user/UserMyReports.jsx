import { useState } from 'react'
import { PRIORITY_META, STATUS_META } from '../../data/issues'
import { useAuth } from '../../context/AuthContext'
import { useIssues } from '../../hooks/useIssues'
import { Loading, ErrorState } from '../../components/AsyncState'

const TABS = ['all', 'open', 'in_progress', 'resolved', 'closed']

export default function UserMyReports() {
  const { user } = useAuth()
  const { issues, loading, error, reload } = useIssues()
  const [tab, setTab] = useState('all')

  const myReports = issues.filter(
    (i) =>
      i.reportedBy?.email === user?.email ||
      (i.reporters || []).some((r) => (user?.email && r.email === user?.email) || (user?.id && r.id === user?.id))
  )

  const filtered = myReports.filter((i) => {
    if (tab === 'all') return true
    if (tab === 'in_progress') return i.status === 'assigned' || i.status === 'in_progress'
    return i.status === tab
  })

  if (loading) return <Loading label="Loading your reports…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">My Reports</h1>
          <p className="text-sm text-ink-faint mt-1">
            Track the status of issues you've reported
          </p>
        </div>
        <p className="text-sm text-ink-faint">
          <span className="font-semibold text-ink">{myReports.length}</span> total reports
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-line pb-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap px-4 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-faint hover:text-ink-soft'
            }`}
          >
            {t === 'in_progress' ? 'In Progress' : t}
          </button>
        ))}
      </div>

      {/* Issues */}
      {filtered.length === 0 ? (
        <div className="card px-6 py-12 text-center text-ink-faint">
          No reports in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((issue) => {
            const pri = PRIORITY_META[issue.priority]
            const sta = STATUS_META[issue.status]
            return (
              <div key={issue.id} className="card p-5 hover:shadow-md transition-shadow">
                {/* Top row */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="text-xs font-mono text-ink-faint">{issue.id}</span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${pri.color}`}>
                    {pri.label}
                  </span>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${sta.color}`}>
                    {sta.label}
                  </span>
                </div>

                <p className="font-semibold text-ink mb-1">{issue.title}</p>
                <p className="text-sm text-ink-soft leading-relaxed mb-3">{issue.description}</p>

                {/* Status timeline */}
                <div className="rounded-lg bg-surface px-4 py-3">
                  <div className="flex items-center gap-3">
                    {/* Progress dots */}
                    {['open', 'assigned', 'in_progress', 'resolved', 'closed'].map((s, idx) => {
                      const statusOrder = { open: 0, assigned: 1, in_progress: 2, resolved: 3, closed: 4 }
                      const currentOrder = statusOrder[issue.status]
                      const thisOrder = statusOrder[s]
                      const isComplete = thisOrder <= currentOrder
                      const isCurrent = s === issue.status
                      return (
                        <div key={s} className="flex items-center gap-3">
                          {idx > 0 && (
                            <div className={`h-0.5 w-6 rounded-full ${isComplete ? 'bg-emerald-400' : 'bg-line-strong'}`} />
                          )}
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={`h-3 w-3 rounded-full border-2 ${
                                isCurrent
                                  ? 'border-accent bg-accent'
                                  : isComplete
                                  ? 'border-emerald-400 bg-emerald-400'
                                  : 'border-line-strong bg-transparent'
                              }`}
                            />
                            <span className={`text-[0.6rem] capitalize ${isCurrent ? 'font-bold text-ink' : 'text-ink-faint'}`}>
                              {s === 'in_progress' ? 'WIP' : s}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-xs text-ink-faint mt-3 pt-3 border-t border-line">
                  {issue.assignedTo && (
                    <span>Developer: <span className="font-medium text-ink-soft">{issue.assignedTo.name}</span></span>
                  )}
                  <span>Created {new Date(issue.createdAt).toLocaleDateString()}</span>
                  <span>Updated {new Date(issue.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
