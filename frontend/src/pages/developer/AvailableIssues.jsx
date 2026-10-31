import { useState } from 'react'
import { PRIORITY_META } from '../../data/issues'
import { useAuth } from '../../context/AuthContext'
import { useIssues } from '../../hooks/useIssues'
import { useNotifications } from '../../hooks/useNotifications'
import { api } from '../../lib/api'
import { Loading, ErrorState } from '../../components/AsyncState'

export default function AvailableIssues() {
  const { user } = useAuth()
  const { issues, setIssues, loading, error, reload } = useIssues()
  const { notifications, markAsRead } = useNotifications()
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [actionError, setActionError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  // Modal state for requesting an issue with estimated days
  const [requestModal, setRequestModal] = useState(null) // { issue, days: 2, note: '' }
  const [submitting, setSubmitting] = useState(false)

  const developer = user && { id: user.id || user._id, name: user.name, email: user.email }

  // Issues open and unassigned can be picked by developers
  const available = issues.filter((i) => i.status === 'open' && !i.assignedTo)

  // Any unread notifications where someone else got assigned in developer's place
  const recentReassignedAlerts = notifications.filter(
    (n) => n.type === 'issue_assignment_update' && !n.read
  )

  const myRequests = issues.filter((i) => {
    const hasInRequests = (i.requests || []).some(
      (r) => r.developer?.email === user?.email && r.status === 'pending'
    )
    const hasInSelfPick = i.selfPickRequest?.requestedBy?.email === user?.email
    return hasInRequests || hasInSelfPick
  })

  const filtered = available.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || i.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const openRequestModal = (issue) => {
    const existingReq = (issue.requests || []).find(
      (r) => r.developer?.email === user?.email && r.status === 'pending'
    ) || (issue.selfPickRequest?.requestedBy?.email === user?.email ? issue.selfPickRequest : null)

    setRequestModal({
      issue,
      days: existingReq?.estimatedDays || 2,
      note: existingReq?.note || '',
      isUpdate: !!existingReq,
    })
    setActionError(null)
  }

  const handleSubmitRequest = async (e) => {
    e.preventDefault()
    if (!requestModal) return
    const days = parseInt(requestModal.days, 10)
    if (!days || days < 1) {
      setActionError('Please enter a valid number of days (at least 1 day).')
      return
    }

    setSubmitting(true)
    setActionError(null)
    try {
      const res = await api.post(`/issues/${requestModal.issue.id}/self-pick`, {
        developer,
        estimatedDays: days,
        note: requestModal.note,
      })

      setIssues((prev) =>
        prev.map((i) => (i.id === requestModal.issue.id ? res.issue : i))
      )
      setFeedback({
        type: 'success',
        msg: `Request submitted for ${requestModal.issue.id} with ${days} day${days > 1 ? 's' : ''} estimate. Waiting for professor approval.`,
      })
      setRequestModal(null)
      setTimeout(() => setFeedback(null), 5000)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading label="Loading available issues…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Available Issues</h1>
        <p className="text-sm text-ink-faint mt-1">
          Browse open issues and specify the estimated number of days you'll take to solve. Professor approval required.
        </p>
      </div>

      {/* Reassignment Alert Banner */}
      {recentReassignedAlerts.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800 text-base">
              📢
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-amber-900">
                Notice: Issue Assignment Update
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                {recentReassignedAlerts[0].message}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => markAsRead(recentReassignedAlerts[0]._id)}
                  className="rounded-lg bg-amber-200/80 px-2.5 py-1 text-[0.75rem] font-medium text-amber-900 hover:bg-amber-300 transition-colors"
                >
                  Dismiss notice
                </button>
                <span className="text-[0.72rem] text-amber-700">
                  Pick and solve any of the available issues below!
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="rounded-xl border border-line bg-surface/70 px-4 py-3 text-sm text-ink-soft flex items-center gap-2">
        <span className="text-accent-strong font-bold">ℹ</span>
        <span>
          <strong>Professor requirement:</strong> Please provide realistic estimated days when requesting an issue. If multiple developers request the same issue, the professor will assign one developer and other applicants will be notified to pick other tasks.
        </span>
      </div>

      {actionError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ✕ {actionError}
        </div>
      )}

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-medium">
          ✓ {feedback.msg}
        </div>
      )}

      {/* Pending requests feedback */}
      {myRequests.length > 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-3 text-sm text-blue-800 flex items-center justify-between flex-wrap gap-2">
          <span>
            📋 You have <strong>{myRequests.length}</strong> active request{myRequests.length > 1 ? 's' : ''} awaiting professor review.
          </span>
          <span className="text-xs text-blue-600 font-medium">
            You can still request additional issues or adjust your estimates anytime.
          </span>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search issues by title or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
        />
        <div className="flex gap-1.5 flex-wrap">
          {['all', 'critical', 'high', 'medium', 'low'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                priorityFilter === p
                  ? 'bg-ink text-surface'
                  : 'bg-surface border border-line text-ink-soft hover:text-ink'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Issues list */}
      {filtered.length === 0 ? (
        <div className="card px-6 py-16 text-center">
          <p className="text-lg font-semibold text-ink">No issues available</p>
          <p className="text-sm text-ink-faint mt-1">Check back later or adjust your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((issue) => {
            const pri = PRIORITY_META[issue.priority]
            const pendingRequests = (issue.requests || []).filter((r) => r.status === 'pending')
            const myReq = pendingRequests.find(
              (r) => r.developer?.email === user?.email
            ) || (issue.selfPickRequest?.requestedBy?.email === user?.email ? issue.selfPickRequest : null)
            const otherRequests = pendingRequests.filter(
              (r) => r.developer?.email !== user?.email
            )

            return (
              <div key={issue.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-ink-faint">{issue.id}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${pri.color}`}>
                        {pri.label}
                      </span>

                      {/* Status tags */}
                      {myReq && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                          <span>⏱️ Your estimate: {myReq.estimatedDays || 1} day{myReq.estimatedDays !== 1 ? 's' : ''}</span>
                        </span>
                      )}

                      {otherRequests.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
                          <span>👥 {otherRequests.length} other developer{otherRequests.length > 1 ? 's' : ''} requested</span>
                        </span>
                      )}
                    </div>

                    <p className="font-semibold text-ink text-base">{issue.title}</p>
                    <p className="text-sm text-ink-soft leading-relaxed">{issue.description}</p>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-faint pt-1">
                      <span>Reported by <span className="font-medium text-ink-soft">{issue.reportedBy?.name || 'User'}</span></span>
                      <span className="inline-flex items-center gap-1 font-medium text-ink-soft bg-surface px-2 py-0.5 rounded border border-line">
                        <span>🕒 Created:</span>
                        <span>
                          {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </span>
                      <span>{issue.reportCount || 1} report{(issue.reportCount || 1) !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <button
                      onClick={() => openRequestModal(issue)}
                      className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
                        myReq
                          ? 'border border-line bg-surface text-ink hover:bg-surface/80'
                          : 'bg-ink text-surface hover:bg-[#26251f]'
                      }`}
                    >
                      {myReq ? 'Update Estimate' : 'Pick Up Issue'}
                    </button>
                    {myReq && (
                      <span className="text-[0.72rem] text-ink-faint text-right">
                        Pending review
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Request Issue with Estimated Days */}
      {requestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => !submitting && setRequestModal(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-semibold text-ink mb-1">
              {requestModal.isUpdate ? 'Update Issue Request' : 'Request to Solve Issue'}
            </h2>
            <p className="text-xs text-ink-faint mb-4">
              Issue <span className="font-semibold text-ink">{requestModal.issue.id}</span>: {requestModal.issue.title}
              <span className="block mt-1 text-[0.72rem] text-ink-soft">
                🕒 Reported {new Date(requestModal.issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(requestModal.issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  Estimated Days to Solve <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={requestModal.days}
                    onChange={(e) =>
                      setRequestModal((prev) => ({ ...prev, days: e.target.value }))
                    }
                    placeholder="e.g. 3"
                    className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink focus:border-line-strong focus:outline-none pr-16"
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-faint">
                    DAYS
                  </span>
                </div>
                <p className="text-[0.75rem] text-ink-faint mt-1.5">
                  The professor considers this timeline when assigning the issue to developers.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-faint mb-1.5">
                  Approach or Note (Optional)
                </label>
                <textarea
                  rows="3"
                  value={requestModal.note}
                  onChange={(e) =>
                    setRequestModal((prev) => ({ ...prev, note: e.target.value }))
                  }
                  placeholder="e.g. Will investigate auth headers and write automated regression test..."
                  className="w-full rounded-xl border border-line bg-surface p-3 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
                />
              </div>

              {/* Notice callout */}
              <div className="rounded-xl border border-accent/30 bg-accent/10 p-3 text-xs text-ink-soft leading-relaxed">
                <strong>Fair Allocation:</strong> If another developer is also requesting this issue, the professor will assign one developer based on estimates and availability. If another developer is assigned, you'll immediately receive a notification so you can pick other issues.
              </div>

              {actionError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                  ✕ {actionError}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setRequestModal(null)}
                  className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink-soft hover:bg-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-ink py-2.5 text-sm font-medium text-surface hover:bg-[#26251f] disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Submitting…' : requestModal.isUpdate ? 'Save Changes' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
