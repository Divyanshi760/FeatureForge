import { useState } from 'react'
import {
  UsersIcon,
  ChevronDownIcon,
  CheckIcon,
  XIcon,
  PlusIcon,
} from '../components/icons'
import { PROJECT } from '../data/settings'
import {
  MEMBERS,
  PENDING,
  ROLES,
  ROLE_META,
  CAPABILITIES,
} from '../data/team'

/* ------------------------------ primitives ---------------------------- */

function Avatar({ member }) {
  const initials = member.service
    ? '⚙'
    : member.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
  return (
    <span
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold uppercase ${
        member.service ? 'bg-canvas text-ink-faint ring-1 ring-line-strong' : 'bg-ink text-surface'
      }`}
    >
      {initials}
    </span>
  )
}

function RoleSelect({ value, onChange, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none rounded-lg border border-line bg-panel py-1.5 pl-2.5 pr-8 text-sm font-medium text-ink focus:border-line-strong focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      {!disabled && (
        <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
      )}
    </div>
  )
}

function MemberRow({ m, onRole, onRemove }) {
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 sm:flex-nowrap">
      <Avatar member={m} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-ink">{m.name}</p>
          {m.owner && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-accent-strong">
              Owner
            </span>
          )}
          {m.service && (
            <span className="rounded-full bg-canvas px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-ink-faint">
              Service
            </span>
          )}
        </div>
        <p className="truncate font-mono text-xs text-ink-faint">{m.email}</p>
      </div>

      <span className="hidden w-32 shrink-0 text-xs text-ink-faint md:block">
        {m.scope}
      </span>
      <span className="hidden w-24 shrink-0 text-xs text-ink-faint lg:block">
        {m.lastActive}
      </span>

      <div className="w-32 shrink-0">
        <RoleSelect
          value={m.role}
          disabled={m.owner}
          onChange={(e) => onRole(m.id, e.target.value)}
        />
      </div>

      <button
        type="button"
        onClick={() => onRemove(m.id)}
        disabled={m.owner}
        aria-label="Remove member"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-faint transition-colors hover:bg-[#fbe6e5] hover:text-[#c0392b] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-ink-faint"
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  )
}

/* -------------------------------- page -------------------------------- */

export default function Team() {
  const [members, setMembers] = useState(MEMBERS)
  const [pending, setPending] = useState(PENDING)
  const [toast, setToast] = useState(null)
  const [email, setEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Viewer')

  const flash = (msg) => setToast(msg)

  const setRole = (id, role) => {
    setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, role } : m)))
    setPending((ps) => ps.map((m) => (m.id === id ? { ...m, role } : m)))
    flash(`Role updated to ${role}.`)
  }

  const remove = (id) => {
    setMembers((ms) => ms.filter((m) => m.id !== id))
    setPending((ps) => ps.filter((m) => m.id !== id))
    flash('Member removed. Their access is revoked immediately.')
  }

  const invite = (e) => {
    e.preventDefault()
    const value = email.trim()
    if (!value.includes('@')) {
      flash('Enter a valid email to send an invite.')
      return
    }
    setPending((ps) => [
      {
        id: `inv-${Date.now()}`,
        name: value,
        email: value.split('@')[0] + '@',
        role: inviteRole,
        scope: 'Project-wide',
        lastActive: 'invited just now',
        status: 'pending',
      },
      ...ps,
    ])
    setEmail('')
    flash(`Invite sent to ${value} as ${inviteRole}.`)
  }

  const counts = ROLES.map((r) => ({
    role: r,
    n: members.filter((m) => m.role === r).length,
  }))

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">
            {PROJECT.org} · {PROJECT.name}
          </p>
          <h1 className="display mt-2 text-3xl text-ink md:text-4xl">Team</h1>
          <p className="mt-2 text-ink-soft">
            {members.length} members. Roles are scoped and enforced on every governed
            action.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {counts.map((c) => (
            <span
              key={c.role}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-soft"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${ROLE_META[c.role].dot}`} />
              {c.n} {c.role}
            </span>
          ))}
        </div>
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

      {/* Invite */}
      <form
        onSubmit={invite}
        className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-line bg-surface px-3">
          <UsersIcon className="h-4 w-4 shrink-0 text-ink-faint" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Invite by email, like teammate@northwind.com"
            className="w-full bg-transparent py-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
        </div>
        <div className="w-full sm:w-36">
          <RoleSelect value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} />
        </div>
        <button type="submit" className="btn-accent shrink-0 justify-center py-2.5">
          <PlusIcon className="h-4 w-4" />
          Send invite
        </button>
      </form>

      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <p className="eyebrow mb-2">Pending invites</p>
          <div className="card divide-y divide-line overflow-hidden">
            {pending.map((m) => (
              <MemberRow key={m.id} m={m} onRole={setRole} onRemove={remove} />
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div>
        <p className="eyebrow mb-2">Members</p>
        <div className="card overflow-hidden">
          <div className="hidden items-center gap-3 border-b border-line px-5 py-2.5 text-xs uppercase tracking-wide text-ink-faint md:flex">
            <span className="w-9 shrink-0" />
            <span className="flex-1">Member</span>
            <span className="w-32 shrink-0">Scope</span>
            <span className="hidden w-24 shrink-0 lg:block">Active</span>
            <span className="w-32 shrink-0">Role</span>
            <span className="w-8 shrink-0" />
          </div>
          <div className="divide-y divide-line">
            {members.map((m) => (
              <MemberRow key={m.id} m={m} onRole={setRole} onRemove={remove} />
            ))}
          </div>
        </div>
      </div>

      {/* Permissions matrix */}
      <div>
        <p className="eyebrow mb-2">Roles &amp; permissions</p>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-3 font-semibold">Capability</th>
                  {ROLES.map((r) => (
                    <th key={r} className="px-5 py-3 text-center font-semibold">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${ROLE_META[r].dot}`} />
                        {r}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CAPABILITIES.map((cap) => (
                  <tr key={cap.label} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 text-sm text-ink">{cap.label}</td>
                    {ROLES.map((r) => (
                      <td key={r} className="px-5 py-3 text-center">
                        {cap[r] ? (
                          <CheckIcon className="mx-auto h-4 w-4 text-signal-green" />
                        ) : (
                          <span className="mx-auto block h-px w-3 bg-line-strong" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-line px-5 py-3 text-xs text-ink-faint">
            {ROLES.map((r) => (
              <span key={r}>
                <span className="font-medium text-ink-soft">{r}:</span> {ROLE_META[r].desc}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
