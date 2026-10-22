/**
 * Minimal line-icon set drawn as inline SVG so the landing page ships
 * with zero image dependencies. Every icon inherits `currentColor` and
 * accepts a className for sizing.
 */

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  'aria-hidden': true,
}

export function FlagIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M5 21V4M5 4h11l-2 3 2 3H5" />
    </svg>
  )
}

export function ShieldIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

export function BeakerIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M9 3h6M10 3v6l-4.5 8A2 2 0 0 0 7.3 20h9.4a2 2 0 0 0 1.8-3L14 9V3" />
      <path d="M7.5 14h9" />
    </svg>
  )
}

export function GaugeIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M4 19a8 8 0 1 1 16 0" />
      <path d="M12 15l4-4" />
      <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function KeyIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l8-8M17 6l2 2M14 9l2 2" />
    </svg>
  )
}

export function ScrollIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M7 4h10a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  )
}

export function BranchIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="8" r="2" />
      <path d="M6 7v10M6 12h6a4 4 0 0 0 4-4" />
    </svg>
  )
}

export function BoltIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M13 3L5 13h6l-1 8 8-10h-6l1-8Z" />
    </svg>
  )
}

export function ArrowIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function CheckIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

export function PlugIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M9 2v5M15 2v5M7 7h10v3a5 5 0 0 1-10 0V7ZM12 15v3a3 3 0 0 0 3 3h1" />
    </svg>
  )
}

export function GlobeIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c3 3.5 3 14 0 18M12 3c-3 3.5-3 14 0 18" />
    </svg>
  )
}

export function GridIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  )
}

export function UsersIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 5.6M17.5 20a5.5 5.5 0 0 0-2.4-4.5" />
    </svg>
  )
}

export function CogIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </svg>
  )
}

export function BellIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </svg>
  )
}

export function SearchIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

export function PlusIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function ClockIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  )
}

export function ChevronDownIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

export function XIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function LayersIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M12 3l9 5-9 5-9-5 9-5Z" />
      <path d="M3 13l9 5 9-5M3 17l9 5 9-5" />
    </svg>
  )
}

export function BugIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M8 2l1.88 1.88M16 2l-1.88 1.88M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6Z" />
      <path d="M12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M6 17l-4 1M17.47 9c1.93-.2 3.53-1.9 3.53-4M18 13h4M18 17l4 1" />
    </svg>
  )
}

export function CodeIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
    </svg>
  )
}

export function ClipboardCheckIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  )
}

export function UserIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <circle cx="12" cy="8" r="4" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
    </svg>
  )
}

export function FileTextIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}

export function InboxIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M22 12h-6l-2 3H10l-2-3H2" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
    </svg>
  )
}

export function ToggleIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
      <circle cx="16" cy="12" r="3" />
    </svg>
  )
}

export function LogOutIcon({ className }) {
  return (
    <svg className={className} {...base}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  )
}
