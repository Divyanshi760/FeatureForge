import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PRIORITY_META, STATUS_META } from '../data/issues'
import { useIssues } from '../hooks/useIssues'
import { api } from '../lib/api'
import { Loading, ErrorState } from '../components/AsyncState'

const FILTERS = ['all', 'open', 'assigned', 'in_progress', 'resolved', 'closed']

export default function IssuesManagement() {
  const { issues, setIssues, loading: issuesLoading, error: issuesError, reload: reloadIssues } = useIssues()
  const [devs, setDevs] = useState([])
  const [devsLoading, setDevsLoading] = useState(true)
  const [devsError, setDevsError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [assignModal, setAssignModal] = useState(null) // issue object
  const [selectedDev, setSelectedDev] = useState('')
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

  const filtered = issues.filter((i) => {
    const matchesFilter = filter === 'all' || i.status === filter
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const freeDevelopers = devs.filter((d) => d.status === 'free')
  const unassignedIssues = issues.filter((i) => !i.assignedTo && i.status === 'open')

  const handleAssign = async () => {
    if (!assignModal || !selectedDev) return
    const dev = devs.find((d) => d._id === selectedDev)
    try {
      const updated = await api.post(`/issues/${assignModal.id}/assign`, {
        developer: { id: dev._id, name: dev.name, email: dev.email },
      })
      setIssues((prev) => prev.map((i) => (i.id === assignModal.id ? updated : i)))
      await loadDevs()
      setFeedback({ type: 'success', msg: `${dev.name} assigned to ${assignModal.id}` })
      setAssignModal(null)
      setSelectedDev('')
      setTimeout(() => setFeedback(null), 4000)
    } catch (err) {
      setFeedback({ type: 'error', msg: err.message })
      setTimeout(() => setFeedback(null), 4000)
    }
  }

  if (issuesLoading || devsLoading) return <Loading label="Loading issues…" />
  if (issuesError) return <ErrorState message={issuesError} onRetry={reloadIssues} />
  if (devsError) return <ErrorState message={devsError} onRetry={loadDevs} />

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Issues</h1>
          <p className="text-sm text-ink-faint mt-1">
            Manage reported issues and assign free developers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
            {unassignedIssues.length} unassigned
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            {freeDevelopers.length} devs free
          </span>
        </div>
      </div>

      {/* Priority rules */}
      <div className="card px-5 py-4">
        <p className="text-xs font-semibold text-ink-faint uppercase tracking-wider mb-2">Auto-Priority Rules</p>
        <div className="flex flex-wrap gap-3">
          {Object.entries(PRIORITY_META).map(([key, meta]) => (
            <span key={key} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${meta.color}`}>
              {meta.label}: {meta.threshold}
            </span>
          ))}
        </div>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
          feedback.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}>
          {feedback.type === 'error' ? '✕' : '✓'} {feedback.msg}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search issues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
        />
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? 'bg-ink text-surface'
                  : 'bg-surface border border-line text-ink-soft hover:text-ink'
              }`}
            >
              {f === 'in_progress' ? 'In Progress' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface/50">
                <th className="px-4 py-3 text-left font-semibold text-ink-faint text-xs uppercase tracking-wider">Issue</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-faint text-xs uppercase tracking-wider">Reports</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-faint text-xs uppercase tracking-wider">Priority</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-faint text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-faint text-xs uppercase tracking-wider">Assigned To</th>
                <th className="px-4 py-3 text-left font-semibold text-ink-faint text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((issue) => {
                const pri = PRIORITY_META[issue.priority]
                const sta = STATUS_META[issue.status]
                return (
                  <tr key={issue.id} className="hover:bg-surface/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-medium text-ink">{issue.title}</p>
                        <p className="text-xs text-ink-faint mt-0.5">{issue.id} · {new Date(issue.createdAt).toLocaleDateString()}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-ink">{issue.reportCount}</span>
                        <div className="flex -space-x-1.5">
                          {(issue.reporters || []).slice(0, 3).map((r, idx) => (
                            <span
                              key={r.id}
                              className="grid h-5 w-5 place-items-center rounded-full bg-ink text-[0.5rem] font-semibold text-surface ring-2 ring-panel"
                              title={r.name}
                            >
                              {r.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          ))}
                          {issue.reportCount > 3 && (
                            <span className="grid h-5 w-5 place-items-center rounded-full bg-surface text-[0.5rem] font-semibold text-ink-faint ring-2 ring-panel border border-line">
                              +{issue.reportCount - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${pri.color}`}>
                        {pri.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${sta.color}`}>
                        {sta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {issue.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[0.6rem] font-semibold text-surface">
                            {issue.assignedTo.name.split(' ').map(n => n[0]).join('')}
                          </span>
                          <div>
                            <span className="text-ink-soft text-xs block font-medium">{issue.assignedTo.name}</span>
                            {(issue.estimatedDays || issue.assignedTo.estimatedDays) && (
                              <span className="text-[0.68rem] text-amber-700 font-semibold">
                                ⏱️ {issue.estimatedDays || issue.assignedTo.estimatedDays} {(issue.estimatedDays || issue.assignedTo.estimatedDays) === 1 ? 'day' : 'days'}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-ink-faint text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {!issue.assignedTo && issue.status === 'open' ? (
                        <div className="flex items-center gap-2">
                          {((issue.requests || []).filter(r => r.status === 'pending').length > 0 || issue.selfPickRequest?.requestedBy) ? (
                            <Link
                              to="/approval-queue"
                              className="rounded-lg bg-accent/20 border border-accent/40 px-2.5 py-1 text-xs font-semibold text-accent-strong hover:bg-accent/30 transition-colors"
                            >
                              Review {Math.max(1, (issue.requests || []).filter(r => r.status === 'pending').length)} Request{((issue.requests || []).filter(r => r.status === 'pending').length) > 1 ? 's' : ''}
                            </Link>
                          ) : null}
                          {freeDevelopers.length > 0 ? (
                            <button
                              onClick={() => { setAssignModal(issue); setSelectedDev('') }}
                              className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-surface hover:bg-[#26251f] transition-colors"
                            >
                              Direct Assign
                            </button>
                          ) : (
                            <span className="text-xs text-ink-faint italic">No free devs</span>
                          )}
                        </div>
                      ) : issue.assignedTo ? (
                        <span className="text-xs text-ink-faint">
                          {issue.assignmentType === 'self_picked' ? 'Self-picked' : 'Assigned'}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-ink-faint">
                    No issues match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setAssignModal(null)} />
          <div className="relative w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-ink mb-1">Assign Developer</h2>
            <p className="text-sm text-ink-faint mb-1">
              Issue: <span className="font-medium text-ink">{assignModal.id} — {assignModal.title}</span>
            </p>
            <p className="text-xs text-ink-faint mb-4">
              {assignModal.reportCount} report{assignModal.reportCount !== 1 ? 's' : ''} · Priority auto-set to <span className="font-semibold">{PRIORITY_META[assignModal.priority].label}</span>
            </p>

            {freeDevelopers.length === 0 ? (
              <p className="text-sm text-ink-faint py-4">No free developers available right now.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {freeDevelopers.map((dev) => (
                  <label
                    key={dev._id}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                      selectedDev === dev._id
                        ? 'border-accent bg-accent-soft'
                        : 'border-line hover:bg-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="developer"
                      value={dev._id}
                      checked={selectedDev === dev._id}
                      onChange={() => setSelectedDev(dev._id)}
                      className="sr-only"
                    />
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-semibold text-surface">
                      {dev.avatar || dev.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{dev.name}</p>
                      <p className="text-xs text-ink-faint">{dev.specialty} · {dev.resolvedTotal} resolved</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-700 border border-emerald-200">
                      Free
                    </span>
                  </label>
                ))}
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
                disabled={!selectedDev}
                onClick={handleAssign}
                className="flex-1 rounded-xl bg-ink py-2.5 text-sm font-medium text-surface hover:bg-[#26251f] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Assign Developer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
