import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BeakerIcon, CheckIcon, XIcon, ClockIcon } from '../components/icons'
import { api } from '../lib/api'

const VARIANT_COLORS = ['#0a0a0a', '#ff8933', '#7793c5', '#378032']
const pct = (n) => `${(n * 100).toFixed(2)}%`
const signedPct = (n) => `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}%`

/**
 * Directional read-out only. We report observed per-variant rates and the
 * raw gap vs control, and gate on sample size + horizon. We deliberately do
 * NOT compute statistical significance: a result is draft, insufficient data,
 * or directional until both the minimum sample and the horizon are met.
 */
function readResults(exp) {
  const variants = (exp.variants || []).map((v) => ({
    ...v,
    rate: v.exposures ? v.conversions / v.exposures : 0,
  }))
  const [control, ...rest] = variants
  const started = !exp.draft && variants.some((v) => v.exposures > 0)
  const minN = variants.length ? Math.min(...variants.map((v) => v.exposures)) : 0
  const sampleMet = minN >= exp.minSampleSize
  const horizonReached = exp.horizon?.type === 'sample' && minN >= (exp.horizon?.target || 0)
  const progress = exp.horizon?.target ? Math.min(100, Math.round((minN / exp.horizon.target) * 100)) : 0

  let best = rest[0] || control
  for (const v of rest) if (v.rate > best.rate) best = v
  const lift = control && control.rate ? (best.rate - control.rate) / control.rate : 0

  let status
  if (!started) status = 'draft'
  else if (!sampleMet) status = 'insufficient'
  else if (!horizonReached) status = 'collecting'
  else status = 'directional'

  return { variants, control, best, lift, minN, progress, sampleMet, horizonReached, status }
}

const STATUS_META = {
  draft: { label: 'Draft', tone: 'faint' },
  insufficient: { label: 'Insufficient data', tone: 'faint' },
  collecting: { label: 'Collecting', tone: 'blue' },
  directional: { label: 'Directional', tone: 'green' },
}

const TONE = {
  faint: { dot: 'bg-ink-faint', soft: 'bg-canvas text-ink-faint' },
  blue: { dot: 'bg-signal-blue', soft: 'bg-[#eaf0fb] text-signal-blue' },
  green: { dot: 'bg-signal-green', soft: 'bg-[#e6f6ec] text-signal-green' },
}

/* ------------------------------ primitives ---------------------------- */

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.draft
  const t = TONE[meta.tone]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${t.soft}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {meta.label}
    </span>
  )
}

function Stat({ label, value, sub, tone }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className={`mt-1 text-xl font-semibold tracking-tight tabular-nums ${tone || 'text-ink'}`}>{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-ink-faint">{sub}</p> : null}
    </div>
  )
}

/* ------------------------------- detail ------------------------------- */

