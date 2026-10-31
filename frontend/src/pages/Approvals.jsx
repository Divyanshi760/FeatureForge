import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  ArrowIcon,
} from '../components/icons'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { Loading, ErrorState } from '../components/AsyncState'
import { TYPE_BADGE } from '../data/flags'

const TABS = ['Pending', 'Approved', 'Rejected', 'All']

const STATUS_META = {
  pending: { label: 'Pending', cls: 'bg-[#fdf0d9] text-[#b5811f]', dot: 'bg-[#b5811f]' },
  approved: { label: 'Approved', cls: 'bg-[#e6f6ec] text-signal-green', dot: 'bg-signal-green' },
  rejected: { label: 'Rejected', cls: 'bg-[#fbe6e5] text-[#c0392b]', dot: 'bg-[#c0392b]' },
}

function StatusPill({ status }) {
  const m = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  )
}

function Avatar({ who }) {
  return (
    <span
      title={who}
      className="grid h-7 w-7 place-items-center rounded-full border-2 border-panel bg-ink text-[0.65rem] font-semibold uppercase text-surface"
    >
      {who.replace('@', '').slice(0, 2)}
    </span>
  )
}

/* ------------------------------ diff view ----------------------------- */

function DiffRow({ field, before, after }) {
  const added = before === null
  const unchanged = before === after
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 font-mono text-sm">
      <span className="w-full text-ink-faint sm:w-52 sm:shrink-0">{field}</span>
      {unchanged ? (
        <span className="text-ink-faint">{after} (unchanged)</span>
      ) : (
        <span className="flex items-center gap-2">
          {!added && (
            <span className="rounded-md bg-[#fbe6e5] px-2 py-0.5 text-[#c0392b] line-through">
              {before}
            </span>
          )}
          <ArrowIcon className="h-3.5 w-3.5 text-ink-faint" />
          <span className="rounded-md bg-[#e6f6ec] px-2 py-0.5 text-signal-green">
            {after}
          </span>
        </span>
      )}
    </div>
  )
}

/* -------------------------------- page -------------------------------- */

