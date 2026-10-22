import { useState } from 'react'
import { ISSUES, PRIORITY_META, STATUS_META } from '../../data/issues'

// Mock: current developer is dev-1 (Dana Walsh)
const MY_ISSUES = ISSUES.filter((i) => i.assignedTo?.id === 'dev-1')

const TABS = ['all', 'active', 'resolved']

export default function MyIssues() {
  const [tab, setTab] = useState('all')

  const filtered = MY_ISSUES.filter((i) => {
    if (tab === 'active') return i.status === 'assigned' || i.status === 'in_progress'
    if (tab === 'resolved') return i.status === 'resolved' || i.status === 'closed'
    return true
  })

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
          <span className="font-semibold text-ink">{MY_ISSUES.length} issues</span>
        </div>
      </div>

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
                    </div>

                    {/* Action buttons */}
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

                  {/* Content */}
                  <p className="font-semibold text-ink">{issue.title}</p>
                  <p className="text-sm text-ink-soft leading-relaxed">{issue.description}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-4 text-xs text-ink-faint pt-1 border-t border-line">
                    <span>Reported by <span className="font-medium text-ink-soft">{issue.reportedBy.name}</span></span>
                    <span>Created {new Date(issue.createdAt).toLocaleDateString()}</span>
                    <span>Updated {new Date(issue.updatedAt).toLocaleDateString()}</span>
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
