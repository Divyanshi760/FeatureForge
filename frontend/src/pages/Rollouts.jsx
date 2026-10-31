import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BoltIcon, CheckIcon, XIcon, ClockIcon, ShieldIcon } from '../components/icons'
import { api } from '../lib/api'

const fmt = (n, unit) => `${unit === 'ms' ? Math.round(n) : Number(n).toFixed(2)}${unit}`

// Map the stored trend to the visual status. There is no live stats engine;
// a degrading rollout reads as "breaching" until the guard (the simulate
// button) actually rolls it back on the backend.
const statusFor = (trend) => (trend === 'degrading' ? 'breaching' : trend)

// Build a short, deterministic window series from the seeded metric so the
// chart has shape without a running simulation.
function buildWindows(r) {
  const m = r.metric || {}
  const n = 12
  const rolledBack = r.trend === 'rolled_back'
  const degrading = r.trend === 'degrading'
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    const jitter = (Math.sin(i * 1.7) * (m.noise || 0)) / 2
    let variant = (m.variant || 0) + jitter
    if (degrading) variant += t * ((m.threshold || 0) - (m.variant || 0) + 1) * 0.9
    if (rolledBack && i >= n - 2) variant = Math.max(variant, (m.threshold || 0) + 1)
    const control = (m.control || 0) + jitter * 0.6
    return { control, variant, breached: variant > (m.threshold || 0) }
  })
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
  const variantColor = status === 'rolled_back' || status === 'breaching' ? '#c0392b' : '#f5761a'

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 'auto' }}>
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
      <polyline fill="none" stroke="#67675f" strokeWidth="1.6" strokeLinejoin="round" points={line((d) => d.control)} opacity="0.6" />
      <polyline fill="none" stroke={variantColor} strokeWidth="2" strokeLinejoin="round" points={line((d) => d.variant)} />
      {n > 0 && <circle cx={x(n - 1)} cy={y(windows[n - 1].variant)} r="2.6" fill={variantColor} />}
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
          className={`h-6 flex-1 rounded-[3px] ${d.breached ? 'bg-[#c0392b]' : 'bg-signal-green/70'}`}
        />
      ))}
      <span className="ml-2 whitespace-nowrap text-xs text-ink-faint">rollback at {need} in a row</span>
    </div>
  )
}

/* ------------------------------ primitives ---------------------------- */

const STATUS_PILL = {
  healthy: { label: 'Healthy', cls: 'bg-[#e6f6ec] text-signal-green', dot: 'bg-signal-green' },
  breaching: { label: 'Breaching', cls: 'bg-[#fbe6e5] text-[#c0392b]', dot: 'bg-[#c0392b]' },
  rolled_back: { label: 'Rolled back', cls: 'bg-canvas text-ink-faint', dot: 'bg-ink-faint' },
}

function StatusPill({ status }) {
  const m = STATUS_PILL[status] || STATUS_PILL.healthy
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
      <p className={`mt-1 text-2xl font-semibold tabular-nums tracking-tight ${tone}`}>{fmt(value, unit)}</p>
      {sub ? <p className="mt-0.5 text-xs text-ink-faint">{sub}</p> : null}
    </div>
  )
}

/* -------------------------------- page -------------------------------- */

