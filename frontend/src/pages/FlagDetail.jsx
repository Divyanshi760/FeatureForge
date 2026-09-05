import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowIcon,
  XIcon,
  PlusIcon,
  ChevronDownIcon,
  CheckIcon,
  ShieldIcon,
  BoltIcon,
} from '../components/icons'
import { getFlag, TYPE_BADGE, GOVERNED } from '../data/flags'

const OPERATORS = ['=', '!=', 'in', 'not in', 'contains', '>', '<', '>=', '<=', 'matches']
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
  const flag = getFlag(key)

  const [envs, setEnvs] = useState(flag?.envs ?? {})
  const [rollout, setRollout] = useState(flag?.rollout ?? 0)
  const [rules, setRules] = useState(flag?.rules ?? [])
  const [variants, setVariants] = useState(flag?.variants ?? null)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!flag) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card px-8 py-20 text-center">
          <h1 className="display text-3xl text-ink">Flag not found</h1>
          <p className="mt-3 text-ink-soft">
            No flag with the key <span className="font-mono">{key}</span> in this
            environment.
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
  const touch = () => {
    setDirty(true)
    setSaved(false)
  }

  /* env */
  const setEnv = (name, on) => {
    setEnvs((e) => ({ ...e, [name]: on }))
    touch()
  }

  /* rollout */
  const onRollout = (v) => {
    setRollout(v)
    touch()
  }

  /* rules */
  const updateRule = (i, patch) => {
    setRules((r) => r.map((rule, idx) => (idx === i ? { ...rule, ...patch } : rule)))
    touch()
  }
  const moveRule = (i, dir) => {
    setRules((r) => {
      const j = i + dir
      if (j < 0 || j >= r.length) return r
      const next = [...r]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
    touch()
  }
  const removeRule = (i) => {
    setRules((r) => r.filter((_, idx) => idx !== i))
    touch()
  }
  const addRule = () => {
    setRules((r) => [...r, { attr: 'attribute', op: '=', value: '' }])
    touch()
  }

  /* variants */
  const updateVariant = (i, patch) => {
    setVariants((v) => v.map((vn, idx) => (idx === i ? { ...vn, ...patch } : vn)))
    touch()
  }
  const removeVariant = (i) => {
    setVariants((v) => v.filter((_, idx) => idx !== i))
    touch()
  }
  const addVariant = () => {
    setVariants((v) => [...v, { name: `variant-${String.fromCharCode(97 + v.length)}`, weight: 0 }])
    touch()
  }
  const weightSum = variants ? variants.reduce((s, v) => s + Number(v.weight || 0), 0) : 0

  const save = () => {
    setDirty(false)
    setSaved(true)
  }

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
            <Link to="/flags" className="btn-ghost py-2.5">
              Discard
            </Link>
            <button
              type="button"
              onClick={save}
              disabled={!dirty}
              className="btn-accent py-2.5 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckIcon className="h-4 w-4" />
              Save changes
            </button>
          </div>
        </div>
      </div>

      {/* Save result banner */}
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#cfe9d6] bg-[#eaf7ee] px-5 py-3.5 text-sm">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-signal-green text-white">
            <CheckIcon className="h-4 w-4" />
          </span>
          <p className="text-[#256b3a]">
            {governed
              ? 'Change request opened. This edit needs four-eyes approval before it reaches users in prod.'
              : 'Changes saved. Ops flags apply immediately, no approval needed.'}
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
            ? 'This is a governed flag. Saving changes in prod opens a change request for four-eyes approval before anything reaches users.'
            : 'This is an ops flag. It is exempt from approval so it can be flipped fast during an incident. Every change is still written to the audit log.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Main column */}
        <div className="space-y-6">
          {/* Environments */}
          <Card
            title="Environments"
            desc="This flag's on/off state per environment."
          >
            <div className="divide-y divide-line">
              {['dev', 'staging', 'prod'].map((e) => (
                <div key={e} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium capitalize text-ink">{e}</p>
                    <p className="text-xs text-ink-faint">
                      {envs[e] ? 'Serving to matched users' : 'Off for everyone'}
                    </p>
                  </div>
                  <Toggle checked={envs[e]} onChange={(v) => setEnv(e, v)} />
                </div>
              ))}
            </div>
          </Card>

          {/* Targeting rules */}
          <Card
            title="Targeting rules"
            desc="Evaluated top to bottom. The first matching rule decides exposure."
            action={
              <button
                type="button"
                onClick={addRule}
                className="btn-ghost py-2 text-sm"
              >
                <PlusIcon className="h-4 w-4" />
                Add rule
              </button>
            }
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
                    <input
                      value={r.attr}
                      onChange={(e) => updateRule(i, { attr: e.target.value })}
                      className="w-32 rounded-lg border border-line bg-panel px-2.5 py-1.5 font-mono text-sm text-ink focus:border-line-strong focus:outline-none"
                    />
                    <div className="relative">
                      <select
                        value={r.op}
                        onChange={(e) => updateRule(i, { op: e.target.value })}
                        className="appearance-none rounded-lg border border-line bg-panel py-1.5 pl-2.5 pr-7 font-mono text-sm text-ink focus:border-line-strong focus:outline-none"
                      >
                        {OPERATORS.map((op) => (
                          <option key={op} value={op}>
                            {op}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon className="pointer-events-none absolute right-1.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                    </div>
                    <input
                      value={r.value}
                      onChange={(e) => updateRule(i, { value: e.target.value })}
                      placeholder="value"
                      className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-2.5 py-1.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
                    />
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveRule(i, -1)}
                        disabled={i === 0}
                        aria-label="Move up"
                        className="grid h-7 w-7 place-items-center rounded-md text-ink-faint transition-colors hover:bg-canvas hover:text-ink disabled:opacity-30"
                      >
                        <ChevronDownIcon className="h-4 w-4 rotate-180" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRule(i, 1)}
                        disabled={i === rules.length - 1}
                        aria-label="Move down"
                        className="grid h-7 w-7 place-items-center rounded-md text-ink-faint transition-colors hover:bg-canvas hover:text-ink disabled:opacity-30"
                      >
                        <ChevronDownIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRule(i)}
                        aria-label="Remove rule"
                        className="grid h-7 w-7 place-items-center rounded-md text-ink-faint transition-colors hover:bg-[#fbe6e5] hover:text-[#c0392b]"
                      >
                        <XIcon className="h-4 w-4" />
                      </button>
                    </div>
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
              onChange={(e) => onRollout(Number(e.target.value))}
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
          </Card>

          {/* Variants (experiment only) */}
          {variants && (
            <Card
              title="Variants"
              desc="Split matched traffic across variants. Weights should add up to 100."
              action={
                <button type="button" onClick={addVariant} className="btn-ghost py-2 text-sm">
                  <PlusIcon className="h-4 w-4" />
                  Add variant
                </button>
              }
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
                    <input
                      value={v.name}
                      onChange={(e) => updateVariant(i, { name: e.target.value })}
                      className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-2.5 py-1.5 font-mono text-sm text-ink focus:border-line-strong focus:outline-none"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={v.weight}
                        onChange={(e) => updateVariant(i, { weight: Number(e.target.value) })}
                        className="w-16 rounded-lg border border-line bg-panel px-2.5 py-1.5 text-right text-sm tabular-nums text-ink focus:border-line-strong focus:outline-none"
                      />
                      <span className="text-sm text-ink-faint">%</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      aria-label="Remove variant"
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-ink-faint transition-colors hover:bg-[#fbe6e5] hover:text-[#c0392b]"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
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
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-faint">Description</dt>
              </div>
              <p className="-mt-2 text-sm leading-relaxed text-ink-soft">
                {flag.description}
              </p>
              <div className="flex items-center justify-between border-t border-line pt-3">
                <dt className="text-ink-faint">Created by</dt>
                <dd className="font-medium text-ink">{flag.createdBy}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-faint">Created</dt>
                <dd className="font-medium text-ink">{flag.createdAt}</dd>
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

          <Card title="Recent changes">
            <ol className="space-y-3">
              {[
                { t: 'Rollout raised to ' + flag.rollout + '%', m: flag.by + ' · ' + flag.when },
                { t: 'Approved by 2 reviewers', m: 'dana@ · 1d ago' },
                { t: 'Rule added: country in [...]', m: 'lee@ · 3d ago' },
              ].map((c, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-faint" />
                  <div>
                    <p className="text-sm text-ink">{c.t}</p>
                    <p className="text-xs text-ink-faint">{c.m}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  )
}
