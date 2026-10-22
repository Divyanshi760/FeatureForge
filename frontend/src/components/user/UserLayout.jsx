import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import UserSidebar from './UserSidebar'

export default function UserLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas">
      {/* Fixed sidebar on desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-canvas lg:block">
        <UserSidebar />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-line bg-canvas shadow-2xl">
            <UserSidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Simple topbar for user portal */}
        <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-md">
          <div className="flex h-16 items-center gap-4 px-4 md:px-8">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line-strong lg:hidden"
              aria-label="Open menu"
            >
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 rounded-full bg-ink" />
                <span className="block h-0.5 w-5 rounded-full bg-ink" />
              </span>
            </button>

            <span className="text-sm font-semibold text-ink-faint uppercase tracking-wider">Issue Reporter</span>

            <div className="flex-1" />

            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal-blue/15 px-3 py-1 text-xs font-semibold text-signal-blue border border-signal-blue/20">
              User
            </span>
          </div>
        </header>

        <main className="px-4 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
