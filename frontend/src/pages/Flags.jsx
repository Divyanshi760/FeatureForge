import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchIcon, PlusIcon, FlagIcon } from '../components/icons'
import { FLAGS, TYPE_BADGE } from '../data/flags'

const TYPES = ['All', 'Release', 'Experiment', 'Ops', 'Permission']
const STATUSES = ['All', 'On', 'Off']

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

function StatusPill({ on }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        on ? 'bg-[#e6f6ec] text-signal-green' : 'bg-canvas text-ink-faint'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-signal-green' : 'bg-ink-faint'}`}
      />
      {on ? 'On' : 'Off'}
    </span>
  )
}

/* -------------------------------- page -------------------------------- */

export default function Flags() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [type, setType] = useState('All')
  const [status, setStatus] = useState('All')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return FLAGS.filter((f) => {
      if (type !== 'All' && f.type !== type) return false
      if (status === 'On' && !f.on) return false
      if (status === 'Off' && f.on) return false
      if (
        needle &&
        !f.name.toLowerCase().includes(needle) &&
        !f.key.toLowerCase().includes(needle) &&
        !f.by.toLowerCase().includes(needle)
      )
        return false
      return true
    })
  }, [q, type, status])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Checkout Platform · prod</p>
          <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Flags</h1>
          <p className="mt-2 text-ink-soft">
            {FLAGS.length} flags in this environment, evaluated in-process by the SDK.
          </p>
        </div>
        <button type="button" className="btn-accent py-2.5">
          <PlusIcon className="h-4 w-4" />
          Create flag
        </button>
      </div>

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
                    <div className="font-medium text-ink group-hover:text-ink">
                      {f.name}
                    </div>
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
                    <StatusPill on={f.on} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
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
                      <span className="w-9 text-sm tabular-nums text-ink-soft">
                        {f.rollout}%
                      </span>
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
          Showing {filtered.length} of {FLAGS.length} flags
        </p>
      )}
    </div>
  )
}
