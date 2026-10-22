import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  SearchIcon,
  ScrollIcon,
  ArrowIcon,
  ChevronDownIcon,
  CheckIcon,
  XIcon,
} from '../components/icons'
import { api } from '../lib/api'
import { Loading, ErrorState } from '../components/AsyncState'
import { ACTION_META, ACTION_ORDER } from '../data/audit'

/* ------------------------------ helpers ------------------------------- */

function ActionBadge({ action }) {
  const m = ACTION_META[action]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${m.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}

function Actor({ actor, system }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`grid h-6 w-6 place-items-center rounded-full text-[0.6rem] font-semibold uppercase ${
          system
            ? 'bg-canvas text-ink-faint ring-1 ring-line-strong'
            : 'bg-ink text-surface'
        }`}
        title={actor}
      >
        {system ? '⚙' : actor.replace('@', '').slice(0, 2)}
      </span>
      <span className="text-sm text-ink-soft">{actor}</span>
      {system && (
        <span className="rounded-full bg-canvas px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-ink-faint">
          system
        </span>
      )}
    </span>
  )
}

function DiffRow({ field, before, after }) {
  const added = before === null
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 font-mono text-xs">
      <span className="w-full text-ink-faint sm:w-44 sm:shrink-0">{field}</span>
      <span className="flex items-center gap-2">
        {!added && (
          <span className="rounded-md bg-[#fbe6e5] px-2 py-0.5 text-[#c0392b] line-through">
            {before}
          </span>
        )}
        <ArrowIcon className="h-3 w-3 text-ink-faint" />
        <span className="rounded-md bg-[#e6f6ec] px-2 py-0.5 text-signal-green">
          {after}
        </span>
      </span>
    </div>
  )
}

/* -------------------------------- entry ------------------------------- */

function Entry({ e, open, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-surface"
      >
        <span
          className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${ACTION_META[e.action].dot}`}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <ActionBadge action={e.action} />
            <Link
              to={`/flags/${e.key}`}
              onClick={(ev) => ev.stopPropagation()}
              className="font-mono text-sm font-medium text-ink transition-colors hover:text-accent-strong"
            >
              {e.flag}
            </Link>
            <span className="rounded-full border border-line px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-ink-faint">
              {e.env}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-ink-soft">{e.summary}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-faint">
            <Actor actor={e.actor} system={e.system} />
            <span>·</span>
            <span className="font-mono">{e.id}</span>
            <span>·</span>
            <span>
              {e.day} {e.at}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="whitespace-nowrap text-xs text-ink-faint">{e.when}</span>
          <ChevronDownIcon
            className={`h-4 w-4 text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-line bg-panel px-4 py-4 sm:px-[3.75rem]">
          <p className="eyebrow mb-2">What changed</p>
          <div className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {e.diff.map((d) => (
              <DiffRow key={d.field} {...d} />
            ))}
          </div>
          {e.note && (
            <p className="mt-3 rounded-xl bg-surface px-4 py-2.5 text-xs text-ink-soft">
              {e.note}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* -------------------------------- page -------------------------------- */

export default function Audit() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [action, setAction] = useState('All')
  const [who, setWho] = useState('All')
  const [openId, setOpenId] = useState(null)
  const [toast, setToast] = useState(null)
  const [exportOpen, setExportOpen] = useState(false)

  const reload = () => {
    setLoading(true)
    setError(null)
    api
      .get('/audit')
      .then(setEntries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(reload, [])

  const actors = useMemo(
    () => [...new Set(entries.map((e) => e.actor))].sort(),
    [entries],
  )

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return entries.filter((e) => {
      if (action !== 'All' && e.action !== action) return false
      if (who !== 'All' && e.actor !== who) return false
      if (
        needle &&
        !e.flag.toLowerCase().includes(needle) &&
        !e.key.toLowerCase().includes(needle) &&
        !e.actor.toLowerCase().includes(needle) &&
        !e.id.toLowerCase().includes(needle)
      )
        return false
      return true
    })
  }, [entries, q, action, who])

  // Group the filtered entries into day buckets, preserving order.
  const groups = useMemo(() => {
    const out = []
    for (const e of filtered) {
      const last = out[out.length - 1]
      if (last && last.day === e.day) last.items.push(e)
      else out.push({ day: e.day, items: [e] })
    }
    return out
  }, [filtered])

  const doExport = (fmt) => {
    setExportOpen(false)
    setToast(`Exported ${filtered.length} entries as ${fmt}. Check your downloads.`)
  }

  if (loading) return <Loading label="Loading audit log…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Governance</p>
          <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Audit log</h1>
          <p className="mt-2 text-ink-soft">
            Every change, whether it came from a person, an ops toggle, a break-glass
            grant, or the guard acting on its own, is written down once and never touched
            again.
          </p>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setExportOpen((v) => !v)}
            className="btn-ghost py-2.5"
          >
            <ScrollIcon className="h-4 w-4" />
            Export
            <ChevronDownIcon
              className={`h-4 w-4 transition-transform ${exportOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {exportOpen && (
            <div className="absolute right-0 z-10 mt-2 w-40 overflow-hidden rounded-xl border border-line bg-panel py-1 shadow-[0_20px_50px_-30px_rgba(16,15,13,0.5)]">
              {['CSV', 'JSON'].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => doExport(fmt)}
                  className="block w-full px-4 py-2 text-left text-sm text-ink-soft transition-colors hover:bg-surface hover:text-ink"
                >
                  Download {fmt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Immutability note */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-5 py-3 text-sm text-ink-soft">
        <ShieldMini />
        Append-only. Entries here can be filtered and exported for compliance, but
        never modified or deleted.
      </div>

      {toast && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-3 text-sm text-ink-soft">
          <span className="flex items-center gap-2.5">
            <CheckIcon className="h-4 w-4 text-signal-green" />
            {toast}
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-ink-faint transition-colors hover:text-ink"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill active={action === 'All'} onClick={() => setAction('All')}>
            All
          </FilterPill>
          {ACTION_ORDER.map((a) => (
            <FilterPill key={a} active={action === a} onClick={() => setAction(a)}>
              <span className={`h-1.5 w-1.5 rounded-full ${ACTION_META[a].dot}`} />
              {ACTION_META[a].label}
            </FilterPill>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={who}
              onChange={(e) => setWho(e.target.value)}
              className="appearance-none rounded-full border border-line bg-surface py-2.5 pl-4 pr-9 text-sm text-ink-soft focus:border-line-strong focus:outline-none"
            >
              <option value="All">All actors</option>
              {actors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          </div>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search flag, actor or ID"
              className="w-full rounded-full border border-line bg-surface py-2.5 pl-9 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none lg:w-72"
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      {groups.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-canvas text-ink-faint">
            <ScrollIcon className="h-5 w-5" />
          </span>
          <p className="font-medium text-ink">No entries match those filters</p>
          <p className="text-sm text-ink-faint">
            Try clearing the search or switching the action type.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.day} className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                  {g.day}
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
              {g.items.map((e) => (
                <Entry
                  key={e.id}
                  e={e}
                  open={openId === e.id}
                  onToggle={() => setOpenId((id) => (id === e.id ? null : e.id))}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      {groups.length > 0 && (
        <p className="px-1 text-sm text-ink-faint">
          Showing {filtered.length} of {entries.length} entries
        </p>
      )}
    </div>
  )
}

/* --------------------------- small primitives -------------------------- */

function FilterPill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-ink text-surface'
          : 'border border-line bg-surface text-ink-soft hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

function ShieldMini() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-ink"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
      <path d="M12 8v4M12 15h.01" />
    </svg>
  )
}
