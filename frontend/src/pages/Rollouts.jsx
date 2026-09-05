import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GaugeIcon,
  BoltIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  ShieldIcon,
} from '../components/icons'
import { ROLLOUTS } from '../data/rollouts'

const WINDOW_MS = 2500 // sim tick , one rolling window
const MAX_WINDOWS = 20
const clamp0 = (n) => Math.max(0, n)
const fmt = (n, unit) => `${unit === 'ms' ? Math.round(n) : n.toFixed(2)}${unit}`

/* ------------------------- runtime construction ----------------------- */

function sample(base, noise) {
  return clamp0(base + (Math.random() - 0.5) * 2 * noise)
}

function seedRuntime(r) {
  const m = r.metric
  const windows = []
  const rolledBack = r.trend === 'rolled_back'
  // Seed a little history so the chart isn't empty on first paint.
  for (let i = 0; i < 8; i++) {
    const variant = rolledBack && i > 4 ? sample(m.variant, m.noise) : sample(m.variant, m.noise)
    windows.push({
      control: sample(m.control, m.noise * 0.6),
      variant,
      breached: variant > m.threshold,
      sampleCount: Math.round(m.minSample + Math.random() * 400),
    })
  }
  return {
    windows,
    climb: 0,
    consecutive: rolledBack ? m.windowsToRollback : 0,
    status: rolledBack ? 'rolled_back' : 'healthy',
    paused: false,
    rollbacks: [...r.rollbacks],
  }
}

/* ------------------------------- chart -------------------------------- */

function HealthChart({ windows, metric, status }) {
  const w = 320
  const h = 108
  const pad = 6
  const max = Math.max(metric.threshold * 1.5, ...windows.map((d) => Math.max(d.variant, d.control)))
  const n = windows.length
  const x = (i) => pad + (i / Math.max(1, n - 1)) * (w - pad * 2)
  const y = (v) => h - pad - (v / max) * (h - pad * 2)
  const line = (sel) => windows.map((d, i) => `${x(i)},${y(sel(d))}`).join(' ')
  const yThreshold = y(metric.threshold)
  const variantColor = status === 'rolled_back' ? '#c0392b' : status === 'breaching' ? '#c0392b' : '#f5761a'

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 'auto' }}>
      {/* threshold */}
      <line
        x1={pad}
        x2={w - pad}
        y1={yThreshold}
        y2={yThreshold}
        stroke="#c0392b"
        strokeWidth="1"
        strokeDasharray="4 4"
        opacity="0.5"
      />
      <text x={w - pad} y={yThreshold - 4} textAnchor="end" fontSize="8" fill="#c0392b" opacity="0.8">
        threshold {fmt(metric.threshold, metric.unit)}
      </text>
      {/* control */}
      <polyline fill="none" stroke="#67675f" strokeWidth="1.6" strokeLinejoin="round" points={line((d) => d.control)} opacity="0.6" />
      {/* variant */}
      <polyline fill="none" stroke={variantColor} strokeWidth="2" strokeLinejoin="round" points={line((d) => d.variant)} />
      {/* last variant point */}
      {n > 0 && (
        <circle cx={x(n - 1)} cy={y(windows[n - 1].variant)} r="2.6" fill={variantColor} />
      )}
    </svg>
  )
}

/* --------------------------- window strip ----------------------------- */

function WindowStrip({ windows, need }) {
  const last = windows.slice(-12)
  return (
    <div className="flex items-center gap-1">
      {last.map((d, i) => (
        <span
          key={i}
          title={d.breached ? 'breached' : 'ok'}
          className={`h-6 flex-1 rounded-[3px] ${
            d.breached ? 'bg-[#c0392b]' : 'bg-signal-green/70'
          }`}
        />
      ))}
      <span className="ml-2 whitespace-nowrap text-xs text-ink-faint">
        rollback at {need} in a row
      </span>
    </div>
  )
}

/* ------------------------------ primitives ---------------------------- */

const STATUS_PILL = {
  healthy: { label: 'Healthy', cls: 'bg-[#e6f6ec] text-signal-green', dot: 'bg-signal-green' },
  breaching: { label: 'Breaching', cls: 'bg-[#fbe6e5] text-[#c0392b]', dot: 'bg-[#c0392b]' },
  paused: { label: 'Paused', cls: 'bg-[#fdf0d9] text-[#b5811f]', dot: 'bg-[#b5811f]' },
  rolled_back: { label: 'Rolled back', cls: 'bg-canvas text-ink-faint', dot: 'bg-ink-faint' },
}

function StatusPill({ status }) {
  const m = STATUS_PILL[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${m.cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${m.dot} ${status === 'breaching' ? 'animate-pulse' : ''}`} />
      {m.label}
    </span>
  )
}

function MetricCol({ label, value, unit, tone, sub }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums tracking-tight ${tone}`}>
        {fmt(value, unit)}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-ink-faint">{sub}</p> : null}
    </div>
  )
}

/* -------------------------------- page -------------------------------- */