function Results({ exp }) {
  const r = useMemo(() => readResults(exp), [exp])
  const maxRate = Math.max(...r.variants.map((v) => v.rate), 0.0001)

  return (
    <div className="card h-fit p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-semibold tracking-tight text-ink">{exp.name}</h2>
            <StatusPill status={r.status} />
          </div>
          <p className="mt-1.5 text-sm text-ink-faint">
            <span className="font-mono">{exp.id}</span> · metric{' '}
            <span className="font-medium text-ink-soft">{exp.metricLabel}</span> · on{' '}
            <Link to={`/flags/${exp.key}`} className="font-mono text-ink-soft transition-colors hover:text-accent-strong">
              {exp.flag}
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Min sample / variant" value={exp.minSampleSize.toLocaleString()} />
        <Stat label="Horizon" value={(exp.horizon?.target || 0).toLocaleString()} sub={`by ${exp.horizon?.dateLabel || 'TBD'}`} />
        <Stat
          label="Status"
          value={exp.draft ? 'Not started' : (exp.startedLabel || '').replace('Started ', '')}
          sub={exp.draft ? 'no traffic yet' : 'running'}
        />
      </div>

      {r.status === 'draft' ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-line bg-canvas text-ink-faint">
            <BeakerIcon className="h-5 w-5" />
          </span>
          <p className="mt-3 font-medium text-ink">Not started yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-faint">
            The flag and metric are bound. Once exposure and conversion events start flowing, results
            appear here as directional until the sample size and horizon are met.
          </p>
        </div>
      ) : (
        <>
          {/* Per-variant table */}
          <div className="mt-6">
            <p className="eyebrow mb-2">Variants</p>
            <div className="space-y-3">
              {r.variants.map((v, i) => {
                const isBest = r.status === 'directional' && r.best?.name === v.name && i !== 0
                return (
                  <div
                    key={v.name}
                    className={`rounded-xl border px-4 py-3 ${isBest ? 'border-[#cfe9d6] bg-[#f2faf4]' : 'border-line bg-surface'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: VARIANT_COLORS[i % VARIANT_COLORS.length] }} />
                        <span className="font-mono text-sm text-ink">{v.name}</span>
                        {i === 0 && (
                          <span className="rounded-full bg-canvas px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-ink-faint">
                            control
                          </span>
                        )}
                        {isBest && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-signal-green px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-white">
                            leading
                          </span>
                        )}
                      </span>
                      <span className="text-lg font-semibold tabular-nums text-ink">{pct(v.rate)}</span>
                    </div>
                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-canvas">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(v.rate / maxRate) * 100}%`, background: VARIANT_COLORS[i % VARIANT_COLORS.length] }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-ink-faint tabular-nums">
                      {v.conversions.toLocaleString()} conversions / {v.exposures.toLocaleString()} exposures
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Observed numbers (no significance claims) */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              label="Observed gap"
              value={signedPct(r.lift)}
              tone={r.lift > 0 ? 'text-signal-green' : r.lift < 0 ? 'text-[#c0392b]' : 'text-ink'}
              sub="vs control"
            />
            <Stat label="Smaller arm" value={r.minN.toLocaleString()} sub="exposures" />
            <Stat label="Progress" value={`${r.progress}%`} sub="to horizon" />
          </div>

          {/* Horizon progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-ink-faint">
              <span>Progress to horizon</span>
              <span className="tabular-nums">
                {r.minN.toLocaleString()} / {(exp.horizon?.target || 0).toLocaleString()} · {r.progress}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-canvas">
              <div className="h-full rounded-full bg-ink transition-all" style={{ width: `${r.progress}%` }} />
            </div>
          </div>

          <Verdict r={r} exp={exp} />
        </>
      )}
    </div>
  )
}

function Verdict({ r, exp }) {
  if (r.status === 'insufficient') {
    const need = Math.max(0, exp.minSampleSize - r.minN)
    return (
      <div className="mt-6 flex items-start gap-3 rounded-xl bg-surface px-4 py-3.5 text-sm text-ink-soft">
        <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
        <p>
          Insufficient data. Need {need.toLocaleString()} more exposures on the smaller arm before the
          numbers mean anything. Any gap shown is noise until then.
        </p>
      </div>
    )
  }
  if (r.status === 'collecting') {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#eaf0fb] px-4 py-3.5 text-sm text-signal-blue">
        <ClockIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Treat this as directional. The sample minimum is met but the fixed horizon has not been
          reached, so no winner is declared here.
        </p>
      </div>
    )
  }
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#cfe9d6] bg-[#eaf7ee] px-4 py-3.5 text-sm text-[#256b3a]">
      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        Horizon reached with a directional gap of {signedPct(r.lift)} for{' '}
        <span className="font-semibold">{r.best?.name}</span>. Confirm with your stats pipeline before
        shipping.
      </p>
    </div>
  )
}

/* -------------------------------- page -------------------------------- */

export default function Experiments() {
  const [experiments, setExperiments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [toast, setToast] = useState(null)

  const [showSetup, setShowSetup] = useState(false)
  const [form, setForm] = useState({ name: '', flag: '', key: '', metric: '', metricLabel: '', minSampleSize: 5000 })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)
  const [flags, setFlags] = useState([])

  const reload = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get('/experiments')
      setExperiments(data)
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

  const openSetup = async () => {
    setShowSetup(true)
    if (!flags.length) {
      try {
        setFlags(await api.get('/flags'))
      } catch {
        // flag picker falls back to manual entry
      }
    }
  }

  const onPickFlag = (name) => {
    const f = flags.find((x) => x.name === name)
    setForm((s) => ({ ...s, flag: name, key: f ? f.key : s.key }))
  }

  const createExperiment = async (e) => {
    e.preventDefault()
    setFormError(null)
    setSaving(true)
    try {
      const created = await api.post('/experiments', {
        ...form,
        minSampleSize: Number(form.minSampleSize) || 5000,
      })
      setExperiments((prev) => [created, ...prev])
      setSelectedId(created.id)
      setShowSetup(false)
      setForm({ name: '', flag: '', key: '', metric: '', metricLabel: '', minSampleSize: 5000 })
      setToast(`${created.name} created as a draft. Bind traffic to start collecting.`)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const rows = useMemo(() => experiments.map((e) => ({ exp: e, r: readResults(e) })), [experiments])
  const selected = experiments.find((e) => e.id === selectedId) || experiments[0]

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="card px-6 py-20 text-center text-ink-faint">Loading experiments…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="card px-6 py-16 text-center">
          <p className="font-medium text-ink">Could not load experiments</p>
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
          <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Experiments</h1>
          <p className="mt-2 text-ink-soft">
            Every flag can become an experiment. Results stay directional until sample size and the
            fixed horizon are both met.
          </p>
        </div>
        <button type="button" onClick={openSetup} className="btn-accent py-2.5">
          <BeakerIcon className="h-4 w-4" />
          New experiment
        </button>
      </div>

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

      {experiments.length === 0 ? (
        <div className="card px-6 py-16 text-center text-ink-faint">
          No experiments yet. Create one to bind a flag to a metric.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          {/* List */}
          <div className="space-y-3">
            {rows.map(({ exp, r }) => (
              <button
                key={exp.id}
                type="button"
                onClick={() => setSelectedId(exp.id)}
                className={`card w-full p-4 text-left transition-shadow ${
                  selected?.id === exp.id ? 'ring-2 ring-ink' : 'hover:shadow-[0_16px_40px_-30px_rgba(16,15,13,0.4)]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-medium text-ink">{exp.name}</span>
                  <StatusPill status={r.status} />
                </div>
                <p className="mt-1 text-xs text-ink-faint">{exp.metricLabel}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      r.status === 'draft'
                        ? 'text-ink-faint'
                        : r.lift > 0
                          ? 'text-signal-green'
                          : r.lift < 0
                            ? 'text-[#c0392b]'
                            : 'text-ink'
                    }`}
                  >
                    {r.status === 'draft' ? 'n/a' : signedPct(r.lift)}
                  </span>
                  <span className="text-xs text-ink-faint tabular-nums">{r.progress}% to horizon</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
                  <div
                    className={`h-full rounded-full ${TONE[STATUS_META[r.status].tone].dot}`}
                    style={{ width: `${r.progress}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selected && <Results exp={selected} />}
        </div>
      )}

      {/* Setup modal */}
      {showSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={() => setShowSetup(false)} />
          <form onSubmit={createExperiment} className="relative w-full max-w-md rounded-2xl border border-line bg-panel p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-ink">New experiment</h2>
                <p className="mt-1 text-sm text-ink-faint">Bind a flag to a metric. It starts as a draft with no traffic.</p>
              </div>
              <button type="button" onClick={() => setShowSetup(false)} className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-surface hover:text-ink">
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
                  placeholder="signup-cta"
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-soft">Flag</label>
                {flags.length ? (
                  <select
                    value={form.flag}
                    onChange={(e) => onPickFlag(e.target.value)}
                    required
                    className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink focus:border-line-strong focus:outline-none"
                  >
                    <option value="" disabled>
                      Pick a flag
                    </option>
                    {flags.map((f) => (
                      <option key={f.key} value={f.name}>
                        {f.name} ({f.key})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={form.flag}
                    onChange={(e) => setForm((s) => ({ ...s, flag: e.target.value }))}
                    required
                    placeholder="onboarding-tour"
                    className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-soft">Flag key</label>
                <input
                  value={form.key}
                  onChange={(e) => setForm((s) => ({ ...s, key: e.target.value }))}
                  required
                  placeholder="onboarding_tour"
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ink-soft">Metric</label>
                  <input
                    value={form.metric}
                    onChange={(e) => setForm((s) => ({ ...s, metric: e.target.value }))}
                    required
                    placeholder="signup_complete"
                    className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-soft">Min sample</label>
                  <input
                    type="number"
                    min="0"
                    value={form.minSampleSize}
                    onChange={(e) => setForm((s) => ({ ...s, minSampleSize: e.target.value }))}
                    className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm tabular-nums text-ink focus:border-line-strong focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-soft">Metric label</label>
                <input
                  value={form.metricLabel}
                  onChange={(e) => setForm((s) => ({ ...s, metricLabel: e.target.value }))}
                  placeholder="Signup completion"
                  className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
                />
              </div>
            </div>

            {formError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">{formError}</p>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button type="button" onClick={() => setShowSetup(false)} className="flex-1 rounded-xl border border-line py-2.5 text-sm font-medium text-ink-soft hover:bg-surface">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-accent flex-1 justify-center py-2.5 disabled:opacity-40">
                {saving ? 'Creating…' : 'Create draft'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
