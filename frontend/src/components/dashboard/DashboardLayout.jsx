import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-canvas">
      {/* Fixed sidebar on desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-canvas lg:block">
        <Sidebar />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-line bg-canvas shadow-2xl">
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="px-4 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
