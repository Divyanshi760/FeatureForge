import { useState } from 'react'
import { PRIORITY_META, STATUS_META } from '../../data/issues'
import { useAuth } from '../../context/AuthContext'
import { useIssues } from '../../hooks/useIssues'
import { api } from '../../lib/api'
import { Loading, ErrorState } from '../../components/AsyncState'

export default function ReportIssue() {
  const { user } = useAuth()
  const { issues, setIssues, loading, error, reload } = useIssues()
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title: '', description: '' })
  const [feedback, setFeedback] = useState(null) // { type: 'upvoted' | 'created', msg: '' }
  const [submitting, setSubmitting] = useState(false)

  const reporter = user && { id: user.id, name: user.name, email: user.email }
  const hasVoted = (issue) => issue.reporters?.some((r) => r.id === user?.id)

  // All non-closed issues users can see and potentially "+1"
  const visibleIssues = issues.filter((i) => i.status !== 'closed')

  const searchedIssues = visibleIssues.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.description.toLowerCase().includes(search.toLowerCase()) ||
    i.id.toLowerCase().includes(search.toLowerCase())
  )

  const handleUpvote = async (issueId) => {
    const before = issues.find((i) => i.id === issueId)
    try {
      const updated = await api.post(`/issues/${issueId}/upvote`, { reporter })
      setIssues((prev) => prev.map((i) => (i.id === issueId ? updated : i)))
      const escalated = before && updated.priority !== before.priority
      setFeedback({
        type: 'upvoted',
        msg: escalated
          ? `Reported ${issueId} — priority escalated to ${PRIORITY_META[updated.priority].label} (${updated.reportCount} reports)`
          : `Reported ${issueId} — now ${updated.reportCount} reports`,
      })
      setTimeout(() => setFeedback(null), 4000)
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message })
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const created = await api.post('/issues', {
        title: form.title,
        description: form.description,
        reportedBy: reporter,
      })
      setIssues((prev) => [created, ...prev])
      setForm({ title: '', description: '' })
      setFeedback({ type: 'created', msg: `New issue ${created.id} created (priority: Low — 1 report)` })
      setTimeout(() => setFeedback(null), 4000)
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message })
      setTimeout(() => setFeedback(null), 4000)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loading label="Loading issues…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Report an Issue</h1>
        <p className="text-sm text-ink-faint mt-1">
          Check if your issue already exists and upvote it, or report a new one
        </p>
      </div>

      {/* Info banner */}
      <div className="card px-5 py-4">
        <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-2">How priority works</p>
        <p className="text-sm text-ink-soft mb-3">
          Priority is automatically set by the number of people reporting the same issue. More reports = higher priority.
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRIORITY_META).map(([key, meta]) => (
            <span key={key} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${meta.color}`}>
              {meta.label}: {meta.threshold}
            </span>
          ))}
        </div>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
          feedback.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : feedback.type === 'upvoted'
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}>
          {feedback.type === 'error' ? '✕' : '✓'} {feedback.msg}
        </div>
      )}

      {/* ── EXISTING ISSUES ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">Existing Issues</h2>
          <span className="text-xs text-ink-faint">{visibleIssues.length} issues</span>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search existing issues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none mb-4"
        />

        {/* Issue list */}
        <div className="space-y-3 max-h-[28rem] overflow-y-auto pr-1">
          {searchedIssues.map((issue) => {
            const pri = PRIORITY_META[issue.priority]
            const sta = STATUS_META[issue.status]
            const alreadyVoted = hasVoted(issue)
            return (
              <div key={issue.id} className="card p-4 hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Report count column */}
                  <div className="flex flex-col items-center shrink-0 pt-0.5">
                    <button
                      disabled={alreadyVoted}
                      onClick={() => handleUpvote(issue.id)}
                      className={`flex flex-col items-center gap-0.5 rounded-xl border px-3 py-2 transition-all ${
                        alreadyVoted
                          ? 'border-emerald-200 bg-emerald-50 cursor-default'
                          : 'border-line hover:border-accent hover:bg-accent-soft cursor-pointer'
                      }`}
                      title={alreadyVoted ? 'Already reported' : 'I have this issue too'}
                    >
                      <svg viewBox="0 0 24 24" className={`h-4 w-4 ${alreadyVoted ? 'text-emerald-600' : 'text-ink-faint'}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                      <span className={`text-base font-bold ${alreadyVoted ? 'text-emerald-700' : 'text-ink'}`}>
                        {issue.reportCount}
                      </span>
                    </button>
                  </div>

                  {/* Content */}
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
                    <p className="font-medium text-ink mb-1">{issue.title}</p>
                    <p className="text-xs text-ink-soft leading-relaxed line-clamp-2">{issue.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-ink-faint">
                      <span>{issue.reportCount} report{issue.reportCount !== 1 ? 's' : ''}</span>
                      <span>·</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                      {issue.assignedTo && (
                        <>
                          <span>·</span>
                          <span>Assigned to {issue.assignedTo.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* +1 label */}
                  {!alreadyVoted && (
                    <button
                      onClick={() => handleUpvote(issue.id)}
                      className="shrink-0 self-center rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-ink hover:text-surface transition-colors"
                    >
                      I have this too
                    </button>
                  )}
                  {alreadyVoted && (
                    <span className="shrink-0 self-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
                      ✓ Reported
                    </span>
                  )}
                </div>
              </div>
            )
          })}

          {searchedIssues.length === 0 && (
            <div className="text-center py-8 text-ink-faint text-sm">
              No matching issues found. Submit a new one below.
            </div>
          )}
        </div>
      </div>

      {/* ── NEW ISSUE FORM ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Don't see your issue?</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <h3 className="text-base font-semibold text-ink">Report a New Issue</h3>

          {/* Title */}
          <div>
            <label htmlFor="issue-title" className="block text-sm font-medium text-ink mb-2">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              id="issue-title"
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Login page crashes on Safari"
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-faint/50 focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-ink/5 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="issue-desc" className="block text-sm font-medium text-ink mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="issue-desc"
              required
              rows={4}
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the issue in detail. Include steps to reproduce, expected behavior, and what actually happened."
              className="w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-ink-faint/50 focus:border-line-strong focus:outline-none focus:ring-2 focus:ring-ink/5 transition resize-none"
            />
          </div>

          {/* Note: no priority picker */}
          <div className="rounded-lg bg-surface px-4 py-3 text-xs text-ink-faint">
            <span className="font-semibold text-ink-soft">Note:</span> Priority will be automatically set to <span className="font-semibold text-green-700">Low</span> for new issues. It will escalate as more users report the same problem.
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-ink px-6 py-3 text-sm font-semibold text-surface hover:bg-[#26251f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit New Issue'}
          </button>
        </form>
      </div>
    </div>
  )
}
