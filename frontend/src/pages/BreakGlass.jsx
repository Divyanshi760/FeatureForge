import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  KeyIcon,
  ClockIcon,
  ChevronDownIcon,
  CheckIcon,
  XIcon,
  BoltIcon,
} from '../components/icons'
import { FLAGS } from '../data/flags'
import { CURRENT_USER } from '../data/approvals'
import {
  ACTIVE_SESSIONS,
  PAST_SESSIONS,
  DURATION_OPTIONS,
  MAX_DURATION_MIN,
} from '../data/breakglass'

const ENVS = ['dev', 'staging', 'prod']

/* ------------------------------ countdown ----------------------------- */

// Live "42m 09s" countdown to a Date. Re-renders every second via the tick
// passed down from the page so we keep a single interval.
function remaining(expiresAt, nowMs) {
  const ms = Math.max(0, expiresAt.getTime() - nowMs)
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return { ms, label: `${m}m ${String(s).padStart(2, '0')}s` }
}

function Countdown({ expiresAt, durationMin, nowMs }) {
  const { ms, label } = remaining(expiresAt, nowMs)
  const frac = Math.max(0, Math.min(1, ms / (durationMin * 60 * 1000)))
  const urgent = ms < 5 * 60 * 1000
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-ink-faint">
          <ClockIcon className="h-3.5 w-3.5" />
          {ms === 0 ? 'Expired' : 'Expires in'}
        </span>
        <span
          className={`font-mono tabular-nums font-semibold ${
            urgent ? 'text-[#c0392b]' : 'text-ink'
          }`}
        >
          {label}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            urgent ? 'bg-[#c0392b]' : 'bg-[#b5811f]'
          }`}
          style={{ width: `${frac * 100}%` }}
        />
      </div>
    </div>
  )
}

/* ------------------------------ primitives ---------------------------- */

function Avatar({ who, system }) {
  return (
    <span
      title={who}
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[0.65rem] font-semibold uppercase ${
        system ? 'bg-canvas text-ink-faint ring-1 ring-line-strong' : 'bg-ink text-surface'
      }`}
    >
      {who.replace('@', '').slice(0, 2)}
    </span>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-ink">{label}</span>
        {hint ? <span className="text-xs text-ink-faint">{hint}</span> : null}
      </div>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

function Select({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full appearance-none rounded-xl border border-line bg-panel py-2.5 pl-3.5 pr-9 text-sm text-ink focus:border-line-strong focus:outline-none"
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
    </div>
  )
}

/* -------------------------------- page -------------------------------- */

