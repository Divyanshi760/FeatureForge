import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowIcon, CheckIcon, ShieldIcon, BoltIcon } from '../components/icons'
import { TYPE_BADGE, GOVERNED } from '../data/flags'
import { api } from '../lib/api'

const VARIANT_COLORS = ['#0a0a0a', '#ff8933', '#7793c5', '#378032', '#b5811f']

/* ----------------------------- primitives ----------------------------- */

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-ink' : 'bg-line-strong'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
          checked ? 'left-[1.375rem]' : 'left-0.5'
        }`}
      />
    </button>
  )
}

function Card({ title, desc, action, children }) {
  return (
    <section className="card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
          {desc ? <p className="mt-1 text-sm text-ink-faint">{desc}</p> : null}
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  )
}

/* -------------------------------- page -------------------------------- */

export default function FlagDetail() {
  const { key } = useParams()
  const [flag, setFlag] = useState(null)
  const [rollout, setRollout] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const reload = async () => {
    try {
      setLoading(true)
      setError(null)
      const flags = await api.get('/flags')
      const found = flags.find((f) => f.key === key) || null
      setFlag(found)
      setRollout(found?.rollout ?? 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const toggle = async () => {
    try {
      const updated = await api.patch(`/flags/${flag.key}/toggle`)
      setFlag(updated)
      setRollout(updated.rollout)
    } catch (err) {
      setError(err.message)
    }
  }

  const saveRollout = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const updated = await api.patch(`/flags/${flag.key}/rollout`, { rollout })
      setFlag(updated)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card px-8 py-20 text-center text-ink-faint">Loading flag…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card px-8 py-16 text-center">
          <p className="font-medium text-ink">Could not load this flag</p>
          <p className="mt-1 text-sm text-ink-faint">{error}</p>
          <button type="button" onClick={reload} className="btn-ghost mx-auto mt-6">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!flag) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card px-8 py-20 text-center">
          <h1 className="display text-3xl text-ink">Flag not found</h1>
          <p className="mt-3 text-ink-soft">
            No flag with the key <span className="font-mono">{key}</span> in this environment.
          </p>
          <Link to="/flags" className="btn-ghost mt-8">
            <ArrowIcon className="h-4 w-4 rotate-180" />
            Back to flags
          </Link>
        </div>
      </div>
    )
  }

  const governed = GOVERNED[flag.type]
  const envs = flag.envs || {}
  const rules = flag.rules || []
  const variants = flag.variants || []
  const dirty = rollout !== flag.rollout
  const weightSum = variants.reduce((s, v) => s + Number(v.weight || 0), 0)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Breadcrumb + header */}
      <div>
        <Link
          to="/flags"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-faint transition-colors hover:text-ink"
        >
          <ArrowIcon className="h-4 w-4 rotate-180" />
          Flags
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="display text-3xl text-ink md:text-4xl">{flag.name}</h1>
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${TYPE_BADGE[flag.type]}`}
              >
                {flag.type}
              </span>
            </div>
            <p className="mt-2 font-mono text-sm text-ink-faint">key: {flag.key}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-full border border-line bg-surface px-3.5 py-2">
              <span className="text-sm font-medium text-ink-soft">{flag.on ? 'On' : 'Off'}</span>
              <Toggle checked={flag.on} onChange={toggle} />
            </div>
            <button
              type="button"
              onClick={saveRollout}
              disabled={!dirty || saving}
              className="btn-accent py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckIcon className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Save result banner */}
      {saved && !dirty && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#cfe9d6] bg-[#eaf7ee] px-5 py-3.5 text-sm">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-signal-green text-white">
            <CheckIcon className="h-4 w-4" />
          </span>
          <p className="text-[#256b3a]">
            Rollout saved to {flag.rollout}% and written to the audit log.
          </p>
        </div>
      )}

      {/* Governance note */}
      <div
        className={`flex items-start gap-3 rounded-2xl border px-5 py-3.5 text-sm ${
          governed
            ? 'border-line bg-surface text-ink-soft'
            : 'border-[#f3dcc4] bg-[#fdf3e6] text-[#8a5a1c]'
        }`}
      >
        {governed ? (
          <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
        ) : (
          <BoltIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#b5811f]" />
        )}
        <p>
          {governed
            ? 'This is a governed flag. Changes in prod are recorded to the audit log for four-eyes review.'
            : 'This is an ops flag. It is exempt from approval so it can be flipped fast during an incident. Every change is still written to the audit log.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Environments (read-only) */}
          <Card title="Environments" desc="This flag's on/off state per environment.">
            <div className="divide-y divide-line">
              {['dev', 'staging', 'prod'].map((e) => (
                <div key={e} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium capitalize text-ink">{e}</p>
                    <p className="text-xs text-ink-faint">
                      {envs[e] ? 'Serving to matched users' : 'Off for everyone'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      envs[e] ? 'bg-[#e6f6ec] text-signal-green' : 'bg-canvas text-ink-faint'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${envs[e] ? 'bg-signal-green' : 'bg-ink-faint'}`} />
                    {envs[e] ? 'On' : 'Off'}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Targeting rules (read-only) */}
          <Card
            title="Targeting rules"
            desc="Evaluated top to bottom. The first matching rule decides exposure."
          >
            {rules.length === 0 ? (
              <p className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center text-sm text-ink-faint">
                No targeting rules. This flag applies to everyone in the rollout.
              </p>
            ) : (
              <ol className="space-y-2.5">
                {rules.map((r, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2.5"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-canvas font-mono text-xs text-ink-faint">
                      {i + 1}
                    </span>
                    <span className="font-mono text-sm text-ink">{r.attr}</span>
                    <span className="font-mono text-sm text-ink-faint">{r.op}</span>
                    <span className="min-w-0 flex-1 font-mono text-sm text-ink">{r.value}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          {/* Rollout */}
          <Card
            title="Rollout"
            desc="Deterministic bucketing, sticky per user. The same user always lands in the same bucket."
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ink-soft">Percentage</span>
              <span className="display text-3xl text-ink">{rollout}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={rollout}
              onChange={(e) => setRollout(Number(e.target.value))}
              style={{ accentColor: '#ff8933' }}
              className="mt-3 w-full cursor-pointer"
            />
            <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-canvas">
              <div
                className="h-full rounded-l-full"
                style={{
                  width: `${rollout}%`,
                  background: 'linear-gradient(90deg,#ff8933,#f5761a)',
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-ink-faint">
              <span>{rollout}% see this flag</span>
              <span>{100 - rollout}% held back</span>
            </div>
            {dirty && (
              <p className="mt-3 text-xs font-medium text-accent-strong">
                Unsaved change · press Save to apply {rollout}% and record it.
              </p>
            )}
          </Card>

          {/* Variants (read-only, experiment flags) */}
          {variants.length > 0 && (
            <Card
              title="Variants"
              desc="Split matched traffic across variants. Weights should add up to 100."
            >
              <div className="mb-4 flex h-2.5 overflow-hidden rounded-full bg-canvas">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    style={{
                      width: `${v.weight}%`,
                      background: VARIANT_COLORS[i % VARIANT_COLORS.length],
                    }}
                  />
                ))}
              </div>

              <div className="space-y-2.5">
                {variants.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: VARIANT_COLORS[i % VARIANT_COLORS.length] }}
                    />
                    <span className="min-w-0 flex-1 font-mono text-sm text-ink">{v.name}</span>
                    <span className="text-sm tabular-nums text-ink-soft">{v.weight}%</span>
                  </div>
                ))}
              </div>

              <div
                className={`mt-4 flex items-center justify-between rounded-xl px-4 py-2.5 text-sm ${
                  weightSum === 100
                    ? 'bg-[#eaf7ee] text-[#256b3a]'
                    : 'bg-accent-soft text-accent-strong'
                }`}
              >
                <span className="font-medium">Total weight</span>
                <span className="font-semibold tabular-nums">
                  {weightSum}% {weightSum === 100 ? '· balanced' : '· must equal 100'}
                </span>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card title="Details">
            <dl className="space-y-3.5 text-sm">
              <p className="text-sm leading-relaxed text-ink-soft">{flag.description}</p>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <dt className="text-ink-faint">Created by</dt>
                <dd className="font-medium text-ink">{flag.createdBy || flag.by}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-faint">Last modified</dt>
                <dd className="font-medium text-ink">
                  {flag.by} · {flag.when}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-faint">Governance</dt>
                <dd className="font-medium text-ink">
                  {governed ? 'Four-eyes approval' : 'Ops exemption'}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  )
}
