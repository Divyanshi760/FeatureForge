import { useState } from 'react'
import { PRIORITY_META } from '../data/issues'
import { useIssues } from '../hooks/useIssues'
import { api } from '../lib/api'
import { Loading, ErrorState } from '../components/AsyncState'

export default function ApprovalQueue() {
  const { issues, setIssues, loading, error, reload } = useIssues()
  const [actionFeedback, setActionFeedback] = useState(null)
  const [processingId, setProcessingId] = useState(null)

  // Find all open issues that have pending self-pick requests
  const pendingIssues = issues.filter((i) => {
    if (i.status !== 'open' || i.assignedTo) return false
    const hasPendingInRequests = (i.requests || []).some((r) => r.status === 'pending')
    const hasLegacySelfPick = !!i.selfPickRequest?.requestedBy
    return hasPendingInRequests || hasLegacySelfPick
  })

  const handleApprove = async (issueId, dev) => {
    setProcessingId(`${issueId}-${dev.email || dev.id}`)
    try {
      const res = await api.post(`/issues/${issueId}/approve`, {
        developerEmail: dev.email,
        developerId: dev.id,
      })
      setIssues((prev) => prev.map((i) => (i.id === issueId ? res.issue : i)))
      setActionFeedback({
        type: 'ok',
        msg: `Assigned ${dev.name} to ${issueId}. Any other applicants have been notified that ${dev.name} was assigned and that they can pick other open issues.`,
      })
    } catch (err) {
      setActionFeedback({ type: 'error', msg: err.message })
    } finally {
      setProcessingId(null)
      setTimeout(() => setActionFeedback(null), 6000)
    }
  }

  const handleReject = async (issueId, dev) => {
    setProcessingId(`${issueId}-${dev.email || dev.id}`)
    try {
      const res = await api.post(`/issues/${issueId}/reject`, {
        developerEmail: dev.email,
        developerId: dev.id,
      })
      setIssues((prev) => prev.map((i) => (i.id === issueId ? res.issue : i)))
      setActionFeedback({
        type: 'rejected',
        msg: `Declined request from ${dev.name} for ${issueId}. Notification sent.`,
      })
    } catch (err) {
      setActionFeedback({ type: 'error', msg: err.message })
    } finally {
      setProcessingId(null)
      setTimeout(() => setActionFeedback(null), 5000)
    }
  }

  if (loading) return <Loading label="Loading approval queue…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Professor Review & Approvals</h1>
          <p className="text-sm text-ink-faint mt-1">
            Compare developer timeline estimates (days to solve) and assign issues. Other applicants will be notified automatically.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-strong border border-accent/40">
            {pendingIssues.length} issue{pendingIssues.length !== 1 ? 's' : ''} awaiting review
          </span>
        </div>
      </div>

      {/* Professor Instructions Banner */}
      <div className="rounded-2xl border border-line bg-surface/60 p-4 text-xs text-ink-soft leading-relaxed flex items-start gap-3">
        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-accent text-[0.7rem] font-bold text-[#1a0f00]">
          ⚖️
        </span>
        <div>
          <span className="font-semibold text-ink">How Assignment Works:</span> Review the estimated days to solve submitted by each developer. When you approve one developer, the system assigns them immediately and automatically sends a notification to all other applicants with the assignee's details so they can pick other open issues.
        </div>
      </div>

      {/* Feedback toast */}
      {actionFeedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
            actionFeedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : actionFeedback.type === 'rejected'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {actionFeedback.type === 'error' ? '✕' : '✓'} {actionFeedback.msg}
        </div>
      )}

      {/* Queue */}
      {pendingIssues.length === 0 ? (
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
        <div className="space-y-6">
          {pendingIssues.map((issue) => {
            const pri = PRIORITY_META[issue.priority]

            // Collect all candidate requests
            let candidates = (issue.requests || []).filter((r) => r.status === 'pending')
            // If requests array was empty but legacy selfPickRequest exists
            if (candidates.length === 0 && issue.selfPickRequest?.requestedBy) {
              candidates = [
                {
                  developer: issue.selfPickRequest.requestedBy,
                  estimatedDays: issue.selfPickRequest.estimatedDays || 1,
                  note: issue.selfPickRequest.note || '',
                  requestedAt: issue.selfPickRequest.requestedAt || issue.createdAt,
                  status: 'pending',
                },
              ]
            }

            const isMultiple = candidates.length > 1

            return (
              <div key={issue.id} className="card p-6 shadow-sm border border-line hover:border-line-strong transition-colors space-y-5">
                {/* Issue Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between border-b border-line pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono text-ink-faint">{issue.id}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${pri.color}`}>
                        {pri.label}
                      </span>
                      {isMultiple && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 border border-purple-200">
                          ⚡ {candidates.length} Developers Competing
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-ink text-lg">{issue.title}</h3>
                    <p className="text-sm text-ink-soft mt-1 leading-relaxed">{issue.description}</p>
                  </div>

                  <div className="text-xs text-ink-faint shrink-0 sm:text-right">
                    <p>Reported by <span className="font-medium text-ink-soft">{issue.reportedBy?.name || 'Anonymous'}</span></p>
                    <p className="mt-0.5">{new Date(issue.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Candidates Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                      {isMultiple ? 'Applicant Proposals & Days Estimates' : 'Developer Proposal'}
                    </h4>
                    <span className="text-xs text-ink-faint">
                      Select which developer to assign
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-2">
                    {candidates.map((cand, idx) => {
                      const dev = cand.developer || {}
                      const key = `${issue.id}-${dev.email || dev.id || idx}`
                      const isProcessing = processingId === key

                      return (
                        <div
                          key={key}
                          className="relative flex flex-col justify-between rounded-xl border border-line bg-surface/70 p-4 hover:border-line-strong transition-all"
                        >
                          <div className="space-y-3">
                            {/* Dev info & Estimated days highlight */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-surface">
                                  {(dev.name || 'D').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-ink line-clamp-1">{dev.name}</p>
                                  <p className="text-xs text-ink-faint line-clamp-1">{dev.email}</p>
                                </div>
                              </div>

                              {/* Prominent Estimated Days Badge */}
                              <div className="text-right shrink-0">
                                <div className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-[#1a0f00] shadow-sm">
                                  <span>⏱️</span>
                                  <span>{cand.estimatedDays} {cand.estimatedDays === 1 ? 'Day' : 'Days'}</span>
                                </div>
                                <p className="text-[0.65rem] text-ink-faint mt-1">Estimated duration</p>
                              </div>
                            </div>

                            {/* Note / pitch if present */}
                            {cand.note && (
                              <div className="rounded-lg bg-panel/80 border border-line/60 p-2.5 text-xs text-ink-soft">
                                <span className="font-medium text-ink-faint block text-[0.7rem] uppercase tracking-wider mb-0.5">Plan / Note:</span>
                                {cand.note}
                              </div>
                            )}

                            <div className="text-[0.72rem] text-ink-faint">
                              Requested {new Date(cand.requestedAt).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-4 mt-3 border-t border-line/60">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleReject(issue.id, dev)}
                              className="rounded-xl border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleApprove(issue.id, dev)}
                              className="flex-1 rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-surface hover:bg-[#26251f] disabled:opacity-50 transition-colors shadow-sm"
                            >
                              {isProcessing ? 'Assigning…' : `Assign to ${dev.name.split(' ')[0]}`}
                            </button>
                          </div>
                        </div>
                      )
                    })}
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
