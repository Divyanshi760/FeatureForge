import { useState } from 'react'

export default function DevProfile() {
  const [status, setStatus] = useState('free') // free | occupied
  const [showConfirm, setShowConfirm] = useState(false)

  const toggleStatus = () => {
    const newStatus = status === 'free' ? 'occupied' : 'free'
    setStatus(newStatus)
    setShowConfirm(true)
    setTimeout(() => setShowConfirm(false), 3000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">My Status</h1>
        <p className="text-sm text-ink-faint mt-1">
          Set your availability so admins know when you're free for new assignments
        </p>
      </div>

      {/* Confirmation toast */}
      {showConfirm && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✓ Status updated to <span className="font-bold capitalize">{status}</span>
        </div>
      )}

      {/* Status card */}
      <div className="card p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-ink text-xl font-semibold text-surface">
              DW
            </span>
            <div>
              <p className="text-lg font-semibold text-ink">Dana Walsh</p>
              <p className="text-sm text-ink-faint">dana@example.com</p>
              <p className="text-xs text-ink-faint mt-1">Developer · Frontend</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-ink-faint uppercase tracking-wider font-semibold">Current Status</p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className={`h-3 w-3 rounded-full ${status === 'free' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className={`text-lg font-semibold capitalize ${status === 'free' ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle button */}
        <div className="mt-8 pt-6 border-t border-line">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink">Toggle Availability</p>
              <p className="text-sm text-ink-faint mt-0.5">
                {status === 'free'
                  ? 'You are currently available for new issue assignments.'
                  : 'You are marked as occupied. Admins will not assign new issues to you.'
                }
              </p>
            </div>
            <button
              onClick={toggleStatus}
              className={`rounded-xl px-6 py-3 text-sm font-semibold transition-colors ${
                status === 'free'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
              }`}
            >
              {status === 'free' ? 'Set as Occupied' : 'Set as Free'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-ink-faint uppercase tracking-wider mb-4">Performance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-2xl font-semibold text-ink">14</p>
            <p className="text-xs text-ink-faint mt-0.5">Total resolved</p>
          </div>
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-2xl font-semibold text-ink">2</p>
            <p className="text-xs text-ink-faint mt-0.5">Currently active</p>
          </div>
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-2xl font-semibold text-ink">2.3 days</p>
            <p className="text-xs text-ink-faint mt-0.5">Avg. resolution time</p>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-ink-faint uppercase tracking-wider mb-4">Profile Details</h2>
        <div className="space-y-4">
          {[
            ['Full Name', 'Dana Walsh'],
            ['Email', 'dana@example.com'],
            ['Role', 'Developer'],
            ['Specialty', 'Frontend'],
            ['Joined', 'Mar 15, 2026'],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-line last:border-0">
              <span className="text-sm text-ink-faint">{label}</span>
              <span className="text-sm font-medium text-ink">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
