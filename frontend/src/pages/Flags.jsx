import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, PlusIcon, FlagIcon, XIcon } from '../components/icons'
import { TYPE_BADGE } from '../data/flags'
import { api } from '../lib/api'

const TYPES = ['All', 'Release', 'Experiment', 'Ops', 'Permission']
const STATUSES = ['All', 'On', 'Off']
const FLAG_TYPES = ['Release', 'Experiment', 'Ops', 'Permission']

/* ------------------------------ helpers ------------------------------- */

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-ink text-surface'
          : 'border border-line bg-surface text-ink-soft hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function StatusToggle({ on, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={(e) => {
        e.stopPropagation()
        onChange(!on)
      }}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? 'bg-signal-green' : 'bg-line-strong'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
          on ? 'left-[1.375rem]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

/* -------------------------------- page -------------------------------- */

export default function Flags() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')

  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState(null)

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', key: '', type: 'Release', rollout: 0 })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const reload = async () => {
    try {
      setLoading(true)
      setError(null)
      setFlags(await api.get('/flags'))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const flash = (msg) => {
    setFeedback(msg)
    setTimeout(() => setFeedback(null), 4000)
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return flags.filter((f) => {
      if (type !== 'All' && f.type !== type) return false
      if (status === 'On' && !f.on) return false
      if (status === 'Off' && f.on) return false
      if (
        needle &&
        !f.name.toLowerCase().includes(needle) &&
        !f.key.toLowerCase().includes(needle) &&
        !(f.by || '').toLowerCase().includes(needle)
      )
        return false
      return true
    })
  }, [flags, q, type, status])

  const applyUpdate = (updated) =>
    setFlags((prev) => prev.map((f) => (f.key === updated.key ? updated : f)))

  const toggleFlag = async (f) => {
    try {
      const updated = await api.patch(`/flags/${f.key}/toggle`)
      applyUpdate(updated)
      flash(`${updated.name} switched ${updated.on ? 'on' : 'off'}`)
    } catch (err) {
      flash(err.message)
    }
  }

  const commitRollout = async (f, value) => {
    const next = Math.max(0, Math.min(100, Number(value) || 0))
    if (next === f.rollout) return
    try {
      applyUpdate(await api.patch(`/flags/${f.key}/rollout`, { rollout: next }))
      flash(`${f.name} rollout set to ${next}%`)
    } catch (err) {
      flash(err.message)
    }
  }

  const createFlag = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const created = await api.post('/flags', {
        ...form,
        rollout: Number(form.rollout) || 0,
        on: Number(form.rollout) > 0,
      })
      setFlags((prev) => [created, ...prev])
      setShowCreate(false)
      setForm({ name: '', key: '', type: 'Release', rollout: 0 })
      flash(`Flag ${created.name} created`)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="card px-6 py-20 text-center text-ink-faint">Loading flags…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="card px-6 py-16 text-center">
          <p className="font-medium text-ink">Could not load flags</p>
          <p className="mt-1 text-sm text-ink-faint">{error}</p>
          <button type="button" onClick={reload} className="btn-ghost mx-auto mt-6">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Checkout Platform · prod</p>
          <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Flags</h1>
          <p className="mt-2 text-ink-soft">
            {flags.length} flags in this environment, evaluated in-process by the SDK.
          </p>
        </div>
        <button type="button" onClick={() => setShowCreate(true)} className="btn-accent py-2.5">
          <PlusIcon className="h-4 w-4" />
          Create flag
        </button>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-[#cfe9d6] bg-[#eaf7ee] px-5 py-3 text-sm font-medium text-[#256b3a]">
          {feedback}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {TYPES.map((t) => (
            <Pill key={t} active={type === t} onClick={() => setType(t)}>
              {t}
            </Pill>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-line-strong lg:inline-block" />
          {STATUSES.map((s) => (
            <Pill key={s} active={status === s} onClick={() => setStatus(s)}>
              {s}
            </Pill>
          ))}
        </div>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, key or owner"
            className="w-full rounded-full border border-line bg-surface py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none lg:w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                <th className="px-6 py-3.5 font-semibold">Flag</th>
                <th className="px-6 py-3.5 font-semibold">Type</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold">Rollout</th>
                <th className="px-6 py-3.5 font-semibold">Last modified</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr
                  key={f.key}
                  onClick={() => navigate(`/flags/${f.key}`)}
                  className="group cursor-pointer border-b border-line last:border-0 transition-colors hover:bg-surface"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-ink group-hover:text-ink">{f.name}</div>
                    <div className="font-mono text-xs text-ink-faint">{f.key}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_BADGE[f.type]}`}
                    >
                      {f.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusToggle on={f.on} onChange={() => toggleFlag(f)} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-canvas">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${f.rollout}%`,
                            background: f.on
                              ? 'linear-gradient(90deg,#ff8933,#f5761a)'
                              : 'var(--color-line-strong)',
                          }}
                        />
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue={f.rollout}
                        key={`${f.key}-${f.rollout}`}
                        onClick={(e) => e.stopPropagation()}
                        onBlur={(e) => commitRollout(f, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.currentTarget.blur()
                        }}
                        className="w-16 rounded-lg border border-line bg-panel px-2 py-1 text-right text-sm tabular-nums text-ink-soft focus:border-line-strong focus:outline-none"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-ink-soft">
                    {f.by} · {f.when}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-canvas text-ink-faint">
              <FlagIcon className="h-5 w-5" />
            </span>
            <p className="font-medium text-ink">No flags match those filters</p>
            <p className="text-sm text-ink-faint">
              Try clearing the search or switching the type and status.
            </p>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="px-1 text-sm text-ink-faint">
          Showing {filtered.length} of {flags.length} flags
        </p>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <form
            onSubmit={createFlag}
            className="relative w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">Create flag</h2>
                <p className="mt-1 text-sm text-ink-faint">
                  Define a flag in this environment. Rollout starts held back until you ramp it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-surface hover:text-ink"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-soft">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  required
                  placeholder="checkout-redesign"
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-soft">Key</label>
                <input
                  value={form.key}
                  onChange={(e) => setForm((s) => ({ ...s, key: e.target.value }))}
                  required
                  placeholder="checkout_redesign_v2"
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ink-soft">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((s) => ({ ...s, type: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-line-strong focus:outline-none"
                  >
                    {FLAG_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-soft">Rollout %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.rollout}
                    onChange={(e) => setForm((s) => ({ ...s, rollout: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm tabular-nums text-ink focus:border-line-strong focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {formError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {formError}
              </p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink-soft hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-accent flex-1 justify-center py-2.5 disabled:opacity-40"
              >
                {saving ? 'Creating…' : 'Create flag'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