export default function Approvals() {
  const { user } = useAuth()
  const me = user?.email
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('Pending')
  const [selectedId, setSelectedId] = useState(null)
  const [toast, setToast] = useState(null)

  const reload = () => {
    setLoading(true)
    setError(null)
    api
      .get('/approvals')
      .then((data) => {
        setRequests(data)
        setSelectedId((id) => id ?? data[0]?.id ?? null)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(reload, [])

  const counts = useMemo(() => {
    const c = { All: requests.length, Pending: 0, Approved: 0, Rejected: 0 }
    for (const r of requests) c[r.status[0].toUpperCase() + r.status.slice(1)]++
    return c
  }, [requests])

  const visible = useMemo(
    () => (tab === 'All' ? requests : requests.filter((r) => STATUS_META[r.status].label === tab)),
    [requests, tab],
  )

  const selected = requests.find((r) => r.id === selectedId) || visible[0] || null

  const eligible = (r) =>
    r.status === 'pending' && r.requestedBy !== me && !r.approvals.includes(me)

  const resolve = async (id, action) => {
    try {
      const updated = await api.post(`/approvals/${id}/${action}`)
      setRequests((rs) => rs.map((r) => (r.id === id ? updated : r)))
      setToast(
        action === 'reject'
          ? `${id} rejected. The requester has been notified.`
          : updated.status === 'approved'
            ? `${id} approved and applied.`
            : `Approval recorded on ${id}.`,
      )
    } catch (err) {
      setToast(err.message)
    }
  }

  if (loading) return <Loading label="Loading approvals…" />
  if (error) return <ErrorState message={error} onRetry={reload} />

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <p className="eyebrow">Governance</p>
        <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Approvals</h1>
        <p className="mt-2 text-ink-soft">
          Every governed change waits here for a second reviewer before it reaches users.
        </p>
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

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-ink text-surface'
                : 'border border-line bg-surface text-ink-soft hover:text-ink'
            }`}
          >
            {t}
            <span
              className={`grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[0.7rem] font-semibold ${
                tab === t ? 'bg-surface/20 text-surface' : 'bg-canvas text-ink-faint'
              }`}
            >
              {counts[t]}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        {/* List */}
        <div className="space-y-3">
          {visible.length === 0 && (
            <div className="card px-6 py-12 text-center text-sm text-ink-faint">
              Nothing here right now.
            </div>
          )}
          {visible.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedId(r.id)}
              className={`card w-full p-4 text-left transition-shadow ${
                selected && selected.id === r.id
                  ? 'ring-2 ring-ink'
                  : 'hover:shadow-[0_16px_40px_-30px_rgba(16,15,13,0.4)]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-sm font-medium text-ink">{r.flag}</span>
                <StatusPill status={r.status} />
              </div>
              <p className="mt-1.5 line-clamp-1 text-sm text-ink-soft">{r.summary}</p>
              <div className="mt-3 flex items-center gap-2 text-xs text-ink-faint">
                <span className="font-mono">{r.id}</span>
                <span>·</span>
                <span>{r.requestedBy}</span>
                <span>·</span>
                <span>{r.requestedAt}</span>
                <span className="ml-auto rounded-full border border-line px-2 py-0.5 uppercase tracking-wide">
                  {r.env}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Detail */}
        {selected ? (
          <div className="card h-fit p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    to={`/flags/${selected.key}`}
                    className="text-xl font-semibold tracking-tight text-ink transition-colors hover:text-accent-strong"
                  >
                    {selected.flag}
                  </Link>
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_BADGE[selected.type]}`}>
                    {selected.type}
                  </span>
                  <span className="rounded-full border border-line px-2 py-0.5 text-xs uppercase tracking-wide text-ink-faint">
                    {selected.env}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-faint">
                  <span className="font-mono">{selected.id}</span> · requested by{' '}
                  <span className="font-medium text-ink-soft">{selected.requestedBy}</span> ·{' '}
                  {selected.requestedAt}
                </p>
              </div>
              <StatusPill status={selected.status} />
            </div>

            <p className="mt-4 rounded-xl bg-surface px-4 py-3 text-sm text-ink-soft">
              {selected.summary}
            </p>

            {/* Diff */}
            <div className="mt-6">
              <p className="eyebrow mb-2">What changed</p>
              <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-panel">
                {selected.diff.map((d) => (
                  <DiffRow key={d.field} {...d} />
                ))}
              </div>
            </div>

            {/* Approvals progress */}
            <div className="mt-6 flex items-center justify-between rounded-xl bg-surface px-4 py-3">
              <div className="flex items-center gap-2.5">
                <ShieldIcon className="h-4 w-4 text-ink" />
                <span className="text-sm font-medium text-ink">
                  {selected.approvals.length} of {selected.needed} approvals
                </span>
              </div>
              <div className="flex items-center">
                {selected.approvals.length ? (
                  <div className="flex -space-x-2">
                    {selected.approvals.map((a) => (
                      <Avatar key={a} who={a} />
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-ink-faint">No reviewers yet</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6">
              {selected.status !== 'pending' ? (
                <div
                  className={`flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm ${
                    selected.status === 'approved'
                      ? 'bg-[#eaf7ee] text-[#256b3a]'
                      : 'bg-[#fbe6e5] text-[#c0392b]'
                  }`}
                >
                  {selected.status === 'approved' ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <XIcon className="h-4 w-4" />
                  )}
                  {selected.status === 'approved'
                    ? 'Approved and applied.'
                    : 'Rejected. No change was applied.'}
                </div>
              ) : eligible(selected) ? (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => resolve(selected.id, 'approve')}
                    className="btn-primary flex-1 justify-center py-2.5"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => resolve(selected.id, 'reject')}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-line-strong py-2.5 text-[0.95rem] font-medium text-[#c0392b] transition-colors hover:bg-[#fbe6e5]"
                  >
                    <XIcon className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-faint">
                  <ClockIcon className="h-4 w-4" />
                  {selected.requestedBy === me
                    ? 'You opened this request, so you cannot approve it yourself. Waiting on another reviewer.'
                    : 'You have already reviewed this request. Waiting on another reviewer.'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card px-6 py-16 text-center text-sm text-ink-faint">
            Select a change request to see the diff.
          </div>
        )}
      </div>
    </div>
  )
}
