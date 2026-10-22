import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../lib/api'
import { Loading, ErrorState } from '../../components/AsyncState'

export default function DevProfile() {
  const { user } = useAuth()
  const [me, setMe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(user?.status || 'free')
  const [toast, setToast] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const developers = await api.get('/developers')
      const found = developers.find((d) => d.email === user?.email)
      setMe(found || null)
      if (found) setStatus(found.status)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user?.email])

  useEffect(() => {
    load()
  }, [load])

  const toggleStatus = async () => {
    const next = status === 'free' ? 'occupied' : 'free'
    try {
      const updated = await api.patch('/developers/me/status', { status: next })
      setStatus(updated.status)
      setMe(updated)
      setToast({ type: 'ok', msg: `Status updated to ${updated.status}` })
    } catch (err) {
      setToast({ type: 'error', msg: err.message })
    }
    setTimeout(() => setToast(null), 3000)
  }

  if (loading) return <Loading label="Loading your profile…" />
  if (error) return <ErrorState message={error} onRetry={load} />

  const name = me?.name || user?.name || 'Developer'
  const email = me?.email || user?.email || ''
  const specialty = me?.specialty || '—'
  const avatar =
    me?.avatar ||
    name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  const resolvedTotal = me?.resolvedTotal ?? 0
  const activeIssues = me?.activeIssues ?? 0
  const joined = me?.joinedAt ? new Date(me.joinedAt).toLocaleDateString() : '—'
  const isFree = status === 'free'

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">My Status</h1>
        <p className="text-sm text-ink-faint mt-1">
          Set your availability so admins know when you're free for new assignments
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${
          toast.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-700'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}>
          {toast.type === 'error' ? '✕' : '✓'} {toast.msg}
        </div>
      )}

      {/* Status card */}
      <div className="card p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-ink text-xl font-semibold text-surface">
              {avatar}
            </span>
            <div>
              <p className="text-lg font-semibold text-ink">{name}</p>
              <p className="text-sm text-ink-faint">{email}</p>
              <p className="text-xs text-ink-faint mt-1">Developer · {specialty}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-ink-faint uppercase tracking-wider font-semibold">Current Status</p>
              <div className="flex items-center justify-end gap-2 mt-1">
                <span className={`h-3 w-3 rounded-full ${isFree ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <span className={`text-lg font-semibold capitalize ${isFree ? 'text-emerald-700' : 'text-amber-700'}`}>
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
                {isFree
                  ? 'You are currently available for new issue assignments.'
                  : 'You are marked as occupied. Admins will not assign new issues to you.'
                }
              </p>
            </div>
            <button
              onClick={toggleStatus}
              className={`rounded-xl px-6 py-3 text-sm font-semibold transition-colors ${
                isFree
                  ? 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
              }`}
            >
              {isFree ? 'Set as Occupied' : 'Set as Free'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-ink-faint uppercase tracking-wider mb-4">Performance</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-2xl font-semibold text-ink">{resolvedTotal}</p>
            <p className="text-xs text-ink-faint mt-0.5">Total resolved</p>
          </div>
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-2xl font-semibold text-ink">{activeIssues}</p>
            <p className="text-xs text-ink-faint mt-0.5">Currently active</p>
          </div>
          <div className="rounded-xl bg-surface px-4 py-3">
            <p className="text-2xl font-semibold text-ink">{specialty}</p>
            <p className="text-xs text-ink-faint mt-0.5">Specialty</p>
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-ink-faint uppercase tracking-wider mb-4">Profile Details</h2>
        <div className="space-y-4">
          {[
            ['Full Name', name],
            ['Email', email],
            ['Role', 'Developer'],
            ['Specialty', specialty],
            ['Joined', joined],
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
