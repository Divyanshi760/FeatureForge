import { useState } from 'react'
import { PRIORITY_META } from '../data/issues'
import { useIssues } from '../hooks/useIssues'
import { api } from '../lib/api'
import { Loading, ErrorState } from '../components/AsyncState'

export default function ApprovalQueue() {
  const { issues, setIssues, loading, error, reload } = useIssues()
  const [actionFeedback, setActionFeedback] = useState(null)

  const approvals = issues
    .filter((i) => i.selfPickRequest?.requestedBy)
    .map((i) => ({
      id: i.id,
      title: i.title,
      priority: i.priority,
      requestedBy: i.selfPickRequest.requestedBy,
      requestedAt: i.selfPickRequest.requestedAt,
      reportedBy: i.reportedBy,
    }))

  const handleAction = async (issueId, action) => {
    const endpoint = action === 'approved' ? 'approve' : 'reject'
    try {
      const { issue } = await api.post(`/issues/${issueId}/${endpoint}`)
      setIssues((prev) => prev.map((i) => (i.id === issueId ? issue : i)))
      setActionFeedback({ type: 'ok', issueId, action })
    } catch (err) {
      setActionFeedback({ type: 'error', issueId, action, msg: err.message })
    }
    setTimeout(() => setActionFeedback(null), 3000)
  }

  if (loading) return <Loading label="Loading approval queue…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Pick Approvals</h1>
        <p className="text-sm text-ink-faint mt-1">
          Review and approve or reject developer self-pick requests
        </p>
      </div>

      {/* Feedback toast */}
      {actionFeedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
            actionFeedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : actionFeedback.action === 'approved'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {actionFeedback.type === 'error'
            ? `✕ ${actionFeedback.msg}`
            : actionFeedback.action === 'approved'
            ? `✓ Self-pick for ${actionFeedback.issueId} approved`
            : `✕ Self-pick for ${actionFeedback.issueId} rejected`
          }
        </div>
      )}

      {/* Queue */}
      {approvals.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-ink">All caught up!</p>
          <p className="text-sm text-ink-faint mt-1">No pending self-pick requests to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvals.map((req) => {
            const pri = PRIORITY_META[req.priority]
            return (
              <div key={req.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono text-ink-faint">{req.id}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${pri.color}`}>
                        {pri.label}
                      </span>
                    </div>
                    <p className="font-semibold text-ink text-base">{req.title}</p>

                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                      {/* Developer who picked */}
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-[0.6rem] font-bold text-[#1a0f00]">
                          {req.requestedBy.name.split(' ').map(n => n[0]).join('')}
                        </span>
                        <div>
                          <p className="text-xs text-ink-faint">Requested by</p>
                          <p className="text-sm font-medium text-ink">{req.requestedBy.name}</p>
                        </div>
                      </div>

                      {/* Original reporter */}
                      <div className="flex items-center gap-2">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-signal-blue/20 text-[0.6rem] font-bold text-signal-blue">
                          {req.reportedBy.name.split(' ').map(n => n[0]).join('')}
                        </span>
                        <div>
                          <p className="text-xs text-ink-faint">Reported by</p>
                          <p className="text-sm font-medium text-ink">{req.reportedBy.name}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-ink-faint">Requested at</p>
                        <p className="text-sm font-medium text-ink">
                          {new Date(req.requestedAt).toLocaleString('en-US', {
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 sm:flex-col sm:ml-4">
                    <button
                      onClick={() => handleAction(req.id, 'approved')}
                      className="flex-1 sm:flex-none rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-surface hover:bg-[#26251f] transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.id, 'rejected')}
                      className="flex-1 sm:flex-none rounded-xl border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
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
