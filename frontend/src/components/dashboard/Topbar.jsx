import { useState } from 'react'
import {
  SearchIcon,
  PlusIcon,
  ChevronDownIcon,
  LayersIcon,
} from '../icons'
import NotificationBell from '../NotificationBell'

const ENVS = ['dev', 'staging', 'prod']

export default function Topbar({ onMenu }) {
  const [env, setEnv] = useState('prod')

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-4 md:px-8">
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onMenu}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-strong lg:hidden"
          aria-label="Open menu"
        >
          <span className="flex flex-col gap-1.5">
            <span className="block h-0.5 w-5 rounded-full bg-ink" />
            <span className="block h-0.5 w-5 rounded-full bg-ink" />
          </span>
        </button>

        {/* Project switcher */}
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-line-strong"
        >
          <LayersIcon className="h-4 w-4 text-ink-faint" />
          <span className="hidden sm:inline">Checkout Platform</span>
          <span className="sm:hidden">Checkout</span>
          <ChevronDownIcon className="h-4 w-4 text-ink-faint" />
        </button>

        {/* Environment segmented control */}
        <div className="hidden items-center gap-1 rounded-full border border-line bg-surface p-1 sm:flex">
          {ENVS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEnv(e)}
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                env === e
                  ? 'bg-ink text-surface'
                  : 'text-ink-faint hover:text-ink'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative hidden md:block">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            placeholder="Search flags"
            className="w-56 rounded-full border border-line bg-surface py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink-faint focus:border-line-strong focus:outline-none"
          />
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Primary action */}
        <button type="button" className="btn-accent py-2.5">
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Create flag</span>
        </button>
      </div>
    </header>
  )
}