export default function Rollouts() {
  const [rollouts, setRollouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [toast, setToast] = useState(null)
  const [alert, setAlert] = useState(null)

  const reload = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get('/rollouts')
      setRollouts(data)
      setSelectedId((id) => id || data[0]?.id || null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  const windowsById = useMemo(() => {
    const o = {}
    for (const r of rollouts) o[r.id] = buildWindows(r)
    return o
  }, [rollouts])

  const liveCount = useMemo(
    () => rollouts.filter((r) => r.trend !== 'rolled_back').length,
    [rollouts],
  )

  const simulateRollback = async (r) => {
    try {
      const { rollout } = await api.post(`/rollouts/${r.id}/rollback`, {})
      setRollouts((prev) => prev.map((x) => (x.id === rollout.id ? rollout : x)))
      setAlert(`Auto-rollback fired on ${rollout.flag}. The flag was disabled and the rollout dropped to zero.`)
      setToast(null)
    } catch (err) {
      setToast(err.message)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="card px-6 py-20 text-center text-ink-faint">Loading rollouts…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="card px-6 py-16 text-center">
          <p className="font-medium text-ink">Could not load rollouts</p>
          <p className="mt-1 text-sm text-ink-faint">{error}</p>
          <button type="button" onClick={reload} className="btn-ghost mx-auto mt-6">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const selected = rollouts.find((r) => r.id === selectedId) || rollouts[0]
  if (!selected) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="card px-6 py-20 text-center text-ink-faint">No rollouts in this environment.</div>
      </div>
    )
  }

  const m = selected.metric || {}
  const windows = windowsById[selected.id] || []
  const last = windows[windows.length - 1] || { control: m.control, variant: m.variant }
  const delta = last.variant - last.control
  const overThreshold = last.variant > m.threshold
  const status = statusFor(selected.trend)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Checkout Platform · prod</p>
          <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Rollouts</h1>
          <p className="mt-2 text-ink-soft">
            Variant health is compared to control each window. Simulate a bad metric to trip the
            guard and roll a flag back.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 text-sm text-ink-soft">
          <span className="h-2 w-2 animate-pulse rounded-full bg-signal-green" />
          {liveCount} live · guard on
        </span>
      </div>

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
          {rollouts.map((r) => {
            const rm = r.metric || {}
            const lw = (windowsById[r.id] || []).slice(-1)[0]
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={`card w-full p-4 text-left transition-shadow ${
                  selected.id === r.id ? 'ring-2 ring-ink' : 'hover:shadow-[0_16px_40px_-30px_rgba(16,15,13,0.4)]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-medium text-ink">{r.flag}</span>
                  <StatusPill status={statusFor(r.trend)} />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-ink-faint">
                  <span>{rm.label}</span>
                  <span className="tabular-nums">
                    {lw ? fmt(lw.variant, rm.unit) : 'n/a'} · {r.rollout}% ramp
                  </span>
                </div>
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
                <StatusPill status={status} />
                <span className="rounded-full border border-line px-2 py-0.5 text-xs uppercase tracking-wide text-ink-faint">
                  {selected.env}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-ink-faint">
                <span className="font-mono">{selected.id}</span> · {selected.rollout}% ramp · {selected.startedLabel}
              </p>
            </div>
            {selected.trend !== 'rolled_back' && (
              <button
                type="button"
                onClick={() => simulateRollback(selected)}
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-2 text-sm font-semibold text-[#c0392b] transition-colors hover:bg-[#fbe6e5]"
              >
                <BoltIcon className="h-4 w-4" />
                Simulate bad metric
              </button>
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
            <MetricCol label="Threshold" value={m.threshold} unit={m.unit} tone="text-ink-soft" sub={`over ${m.windowsToRollback} windows`} />
          </div>

          {/* Chart */}
          <div className="mt-6 rounded-xl border border-line bg-panel p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow">{m.label} · last {windows.length} windows</p>
              <div className="flex items-center gap-3 text-xs text-ink-faint">
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 bg-ink-faint" /> control
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-0.5 w-3 bg-accent-strong" /> variant
                </span>
              </div>
            </div>
            <HealthChart windows={windows} metric={m} status={status} />
          </div>

          {/* Window strip */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <p className="eyebrow">Rolling window status</p>
              <span className="text-xs font-semibold text-ink-faint">
                {selected.trend === 'rolled_back' ? 'rollout disabled' : `each window is ${m.windowLabel}`}
              </span>
            </div>
            <WindowStrip windows={windows} need={m.windowsToRollback} />
            <p className="mt-2 text-xs text-ink-faint">
              Windows with fewer than {m.minSample} samples are skipped so the guard never acts on
              noise.
            </p>
          </div>

          {/* Rolled-back state */}
          {selected.trend === 'rolled_back' && (
            <div className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 text-sm text-ink-soft">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
              <p>
                This flag is disabled and held at 0%. Dig into the regression, then turn it back on
                from the flag page.
              </p>
            </div>
          )}

          {/* Rollback history */}
          <div className="mt-6">
            <p className="eyebrow mb-2">Auto-rollback history</p>
            {(selected.rollbacks || []).length === 0 ? (
              <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-faint">
                No rollbacks on this flag. The guard has not had to intervene.
              </p>
            ) : (
              <ol className="space-y-3">
                {selected.rollbacks.map((rb, i) => (
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
