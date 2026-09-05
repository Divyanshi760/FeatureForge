import {
  GridIcon,
  FlagIcon,
  ShieldIcon,
  BeakerIcon,
  GaugeIcon,
  ScrollIcon,
  KeyIcon,
  UsersIcon,
  CogIcon,
} from '../icons'

/**
 * Sidebar navigation. Overview is the built dashboard home; the rest are
 * routed placeholders for now, ready to be filled in as each page lands.
 */
export const NAV_SECTIONS = [
  {
    heading: 'Workspace',
    items: [
      { label: 'Overview', to: '/dashboard', icon: GridIcon },
      { label: 'Flags', to: '/flags', icon: FlagIcon },
      { label: 'Approvals', to: '/approvals', icon: ShieldIcon, badge: 3 },
      { label: 'Experiments', to: '/experiments', icon: BeakerIcon },
      { label: 'Rollouts', to: '/rollouts', icon: GaugeIcon },
    ],
  },
  {
    heading: 'Governance',
    items: [
      { label: 'Audit log', to: '/audit', icon: ScrollIcon },
      { label: 'Break-glass', to: '/break-glass', icon: KeyIcon },
      { label: 'Team', to: '/team', icon: UsersIcon },
      { label: 'Settings', to: '/settings', icon: CogIcon },
    ],
  },
]

export const NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)
