import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BeakerIcon,
  CheckIcon,
  XIcon,
  ArrowIcon,
  ClockIcon,
} from '../components/icons'
import {
  EXPERIMENTS,
  computeResults,
  STATUS_META,
  TONE,
} from '../data/experiments'

const VARIANT_COLORS = ['#0a0a0a', '#ff8933', '#7793c5', '#378032']
const pct = (n) => `${(n * 100).toFixed(2)}%`
const signedPct = (n) => `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}%`

/* ------------------------------ primitives ---------------------------- */

function StatusPill({ status }) {
  const m = STATUS_META[status]
  const t = TONE[m.tone]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${t.soft}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {m.label}
    </span>
  )
}

function Stat({ label, value, sub, tone }) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <p className="text-xs text-ink-faint">{label}</p>
      <p className={`mt-1 text-xl font-semibold tracking-tight tabular-nums ${tone || 'text-ink'}`}>
        {value}
      </p>
      {sub ? <p className="mt-0.5 text-xs text-ink-faint">{sub}</p> : null}
    </div>
  )
}

/* ------------------------------- detail ------------------------------- */

function Results({ exp, onToast }) {
  const r = useMemo(() => computeResults(exp), [exp])
  const maxRate = Math.max(...r.variants.map((v) => v.rate), 0.0001)

  return (
    <div className="card h-fit p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-semibold tracking-tight text-ink">{exp.name}</h2>
            <StatusPill status={r.status} />
          </div>
          <p className="mt-1.5 text-sm text-ink-faint">
            <span className="font-mono">{exp.id}</span> · metric{' '}
            <span className="font-medium text-ink-soft">{exp.metricLabel}</span> · on{' '}
            <Link
              to={`/flags/${exp.key}`}
              className="font-mono text-ink-soft transition-colors hover:text-accent-strong"
            >
              {exp.flag}
            </Link>
          </p>
        </div>
      </div>

      {/* Config strip */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Min sample / variant" value={exp.minSampleSize.toLocaleString()} />
        <Stat
          label="Horizon"
          value={exp.horizon.target.toLocaleString()}
          sub={`by ${exp.horizon.dateLabel}`}
        />
        <Stat label="Status" value={exp.draft ? 'Not started' : exp.startedLabel.replace('Started ', '')} sub={exp.draft ? 'no traffic yet' : 'running'} />
      </div>

      {r.status === 'draft' ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-line bg-canvas text-ink-faint">
            <BeakerIcon className="h-5 w-5" />
          </span>
          <p className="mt-3 font-medium text-ink">Not started yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-faint">
            The flag and metric are bound. Start the experiment to begin bucketing users
            and collecting exposure and conversion events.
          </p>
          <button
            type="button"
            onClick={() => onToast(`${exp.name} started. Exposure events will begin flowing in.`)}
            className="btn-accent mx-auto mt-6 py-2.5"
          >
            <BeakerIcon className="h-4 w-4" />
            Start experiment
          </button>
        </div>
      ) : (
        <>
          {/* Per-variant table */}
          <div className="mt-6">
            <p className="eyebrow mb-2">Variants</p>
            <div className="space-y-3">
              {r.variants.map((v, i) => {
                const isWinner = r.winner === v.name
                return (
                  <div
                    key={v.name}
                    className={`rounded-xl border px-4 py-3 ${
                      isWinner ? 'border-[#cfe9d6] bg-[#f2faf4]' : 'border-line bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ background: VARIANT_COLORS[i % VARIANT_COLORS.length] }}
                        />
                        <span className="font-mono text-sm text-ink">{v.name}</span>
                        {i === 0 && (
                          <span className="rounded-full bg-canvas px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-ink-faint">
                            control
                          </span>
                        )}
                        {isWinner && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-signal-green px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-white">
                            <CheckIcon className="h-3 w-3" />
                            winner
                          </span>
                        )}
                      </span>
                      <span className="text-lg font-semibold tabular-nums text-ink">
                        {pct(v.rate)}
                      </span>
                    </div>
                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-canvas">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(v.rate / maxRate) * 100}%`,
                          background: VARIANT_COLORS[i % VARIANT_COLORS.length],
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-ink-faint tabular-nums">
                      {v.conversions.toLocaleString()} conversions /{' '}
                      {v.exposures.toLocaleString()} exposures
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              label="Observed lift"
              value={signedPct(r.lift)}
              tone={r.lift > 0 ? 'text-signal-green' : r.lift < 0 ? 'text-[#c0392b]' : 'text-ink'}
              sub="vs control"
            />
            <Stat
              label="p-value"
              value={r.pValue < 0.001 ? '<0.001' : r.pValue.toFixed(3)}
              tone={r.pValue < 0.05 ? 'text-signal-green' : 'text-ink'}
            />
            <Stat
              label="95% CI (abs)"
              value={`${signedPct(r.ciLow)}`}
              sub={`to ${signedPct(r.ciHigh)}`}
            />
            <Stat label="z-score" value={r.z.toFixed(2)} />
          </div>

          {/* Horizon progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-ink-faint">
              <span>Progress to horizon</span>
              <span className="tabular-nums">
                {r.minN.toLocaleString()} / {exp.horizon.target.toLocaleString()} ·{' '}
                {r.progress}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-full bg-ink transition-all"
                style={{ width: `${r.progress}%` }}
              />
            </div>
          </div>

          {/* Verdict */}
          <Verdict r={r} exp={exp} onToast={onToast} />
        </>
      )}
    </div>
  )
}

function Verdict({ r, exp, onToast }) {
  if (r.status === 'insufficient') {
    const need = exp.minSampleSize - r.minN
    return (
      <div className="mt-6 flex items-start gap-3 rounded-xl bg-surface px-4 py-3.5 text-sm text-ink-soft">
        <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
        <p>
          Not enough data yet. Need {need.toLocaleString()} more exposures on the smaller
          arm before results are meaningful. Any lift shown is noise until then.
        </p>
      </div>
    )
  }
  if (r.status === 'collecting') {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#eaf0fb] px-4 py-3.5 text-sm text-signal-blue">
        <ClockIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Treat this as directional for now. The result{' '}
          {r.pValue < 0.05 ? 'looks significant' : "isn't significant yet"}, but you
          haven't hit the fixed horizon, and calling it early is exactly how peeking
          sneaks in false positives. Winner declaration unlocks once the horizon is
          reached.
        </p>
      </div>
    )
  }
  if (r.status === 'no_effect') {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#fdf0d9] px-4 py-3.5 text-sm text-[#8a5a1c]">
        <XIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          The horizon came and went with no real difference (p = {r.pValue.toFixed(3)}).
          There's no winner here, so keep control and retire the variant.
        </p>
      </div>
    )
  }
  // significant
  return (
    <div className="mt-6 space-y-3">
      <div className="flex items-start gap-3 rounded-xl border border-[#cfe9d6] bg-[#eaf7ee] px-4 py-3.5 text-sm text-[#256b3a]">
        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          <span className="font-semibold">{r.best.name}</span> wins with{' '}
          {signedPct(r.lift)} lift (p = {r.pValue < 0.001 ? '<0.001' : r.pValue.toFixed(3)}
          , horizon reached). Safe to ship to everyone.
        </p>
      </div>
      <button
        type="button"
        onClick={() =>
          onToast(
            `Change request opened to roll ${r.best.name} out to 100%. Needs four-eyes approval before it ships.`,
          )
        }
        className="btn-primary w-full justify-center py-2.5"
      >
        Ship {r.best.name} to 100%
        <ArrowIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

/* -------------------------------- page -------------------------------- */

export default function Experiments() {
  const [selectedId, setSelectedId] = useState(EXPERIMENTS[0].id)
  const [toast, setToast] = useState(null)

  const rows = useMemo(
    () => EXPERIMENTS.map((e) => ({ exp: e, r: computeResults(e) })),
    [],
  )
  const selected = EXPERIMENTS.find((e) => e.id === selectedId) || EXPERIMENTS[0]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Checkout Platform · prod</p>
          <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Experiments</h1>
          <p className="mt-2 text-ink-soft">
            Every flag can become an experiment. Results stay directional until sample
            size and the fixed horizon are both met.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setToast('New experiment: pick a flag and bind it to a metric to begin.')}
          className="btn-accent py-2.5"
        >
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
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-ink-faint transition-colors hover:text-ink"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* List */}
        <div className="space-y-3">
          {rows.map(({ exp, r }) => (
            <button
              key={exp.id}
              type="button"
              onClick={() => setSelectedId(exp.id)}
              className={`card w-full p-4 text-left transition-shadow ${
                selected.id === exp.id
                  ? 'ring-2 ring-ink'
                  : 'hover:shadow-[0_16px_40px_-30px_rgba(16,15,13,0.4)]'
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
                <span className="text-xs text-ink-faint tabular-nums">
                  {r.progress}% to horizon
                </span>
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
        <Results exp={selected} onToast={setToast} />
      </div>
    </div>
  )
}
