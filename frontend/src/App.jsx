import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Flags from './pages/Flags'
import FlagDetail from './pages/FlagDetail'
import Approvals from './pages/Approvals'
import Audit from './pages/Audit'
import BreakGlass from './pages/BreakGlass'
import Experiments from './pages/Experiments'
import Rollouts from './pages/Rollouts'
import Settings from './pages/Settings'
import Team from './pages/Team'
import Placeholder from './pages/Placeholder'
import DashboardLayout from './components/dashboard/DashboardLayout'
import { NAV_ITEMS } from './components/dashboard/nav'


// Dashboard routes that have a real page built. Everything else in the nav
// falls back to a styled placeholder until its page lands.
const BUILT = {
  '/dashboard': <Dashboard />,
  '/flags': <Flags />,
  '/approvals': <Approvals />,
  '/audit': <Audit />,
  '/break-glass': <BreakGlass />,
  '/experiments': <Experiments />,
  '/rollouts': <Rollouts />,
  '/settings': <Settings />,
  '/team': <Team />,
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/flags" element={<Flags />} />
        <Route path="/flags/:key" element={<FlagDetail />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/break-glass" element={<BreakGlass />} />
        <Route path="/experiments" element={<Experiments />} />
        <Route path="/rollouts" element={<Rollouts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/team" element={<Team />} />
        {NAV_ITEMS.filter((i) => !BUILT[i.to]).map((i) => (
          <Route
            key={i.to}
            path={i.to}
            element={<Placeholder title={i.label} icon={i.icon} />}
          />
        ))}
      </Route>
    </Routes>
  )
}
