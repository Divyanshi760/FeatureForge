import { useState } from 'react'
import {
  LayersIcon,
  KeyIcon,
  BellIcon,
  CogIcon,
  CheckIcon,
  XIcon,
  PlusIcon,
} from '../components/icons'
import {
  PROJECT,
  ENVIRONMENTS,
  WEBHOOK,
  EVENT_LABELS,
  genKey,
} from '../data/settings'

const SECTIONS = [
  { id: 'environments', label: 'Environments', icon: LayersIcon },
  { id: 'keys', label: 'API keys', icon: KeyIcon },
  { id: 'alerts', label: 'Alerts', icon: BellIcon },
  { id: 'general', label: 'General', icon: CogIcon },
]

const mask = (key) => {
  const [a, b, c] = key.split('_')
  return `${a}_${b}_${c ? c.slice(0, 4) : ''}${'•'.repeat(18)}${key.slice(-4)}`
}

/* ------------------------------ primitives ---------------------------- */

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

/* ------------------------------ key row ------------------------------- */

function KeyRow({ label, value, scope, onRotate, onCopy }) {
  const [revealed, setRevealed] = useState(false)
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{label}</p>
          <p className="text-xs text-ink-faint">{scope}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-canvas"
          >
            {revealed ? 'Hide' : 'Reveal'}
          </button>
          <button
            type="button"
            onClick={onCopy}
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:bg-canvas"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={onRotate}
            className="rounded-lg border border-line-strong px-2.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:bg-canvas"
          >
            Rotate
          </button>
        </div>
      </div>
      <p className="mt-2 break-all font-mono text-xs text-ink-soft">
        {revealed ? value : mask(value)}
      </p>
    </div>
  )
}

/* -------------------------------- page -------------------------------- */

