/**
 * Mock team & RBAC data. Members hold a role scoped to the project or to a
 * subset of flags. Roles map to the capability matrix the middleware would
 * enforce via `requireRole(scope, minRole)`.
 */

export const ROLES = ['Admin', 'Maintainer', 'Viewer']

export const ROLE_META = {
  Admin: {
    badge: 'bg-ink text-surface',
    dot: 'bg-ink',
    desc: 'Full control, including team and settings.',
  },
  Maintainer: {
    badge: 'bg-[#eaf0fb] text-signal-blue',
    dot: 'bg-signal-blue',
    desc: 'Edit flags, approve changes, drive rollouts.',
  },
  Viewer: {
    badge: 'bg-canvas text-ink-faint border border-line-strong',
    dot: 'bg-ink-faint',
    desc: 'Read-only across flags, experiments, and audit.',
  },
}

export const MEMBERS = [
  {
    id: 'u-xyz',
    name: 'xyz',
    email: 'xyz@',
    role: 'Admin',
    owner: true,
    scope: 'Project-wide',
    lastActive: 'online now',
    status: 'active',
  },
  {
    id: 'u-ada',
    name: 'Ada Ofori',
    email: 'ada@',
    role: 'Admin',
    scope: 'Project-wide',
    lastActive: '20m ago',
    status: 'active',
  },
  {
    id: 'u-dana',
    name: 'Dana Walsh',
    email: 'dana@',
    role: 'Maintainer',
    scope: 'Project-wide',
    lastActive: '1h ago',
    status: 'active',
  },
  {
    id: 'u-sam',
    name: 'Sam Reyes',
    email: 'sam@',
    role: 'Maintainer',
    scope: 'Checkout flags',
    lastActive: '2h ago',
    status: 'active',
  },
  {
    id: 'u-lee',
    name: 'Lee Nakamura',
    email: 'lee@',
    role: 'Maintainer',
    scope: 'Growth flags',
    lastActive: '3h ago',
    status: 'active',
  },
  {
    id: 'u-priya',
    name: 'Priya Menon',
    email: 'priya@',
    role: 'Viewer',
    scope: 'Project-wide',
    lastActive: '2d ago',
    status: 'active',
  },
  {
    id: 'u-opsbot',
    name: 'Ops Bot',
    email: 'ops-bot',
    role: 'Maintainer',
    service: true,
    scope: 'Ops flags',
    lastActive: '6m ago',
    status: 'active',
  },
]

export const PENDING = [
  {
    id: 'inv-morgan',
    name: 'morgan@northwind.com',
    email: 'morgan@',
    role: 'Viewer',
    scope: 'Project-wide',
    lastActive: 'invited 1d ago',
    status: 'pending',
  },
]

// Capability matrix, most-privileged first. true = allowed for that role.
export const CAPABILITIES = [
  { label: 'View flags, experiments & audit', Admin: true, Maintainer: true, Viewer: true },
  { label: 'Create & edit flags', Admin: true, Maintainer: true, Viewer: false },
  { label: 'Approve change requests', Admin: true, Maintainer: true, Viewer: false },
  { label: 'Pause & roll back rollouts', Admin: true, Maintainer: true, Viewer: false },
  { label: 'Request break-glass', Admin: true, Maintainer: true, Viewer: false },
  { label: 'Manage team & settings', Admin: true, Maintainer: false, Viewer: false },
]
