import { useState } from 'react'
import { PRIORITY_META, STATUS_META } from '../../data/issues'
import { useAuth } from '../../context/AuthContext'
import { useIssues } from '../../hooks/useIssues'
import { api } from '../../lib/api'
import { Loading, ErrorState } from '../../components/AsyncState'

const TABS = ['all', 'active', 'resolved']

export default function MyIssues() {
  const { user } = useAuth()
  const { issues, setIssues, loading, error, reload } = useIssues()
  const [tab, setTab] = useState('all')
  const [actionError, setActionError] = useState(null)

  const myIssues = issues.filter((i) => i.assignedTo?.email === user?.email)

  const updateStatus = async (issueId, status) => {
    setActionError(null)
    try {
      const updated = await api.patch(`/issues/${issueId}/status`, { status })
      setIssues((prev) => prev.map((i) => (i.id === issueId ? updated : i)))
    } catch (err) {
      setActionError(err.message)
    }
  }

  const filtered = myIssues.filter((i) => {
    if (tab === 'active') return i.status === 'assigned' || i.status === 'in_progress'
    if (tab === 'resolved') return i.status === 'resolved' || i.status === 'closed'
    return true
  })

  if (loading) return <Loading label="Loading your issues…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">My Issues</h1>
          <p className="text-sm text-ink-faint mt-1">
            All issues assigned to you or self-picked
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-ink-faint">Total:</span>
          <span className="font-semibold text-ink">{myIssues.length} issues</span>
        </div>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ✕ {actionError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 border-b border-line pb-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
              tab === t
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-faint hover:text-ink-soft'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Issues */}
      {filtered.length === 0 ? (
        <div className="card px-6 py-12 text-center text-ink-faint">
          No issues in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((issue) => {
            const pri = PRIORITY_META[issue.priority]
            const sta = STATUS_META[issue.status]
            return (
              <div key={issue.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-3">
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-ink-faint">{issue.id}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${pri.color}`}>
                        {pri.label}
                      </span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${sta.color}`}>
                        {sta.label}
                      </span>
                      {issue.assignmentType === 'self_picked' && (
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                          Self-picked
                        </span>
                      )}
                      {(issue.estimatedDays || issue.assignedTo?.estimatedDays) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                          ⏱️ Target: {issue.estimatedDays || issue.assignedTo?.estimatedDays} {(issue.estimatedDays || issue.assignedTo?.estimatedDays) === 1 ? 'day' : 'days'}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      {issue.status === 'assigned' && (
                        <button
                          onClick={() => updateStatus(issue.id, 'in_progress')}
                          className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-[#1a0f00] hover:bg-accent-strong transition-colors"
                        >
                          Start Working
                        </button>
                      )}
                      {issue.status === 'in_progress' && (
                        <button
                          onClick={() => updateStatus(issue.id, 'resolved')}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="font-semibold text-ink">{issue.title}</p>
                  <p className="text-sm text-ink-soft leading-relaxed">{issue.description}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-faint pt-2 border-t border-line">
                    <span>Reported by <span className="font-medium text-ink-soft">{issue.reportedBy?.name || 'Anonymous'}</span></span>
                    <span className="inline-flex items-center gap-1 font-medium text-ink-soft bg-surface px-2 py-0.5 rounded border border-line">
                      <span>🕒 Created:</span>
                      <span>
                        {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </span>
                    <span>Updated {new Date(issue.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