export default function Settings() {
  const [section, setSection] = useState('environments')
  const [envs, setEnvs] = useState(ENVIRONMENTS)
  const [webhookUrl, setWebhookUrl] = useState(WEBHOOK.url)
  const [events, setEvents] = useState(WEBHOOK.events)
  const [toast, setToast] = useState(null)

  const flash = (msg) => setToast(msg)

  /* environments */
  const renameEnv = (id, name) =>
    setEnvs((e) => e.map((x) => (x.id === id ? { ...x, name } : x)))
  const removeEnv = (id) => {
    setEnvs((e) => e.filter((x) => x.id !== id))
    flash('Environment removed. Its keys are now invalid.')
  }
  const addEnv = () => {
    const n = envs.length + 1
    setEnvs((e) => [
      ...e,
      {
        id: `env-${n}-${Date.now()}`,
        name: 'New environment',
        slug: `env${n}`,
        sdkKey: genKey('ff_sdk_new_'),
        serverKey: genKey('ff_srv_new_'),
        lastUsed: 'never',
      },
    ])
    flash('Environment added with a fresh key pair.')
  }

  /* keys */
  const rotate = (id, which) => {
    setEnvs((e) =>
      e.map((x) =>
        x.id === id
          ? { ...x, [which]: genKey(which === 'sdkKey' ? 'ff_sdk_new_' : 'ff_srv_new_') }
          : x,
      ),
    )
    flash('Key rotated. The old one stopped working right away, so remember to update your SDKs.')
  }
  const copy = (value) => {
    if (navigator.clipboard) navigator.clipboard.writeText(value).catch(() => {})
    flash('Copied to clipboard.')
  }

  /* alerts */
  const toggleEvent = (k) => setEvents((e) => ({ ...e, [k]: !e[k] }))

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div>
        <p className="eyebrow">
          {PROJECT.org} · {PROJECT.name}
        </p>
        <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Settings</h1>
        <p className="mt-2 text-ink-soft">
          Environments, SDK keys, and where alerts are delivered for this project.
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

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Section nav */}
        <nav className="flex gap-2 overflow-x-auto lg:h-fit lg:flex-col lg:gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSection(s.id)}
              className={`inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                section === s.id
                  ? 'bg-ink text-surface'
                  : 'text-ink-soft hover:bg-surface hover:text-ink'
              }`}
            >
              <s.icon className="h-[1.05rem] w-[1.05rem]" />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="space-y-6">
          {section === 'environments' && (
            <Card
              title="Environments"
              desc="Each environment has its own flag states and key pair. The SDK is scoped to one."
              action={
                <button type="button" onClick={addEnv} className="btn-ghost py-2 text-sm">
                  <PlusIcon className="h-4 w-4" />
                  Add
                </button>
              }
            >
              <div className="space-y-3">
                {envs.map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
                  >
                    <span className="rounded-full border border-line-strong bg-panel px-2.5 py-1 font-mono text-xs uppercase tracking-wide text-ink-faint">
                      {e.slug}
                    </span>
                    <input
                      value={e.name}
                      onChange={(ev) => renameEnv(e.id, ev.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium text-ink transition-colors hover:border-line focus:border-line-strong focus:bg-panel focus:outline-none"
                    />
                    <span className="text-xs text-ink-faint">used {e.lastUsed}</span>
                    <button
                      type="button"
                      onClick={() => removeEnv(e.id)}
                      aria-label="Remove environment"
                      disabled={e.slug === 'prod'}
                      className="grid h-7 w-7 place-items-center rounded-md text-ink-faint transition-colors hover:bg-[#fbe6e5] hover:text-[#c0392b] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-faint"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-ink-faint">
                Production can't be removed. Renaming is instant; the slug and keys stay
                the same.
              </p>
            </Card>
          )}

          {section === 'keys' && (
            <Card
              title="API keys"
              desc="Client keys bootstrap the SDK and stream config. Server keys ingest telemetry. Rotate anytime."
            >
              <div className="space-y-6">
                {envs.map((e) => (
                  <div key={e.id}>
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className="rounded-full border border-line-strong bg-surface px-2.5 py-0.5 font-mono text-xs uppercase tracking-wide text-ink-faint">
                        {e.slug}
                      </span>
                      <span className="text-sm font-medium text-ink">{e.name}</span>
                    </div>
                    <div className="space-y-2.5">
                      <KeyRow
                        label="SDK client key"
                        scope="Read config · subscribe to the stream"
                        value={e.sdkKey}
                        onRotate={() => rotate(e.id, 'sdkKey')}
                        onCopy={() => copy(e.sdkKey)}
                      />
                      <KeyRow
                        label="Server key"
                        scope="Ingest exposure, conversion & health events"
                        value={e.serverKey}
                        onRotate={() => rotate(e.id, 'serverKey')}
                        onCopy={() => copy(e.serverKey)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {section === 'alerts' && (
            <>
              <Card
                title="Slack webhook"
                desc="Where the platform posts guard, approval, and break-glass alerts."
                action={
                  <button
                    type="button"
                    onClick={() => flash('Test event sent to the webhook.')}
                    className="btn-ghost py-2 text-sm"
                  >
                    Send test
                  </button>
                }
              >
                <label className="block">
                  <span className="text-sm font-medium text-ink">Incoming webhook URL</span>
                  <input
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/…"
                    className="mt-1.5 w-full rounded-xl border border-line bg-panel px-3.5 py-2.5 font-mono text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => flash('Webhook saved.')}
                  className="btn-accent mt-4 py-2.5"
                >
                  <CheckIcon className="h-4 w-4" />
                  Save webhook
                </button>
              </Card>

              <Card
                title="Notify on"
                desc="Pick which events post to Slack. Auto-rollbacks and break-glass are on by default."
              >
                <div className="divide-y divide-line">
                  {Object.keys(EVENT_LABELS).map((k) => (
                    <div key={k} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                      <div>
                        <p className="text-sm font-medium text-ink">{EVENT_LABELS[k].label}</p>
                        <p className="text-xs text-ink-faint">{EVENT_LABELS[k].desc}</p>
                      </div>
                      <Toggle checked={events[k]} onChange={() => toggleEvent(k)} />
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {section === 'general' && (
            <>
              <Card title="Project" desc="Display details for this project.">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-medium text-ink">Organization</span>
                    <input
                      defaultValue={PROJECT.org}
                      className="mt-1.5 w-full rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm text-ink focus:border-line-strong focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm font-medium text-ink">Project name</span>
                    <input
                      defaultValue={PROJECT.name}
                      className="mt-1.5 w-full rounded-xl border border-line bg-panel px-3.5 py-2.5 text-sm text-ink focus:border-line-strong focus:outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => flash('Project details saved.')}
                    className="btn-accent py-2.5"
                  >
                    <CheckIcon className="h-4 w-4" />
                    Save
                  </button>
                </div>
              </Card>

              <Card title="Danger zone" desc="These actions affect every environment and can't be undone.">
                <div className="flex flex-col gap-3 rounded-xl border border-[#f0c9c4] bg-[#fdf3f2] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#7d2018]">Delete project</p>
                    <p className="text-xs text-[#95443b]">
                      Removes all flags, keys, and history for {PROJECT.name}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => flash('Deleting a project needs owner confirmation, which isn\'t wired up in this demo.')}
                    className="shrink-0 rounded-full border border-[#e0a49c] px-4 py-2 text-sm font-semibold text-[#c0392b] transition-colors hover:bg-[#fbe6e5]"
                  >
                    Delete project
                  </button>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