export default function Rollouts() {
  const [runtime, setRuntime] = useState(() => {
    const o = {}
    for (const r of ROLLOUTS) o[r.id] = seedRuntime(r)
    return o
  })
  const [selectedId, setSelectedId] = useState(ROLLOUTS[0].id)
  const [toast, setToast] = useState(null)
  const [alert, setAlert] = useState(null)
  const rtRef = useRef(runtime)
  rtRef.current = runtime

  // The guard engine: every window, sample each live rollout, count
  // consecutive breaches, and auto-roll-back at the configured count.
  useEffect(() => {
    const t = setInterval(() => {
      const cur = rtRef.current
      const next = { ...cur }
      let firedAlert = null
      for (const r of ROLLOUTS) {
        const rt = cur[r.id]
        if (rt.paused || rt.status === 'rolled_back') continue
        const m = r.metric
        const degrading = r.trend === 'degrading'
        const climb = degrading ? rt.climb + 0.55 : 0
        const variant = sample(m.variant + climb, m.noise)
        const control = sample(m.control, m.noise * 0.6)
        const breached = variant > m.threshold
        const consecutive = breached ? rt.consecutive + 1 : 0
        const windows = [...rt.windows, { control, variant, breached, sampleCount: Math.round(m.minSample + Math.random() * 400) }].slice(-MAX_WINDOWS)

        if (consecutive >= m.windowsToRollback) {
          next[r.id] = {
            ...rt,
            windows,
            climb,
            consecutive,
            status: 'rolled_back',
            rollbacks: [
              {
                at: 'just now',
                reason: `${m.label} climbed to ${fmt(variant, m.unit)} while control sat at ${fmt(control, m.unit)}, past the ${fmt(m.threshold, m.unit)} threshold for ${m.windowsToRollback} windows in a row.`,
                detail: 'The flag was disabled, the config went out to every SDK, and Slack got pinged. Nobody had to step in.',
              },
              ...rt.rollbacks,
            ],
          }
          firedAlert = r
        } else {
          next[r.id] = {
            ...rt,
            windows,
            climb,
            consecutive,
            status: breached ? 'breaching' : 'healthy',
          }
        }
      }
      setRuntime(next)
      if (firedAlert) {
        setAlert(`Auto-rollback fired on ${firedAlert.flag}. The flag was disabled and pushed to every SDK.`)
        setSelectedId(firedAlert.id)
      }
    }, WINDOW_MS)
    return () => clearInterval(t)
  }, [])

  const selected = ROLLOUTS.find((r) => r.id === selectedId)
  const rt = runtime[selected.id]
  const m = selected.metric
  const last = rt.windows[rt.windows.length - 1] || { control: m.control, variant: m.variant }
  const delta = last.variant - last.control
  const overThreshold = last.variant > m.threshold

  const setSel = (id) => {
    setSelectedId(id)
  }

  const pause = () => {
    setRuntime((cur) => ({
      ...cur,
      [selected.id]: { ...cur[selected.id], paused: !cur[selected.id].paused, status: cur[selected.id].paused ? 'healthy' : 'paused' },
    }))
    setToast(rt.paused ? `${selected.flag} resumed. The guard is watching again.` : `${selected.flag} paused. Ramp held, guard suspended.`)
  }

  const rollbackNow = () => {
    setRuntime((cur) => ({
      ...cur,
      [selected.id]: {
        ...cur[selected.id],
        status: 'rolled_back',
        rollbacks: [
          { at: 'just now', reason: 'Manual rollback by xyz@', detail: 'Flag disabled and pushed to every SDK on demand.' },
          ...cur[selected.id].rollbacks,
        ],
      },
    }))
    setToast(`${selected.flag} rolled back manually. Config pushed to every SDK.`)
  }

  const liveCount = useMemo(
    () => ROLLOUTS.filter((r) => runtime[r.id].status !== 'rolled_back').length,
    [runtime],
  )

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Checkout Platform · prod</p>
          <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Rollouts</h1>
          <p className="mt-2 text-ink-soft">
            Live guard on every ramping flag. Variant health is compared to control each
            window, and a sustained breach rolls the flag back on its own.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-ink-soft">
          <span className="h-2 w-2 animate-pulse rounded-full bg-signal-green" />
          {liveCount} live · guard on
        </span>
      </div>

      {/* Auto-rollback alert (fires live) */}
      {alert && (
        <div className="card overflow-hidden border-[#f0c9c4]">
          <div className="flex items-center justify-between gap-3 bg-[#fbeae8] px-6 py-4">
            <span className="flex items-center gap-3.5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#c0392b] text-white">
                <BoltIcon className="h-5 w-5" />
              </span>
              <span className="text-sm font-medium text-[#7d2018]">{alert}</span>
            </span>
            <button type="button" onClick={() => setAlert(null)} className="text-[#95443b] transition-colors hover:text-[#7d2018]">
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-5 py-3 text-sm text-ink-soft">
          <span className="flex items-center gap-2.5">
            <CheckIcon className="h-4 w-4 text-signal-green" />
            {toast}
          </span>
          <button type="button" onClick={() => setToast(null)} className="text-ink-faint transition-colors hover:text-ink">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        {/* List */}
        <div className="space-y-3">
          {ROLLOUTS.map((r) => {
            const s = runtime[r.id]
            const lw = s.windows[s.windows.length - 1]
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSel(r.id)}
                className={`card w-full p-4 text-left transition-shadow ${
                  selected.id === r.id ? 'ring-2 ring-ink' : 'hover:shadow-[0_16px_40px_-30px_rgba(16,15,13,0.4)]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-medium text-ink">{r.flag}</span>
                  <StatusPill status={s.status} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-ink-faint">
                  <span>{r.metric.label}</span>
                  <span className="tabular-nums">
                    {lw ? fmt(lw.variant, r.metric.unit) : 'n/a'} · {r.rollout}% ramp
                  </span>
                </div>
                {s.consecutive > 0 && s.status !== 'rolled_back' && (
                  <p className="mt-2 text-xs font-medium text-[#c0392b]">
                    {s.consecutive} / {r.metric.windowsToRollback} windows breached
                  </p>
                )}
              </button>
            )
          })}
        </div>

        {/* Detail */}
        <div className="card h-fit p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <Link to={`/flags/${selected.key}`} className="text-xl font-semibold tracking-tight text-ink transition-colors hover:text-accent-strong">
                  {selected.flag}
                </Link>
                <StatusPill status={rt.status} />
                <span className="rounded-full border border-line px-2 py-0.5 text-xs uppercase tracking-wide text-ink-faint">
                  {selected.env}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-ink-faint">
                <span className="font-mono">{selected.id}</span> · {selected.rollout}% ramp ·{' '}
                {selected.startedLabel}
              </p>
            </div>
            {rt.status !== 'rolled_back' && (
              <div className="flex gap-2">
                <button type="button" onClick={pause} className="btn-ghost py-2 text-sm">
                  {rt.paused ? 'Resume' : 'Pause'}
                </button>
                <button
                  type="button"
                  onClick={rollbackNow}
                  className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-2 text-sm font-semibold text-[#c0392b] transition-colors hover:bg-[#fbe6e5]"
                >
                  <BoltIcon className="h-4 w-4" />
                  Roll back now
                </button>
              </div>
            )}
          </div>

          {/* Metric comparison */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricCol label="Control" value={last.control} unit={m.unit} tone="text-ink" sub="baseline" />
            <MetricCol
              label="Variant"
              value={last.variant}
              unit={m.unit}
              tone={overThreshold ? 'text-[#c0392b]' : 'text-ink'}
              sub={`${delta >= 0 ? '+' : ''}${fmt(delta, m.unit)} vs control`}
            />
            <MetricCol
              label="Threshold"
              value={m.threshold}
              unit={m.unit}
              tone="text-ink-soft"
              sub={`over ${m.windowsToRollback} windows`}
            />
          </div>

          {/* Chart */}
          <div className="mt-6 rounded-xl border border-line bg-panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow">{m.label} · last {rt.windows.length} windows</p>
              <div className="flex items-center gap-3 text-xs text-ink-faint">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 bg-ink-faint" /> control
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 bg-accent-strong" /> variant
                </span>
              </div>
            </div>
            <HealthChart windows={rt.windows} metric={m} status={rt.status} />
          </div>

          {/* Window strip / breach counter */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="eyebrow">Rolling window status</p>
              {rt.status !== 'rolled_back' ? (
                <span className={`text-xs font-semibold ${rt.consecutive > 0 ? 'text-[#c0392b]' : 'text-signal-green'}`}>
                  {rt.consecutive > 0
                    ? `${rt.consecutive} consecutive breach${rt.consecutive > 1 ? 'es' : ''}`
                    : 'no active breach'}
                </span>
              ) : (
                <span className="text-xs font-semibold text-ink-faint">rollout disabled</span>
              )}
            </div>
            <WindowStrip windows={rt.windows} need={m.windowsToRollback} />
            <p className="mt-2 text-xs text-ink-faint">
              Windows with fewer than {m.minSample} samples are skipped so the guard never
              acts on noise. Each window is {m.windowLabel}.
            </p>
          </div>

          {/* Rolled-back state */}
          {rt.status === 'rolled_back' && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 text-sm text-ink-soft">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
              <p>
                This flag is disabled and held at 0%. Dig into the regression, then turn
                it back on from the flag page and the guard picks right back up on the
                next ramp.
              </p>
            </div>
          )}

          {/* Rollback history */}
          <div className="mt-6">
            <p className="eyebrow mb-2">Auto-rollback history</p>
            {rt.rollbacks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-faint">
                No rollbacks on this flag. The guard has not had to intervene.
              </p>
            ) : (
              <ol className="space-y-3">
                {rt.rollbacks.map((rb, i) => (
                  <li key={i} className="flex gap-3 rounded-xl border border-line bg-surface px-4 py-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#fbe6e5] text-[#c0392b]">
                      <BoltIcon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-ink-faint">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {rb.at}
                        <span className="rounded-full bg-canvas px-1.5 py-0.5 font-semibold uppercase tracking-wide text-ink-faint">
                          auto_rollback
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-ink">{rb.reason}</p>
                      <p className="mt-0.5 text-xs text-ink-faint">{rb.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
