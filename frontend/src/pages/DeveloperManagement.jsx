import { useCallback, useEffect, useState } from 'react'
import { STATUS_BADGE } from '../data/developers'
import { PRIORITY_META } from '../data/issues'
import { useIssues } from '../hooks/useIssues'
import { api } from '../lib/api'
import { Loading, ErrorState } from '../components/AsyncState'

export default function DeveloperManagement() {
  const { issues, setIssues, loading: issuesLoading, error: issuesError, reload: reloadIssues } = useIssues()
  const [devs, setDevs] = useState([])
  const [devsLoading, setDevsLoading] = useState(true)
  const [devsError, setDevsError] = useState(null)
  const [filter, setFilter] = useState('all') // all | free | occupied
  const [search, setSearch] = useState('')
  const [assignModal, setAssignModal] = useState(null) // developer object
  const [selectedIssue, setSelectedIssue] = useState('')
  const [feedback, setFeedback] = useState(null)

  const loadDevs = useCallback(async () => {
    setDevsLoading(true)
    setDevsError(null)
    try {
      setDevs(await api.get('/developers'))
    } catch (err) {
      setDevsError(err.message)
    } finally {
      setDevsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDevs()
  }, [loadDevs])

  const filtered = devs.filter((d) => {
    const matchesFilter = filter === 'all' || d.status === filter
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.specialty || '').toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const freeCount = devs.filter((d) => d.status === 'free').length
  const occupiedCount = devs.filter((d) => d.status === 'occupied').length
  const unassignedIssues = issues.filter((i) => !i.assignedTo && i.status === 'open')

  const handleAssign = async () => {
    if (!assignModal || !selectedIssue) return
    const issue = issues.find((i) => i.id === selectedIssue)
    try {
      const updated = await api.post(`/issues/${selectedIssue}/assign`, {
        developer: { id: assignModal._id, name: assignModal.name, email: assignModal.email },
      })
      setIssues((prev) => prev.map((i) => (i.id === selectedIssue ? updated : i)))
      await loadDevs()
      setFeedback({ type: 'success', msg: `${assignModal.name} → ${issue.id}: ${issue.title}` })
      setAssignModal(null)
      setSelectedIssue('')
      setTimeout(() => setFeedback(null), 4000)
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message })
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  if (issuesLoading || devsLoading) return <Loading label="Loading developers…" />
  if (issuesError) return <ErrorState message={issuesError} onRetry={reloadIssues} />
  if (devsError) return <ErrorState message={devsError} onRetry={loadDevs} />

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Developer Management</h1>
          <p className="text-sm text-ink-faint mt-1">
            Monitor availability and assign issues to free developers
          </p>
        </div>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
          feedback.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}>
          {feedback.type === 'error' ? `✕ ${feedback.msg}` : `✓ Assigned: ${feedback.msg}`}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card px-5 py-4">
          <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider">Total</p>
          <p className="text-3xl font-semibold text-ink mt-1">{devs.length}</p>
          <p className="text-xs text-ink-faint mt-1">Registered developers</p>
        </div>
        <div className="card px-5 py-4 border-emerald-200">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Free</p>
          <p className="text-3xl font-semibold text-emerald-700 mt-1">{freeCount}</p>
          <p className="text-xs text-ink-faint mt-1">Available for assignment</p>
        </div>
        <div className="card px-5 py-4 border-amber-200">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Occupied</p>
          <p className="text-3xl font-semibold text-amber-700 mt-1">{occupiedCount}</p>
          <p className="text-xs text-ink-faint mt-1">Currently working</p>
        </div>
        <div className="card px-5 py-4 border-blue-200">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Open Issues</p>
          <p className="text-3xl font-semibold text-blue-700 mt-1">{unassignedIssues.length}</p>
          <p className="text-xs text-ink-faint mt-1">Awaiting assignment</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search developers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
        />
        <div className="flex gap-1.5">
          {['all', 'free', 'occupied'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-ink text-surface'
                  : 'bg-surface border border-line text-ink-soft hover:text-ink'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Developer cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((dev) => {
          const badge = STATUS_BADGE[dev.status]
          return (
            <div key={dev._id} className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-sm font-semibold text-surface">
                    {dev.avatar || dev.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{dev.name}</p>
                    <p className="text-xs text-ink-faint">{dev.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${badge.classes}`}>
                  {badge.label}
                </span>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-surface px-3 py-2">
                  <p className="text-[0.65rem] font-semibold text-ink-faint uppercase tracking-wider">Specialty</p>
                  <p className="text-sm font-medium text-ink mt-0.5">{dev.specialty || '—'}</p>
                </div>
                <div className="rounded-lg bg-surface px-3 py-2">
                  <p className="text-[0.65rem] font-semibold text-ink-faint uppercase tracking-wider">Active</p>
                  <p className="text-sm font-medium text-ink mt-0.5">{dev.activeIssues} issue{dev.activeIssues !== 1 ? 's' : ''}</p>
                </div>
                <div className="rounded-lg bg-surface px-3 py-2">
                  <p className="text-[0.65rem] font-semibold text-ink-faint uppercase tracking-wider">Resolved</p>
                  <p className="text-sm font-medium text-ink mt-0.5">{dev.resolvedTotal} total</p>
                </div>
                <div className="rounded-lg bg-surface px-3 py-2">
                  <p className="text-[0.65rem] font-semibold text-ink-faint uppercase tracking-wider">Joined</p>
                  <p className="text-sm font-medium text-ink mt-0.5">{new Date(dev.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
                </div>
              </div>

              {/* Current issue */}
              {dev.currentIssue && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                  <p className="text-[0.65rem] font-semibold text-amber-600 uppercase tracking-wider">Working on</p>
                  <p className="text-sm font-medium text-amber-800 mt-0.5">{dev.currentIssue}</p>
                </div>
              )}

              {/* Assign button — only for free devs when open issues exist */}
              {dev.status === 'free' && unassignedIssues.length > 0 && (
                <button
                  onClick={() => { setAssignModal(dev); setSelectedIssue('') }}
                  className="mt-auto rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-[#1a0f00] hover:bg-accent-strong transition-colors"
                >
                  Assign Issue →
                </button>
              )}

              {dev.status === 'free' && unassignedIssues.length === 0 && (
                <p className="mt-auto text-xs text-ink-faint italic text-center py-2">No open issues to assign</p>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card px-4 py-12 text-center text-ink-faint">
          No developers match your filters.
        </div>
      )}

      {/* Assign Issue Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setAssignModal(null)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-line bg-panel p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-ink mb-1">Assign Issue to {assignModal.name}</h2>
            <p className="text-sm text-ink-faint mb-4">
              Select an unassigned open issue. Priority is auto-set by report count.
            </p>

            {unassignedIssues.length === 0 ? (
              <p className="text-sm text-ink-faint py-4">No open issues available.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {unassignedIssues.map((issue) => {
                  const pri = PRIORITY_META[issue.priority]
                  return (
                    <label
                      key={issue.id}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                        selectedIssue === issue.id
                          ? 'border-accent bg-accent-soft'
                          : 'border-line hover:bg-surface'
                      }`}
                    >
                      <input
                        type="radio"
                        name="issue"
                        value={issue.id}
                        checked={selectedIssue === issue.id}
                        onChange={() => setSelectedIssue(issue.id)}
                        className="sr-only"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono text-ink-faint">{issue.id}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.6rem] font-semibold border ${pri.color}`}>
                            {pri.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-ink truncate">{issue.title}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-bold text-ink">{issue.reportCount}</p>
                        <p className="text-[0.6rem] text-ink-faint">reports</p>
                      </div>
                    </label>
                  )
                })}
              </div>
            )}

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setAssignModal(null)}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink-soft hover:bg-surface transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!selectedIssue}
                onClick={handleAssign}
                className="flex-1 rounded-xl bg-ink py-2.5 text-sm font-medium text-surface hover:bg-[#26251f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Assign Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
