import {
  GridIcon,
  BugIcon,
  PlusIcon,
  UserIcon,
} from '../icons'

export const USER_NAV_SECTIONS = [
  {
    heading: 'Overview',
    items: [
      { label: 'Dashboard', to: '/user', icon: GridIcon },
    ],
  },
  {
    heading: 'Issues',
    items: [
      { label: 'Report Issue', to: '/user/report', icon: PlusIcon },
      { label: 'My Reports', to: '/user/my-reports', icon: BugIcon },
    ],
  },
  {
    heading: 'Account',
    items: [
      { label: 'Profile', to: '/user/profile', icon: UserIcon },
    ],
  },
]

export const USER_NAV_ITEMS = USER_NAV_SECTIONS.flatMap((s) => s.items)
