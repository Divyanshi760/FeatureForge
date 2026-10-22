import {
  GridIcon,
  InboxIcon,
  BugIcon,
  UserIcon,
  ToggleIcon,
} from '../icons'

export const DEV_NAV_SECTIONS = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', to: '/developer', icon: GridIcon },
    ],
  },
  {
    heading: 'Issues',
    items: [
      { label: 'Available Issues', to: '/developer/available', icon: InboxIcon },
      { label: 'My Issues', to: '/developer/my-issues', icon: BugIcon },
    ],
  },
  {
    heading: 'Account',
    items: [
      { label: 'My Status', to: '/developer/status', icon: ToggleIcon },
      { label: 'Profile', to: '/developer/profile', icon: UserIcon },
    ],
  },
]

export const DEV_NAV_ITEMS = DEV_NAV_SECTIONS.flatMap((s) => s.items)
