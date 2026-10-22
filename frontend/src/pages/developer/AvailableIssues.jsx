import { useState } from 'react'
import { ISSUES, PRIORITY_META } from '../../data/issues'

// Open issues that no one has picked yet
const AVAILABLE = ISSUES.filter((i) => i.status === 'open' && !i.assignedTo)

export default function AvailableIssues() {
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [pickedIds, setPickedIds] = useState([])

  const filtered = AVAILABLE.filter((i) => {
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || i.priority === priorityFilter
    return matchesSearch && matchesPriority && !pickedIds.includes(i.id)
  })

  const handlePick = (issueId) => {
    setPickedIds((prev) => [...prev, issueId])
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Available Issues</h1>
        <p className="text-sm text-ink-faint mt-1">
          Browse open issues and self-pick to work on. Admin approval required.
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <span className="font-semibold">ℹ Note:</span> Self-picked issues require admin approval before you can start working on them.
      </div>

      {/* Recently picked feedback */}
      {pickedIds.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ✓ You've requested {pickedIds.length} issue{pickedIds.length > 1 ? 's' : ''}. Waiting for admin approval.
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search issues..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
        />
        <div className="flex gap-1.5">
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
        <div className="space-y-3">
          {filtered.map((issue) => {
            const pri = PRIORITY_META[issue.priority]
            return (
              <div key={issue.id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-ink-faint">{issue.id}</span>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${pri.color}`}>
                        {pri.label}
                      </span>
                    </div>
                    <p className="font-semibold text-ink">{issue.title}</p>
                    <p className="text-sm text-ink-soft leading-relaxed">{issue.description}</p>
                    <div className="flex gap-4 text-xs text-ink-faint">
                      <span>Reported by <span className="font-medium text-ink-soft">{issue.reportedBy.name}</span></span>
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePick(issue.id)}
                    className="shrink-0 rounded-xl bg-ink px-5 py-2.5 text-sm font-medium text-surface hover:bg-[#26251f] transition-colors"
                  >
                    Pick Up Issue
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