export default function BreakGlass() {
  const [sessions, setSessions] = useState(ACTIVE_SESSIONS)
  const [history, setHistory] = useState(PAST_SESSIONS)
  const [nowMs, setNowMs] = useState(Date.now())
  const [toast, setToast] = useState(null)

  // Form state
  const [flagKey, setFlagKey] = useState(FLAGS[0].key)
  const [env, setEnv] = useState('prod')
  const [durationMin, setDurationMin] = useState(60)
  const [reason, setReason] = useState('')
  const [error, setError] = useState(false)

  // Single ticking clock drives every countdown.
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Sweep expired sessions into history, the way the backend sweep job would.
  useEffect(() => {
    setSessions((cur) => {
      const live = []
      const swept = []
      for (const s of cur) {
        if (s.expiresAt.getTime() <= nowMs) swept.push(s)
        else live.push(s)
      }
      if (swept.length) {
        setHistory((h) => [
          ...swept.map((s) => ({
            id: s.id,
            user: s.user,
            flag: s.flag,
            key: s.key,
            env: s.env,
            reason: s.reason,
            durationMin: s.durationMin,
            status: 'expired',
            endedLabel: 'just now',
            closedBy: 'auto-revoked at expiry',
            changes: 0,
          })),
          ...h,
        ])
      }
      return swept.length ? live : cur
    })
  }, [nowMs])

  const activeCount = sessions.length

  const submit = (e) => {
    e.preventDefault()
    if (reason.trim().length < 10) {
      setError(true)
      return
    }
    setError(false)
    const flag = FLAGS.find((f) => f.key === flagKey)
    const id = `BG-${Math.floor(80 + Math.random() * 20)}`
    const created = {
      id,
      user: CURRENT_USER,
      flag: flag.name,
      key: flag.key,
      env,
      reason: reason.trim(),
      grantedLabel: 'just now',
      durationMin,
      grantedAt: new Date(),
      expiresAt: new Date(Date.now() + durationMin * 60 * 1000),
      used: 'No changes yet',
    }
    setSessions((s) => [created, ...s])
    setReason('')
    setToast(
      `Break-glass ${id} granted for ${flag.name} · ${env}. A notification fired to the team the moment it was granted.`,
    )
  }

  const revoke = (id) => {
    setSessions((cur) => cur.filter((s) => s.id !== id))
    const s = sessions.find((x) => x.id === id)
    if (s) {
      setHistory((h) => [
        {
          id: s.id,
          user: s.user,
          flag: s.flag,
          key: s.key,
          env: s.env,
          reason: s.reason,
          durationMin: s.durationMin,
          status: 'revoked',
          endedLabel: 'just now',
          closedBy: `force-revoked by ${CURRENT_USER}`,
          changes: 0,
        },
        ...h,
      ])
    }
    setToast(`${id} force-revoked. The bypass is closed and the revocation is in the audit log.`)
  }

  const selectedFlag = useMemo(() => FLAGS.find((f) => f.key === flagKey), [flagKey])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <p className="eyebrow">Governance</p>
        <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Break-glass</h1>
        <p className="mt-2 text-ink-soft">
          Emergency access that bypasses approval for a capped window. Every grant is
          announced, time-boxed, and written to the audit log.
        </p>
      </div>

      {/* Platform-wide active banner */}
      {activeCount > 0 && (
        <div className="card overflow-hidden border-[#f3dcc4]">
          <div className="flex flex-col gap-3 bg-[#fdf3e6] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#b5811f] text-white">
                <KeyIcon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold text-[#8a5a1c]">
                  {activeCount} break-glass {activeCount === 1 ? 'session is' : 'sessions are'} active
                </p>
                <p className="mt-0.5 text-sm text-[#a06f28]">
                  Approval is being bypassed on {sessions.map((s) => s.flag).join(', ')}. This
                  banner shows platform-wide until every session closes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        {/* Request form */}
        <section className="card h-fit p-6">
          <h2 className="text-base font-semibold tracking-tight text-ink">
            Request emergency access
          </h2>
          <p className="mt-1 text-sm text-ink-faint">
            Use this only when a governed change cannot wait for a second reviewer.
          </p>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <Field label="Flag">
              <Select value={flagKey} onChange={(e) => setFlagKey(e.target.value)}>
                {FLAGS.map((f) => (
                  <option key={f.key} value={f.key}>
                    {f.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Environment">
              <div className="flex gap-2">
                {ENVS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setEnv(e)}
                    className={`flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition-colors ${
                      env === e
                        ? 'border-ink bg-ink text-surface'
                        : 'border-line bg-surface text-ink-soft hover:text-ink'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Duration" hint={`Capped at ${MAX_DURATION_MIN / 60}h`}>
              <Select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d.min} value={d.min}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Reason" hint="Required">
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value)
                  if (error) setError(false)
                }}
                rows={3}
                placeholder="Why can't this wait for approval? This is recorded permanently."
                className={`w-full resize-none rounded-xl border bg-panel px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none ${
                  error ? 'border-[#c0392b] focus:border-[#c0392b]' : 'border-line focus:border-line-strong'
                }`}
              />
              {error && (
                <p className="mt-1.5 text-xs text-[#c0392b]">
                  A reason of at least 10 characters is required for a break-glass grant.
                </p>
              )}
            </Field>

            <div className="rounded-xl bg-surface px-4 py-3 text-xs text-ink-faint">
              Requesting on{' '}
              <span className="font-mono text-ink-soft">{selectedFlag.name}</span> ·{' '}
              <span className="uppercase">{env}</span> for{' '}
              {DURATION_OPTIONS.find((d) => d.min === durationMin)?.label}. The team is
              notified the instant it's granted.
            </div>

            <button type="submit" className="btn-accent w-full justify-center py-2.5">
              <KeyIcon className="h-4 w-4" />
              Grant break-glass
            </button>
          </form>
        </section>

        {/* Active sessions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight text-ink">
              Active sessions
            </h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                activeCount > 0
                  ? 'bg-[#fdf0d9] text-[#b5811f]'
                  : 'bg-canvas text-ink-faint'
              }`}
            >
              {activeCount} live
            </span>
          </div>

          {activeCount === 0 ? (
            <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line bg-canvas text-ink-faint">
                <KeyIcon className="h-5 w-5" />
              </span>
              <p className="font-medium text-ink">No emergency access open</p>
              <p className="text-sm text-ink-faint">
                Every governed change is going through normal approval right now.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((s) => (
                <div key={s.id} className="card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar who={s.user} />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/flags/${s.key}`}
                            className="font-mono text-sm font-medium text-ink transition-colors hover:text-accent-strong"
                          >
                            {s.flag}
                          </Link>
                          <span className="rounded-full border border-line px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-ink-faint">
                            {s.env}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-ink-faint">
                          <span className="font-mono">{s.id}</span> · {s.user} · granted{' '}
                          {s.grantedLabel}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => revoke(s.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-xs font-semibold text-[#c0392b] transition-colors hover:bg-[#fbe6e5]"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                      Force-revoke
                    </button>
                  </div>

                  <p className="mt-3 rounded-xl bg-surface px-4 py-2.5 text-sm text-ink-soft">
                    {s.reason}
                  </p>

                  <div className="mt-4">
                    <Countdown
                      expiresAt={s.expiresAt}
                      durationMin={s.durationMin}
                      nowMs={nowMs}
                    />
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-faint">
                    <BoltIcon className="h-3.5 w-3.5" />
                    {s.used}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* History */}
          <div className="pt-2">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-faint">
              Recent sessions
            </h3>
            <div className="card divide-y divide-line overflow-hidden">
              {history.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      s.status === 'revoked' ? 'bg-[#c0392b]' : 'bg-ink-faint'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">
                      <span className="font-mono">{s.flag}</span>{' '}
                      <span className="text-ink-faint">· {s.env}</span>
                    </p>
                    <p className="truncate text-xs text-ink-faint">
                      <span className="font-mono">{s.id}</span> · {s.user} · {s.closedBy}
                      {s.changes ? ` · ${s.changes} change${s.changes > 1 ? 's' : ''}` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold capitalize ${
                        s.status === 'revoked'
                          ? 'bg-[#fbe6e5] text-[#c0392b]'
                          : 'bg-canvas text-ink-faint'
                      }`}
                    >
                      {s.status}
                    </span>
                    <p className="mt-1 whitespace-nowrap text-xs text-ink-faint">
                      {s.endedLabel}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
