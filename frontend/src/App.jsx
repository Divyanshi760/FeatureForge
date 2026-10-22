import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
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
import IssuesManagement from './pages/IssuesManagement'
import DeveloperManagement from './pages/DeveloperManagement'
import ApprovalQueue from './pages/ApprovalQueue'
import Placeholder from './pages/Placeholder'
import DashboardLayout from './components/dashboard/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { NAV_ITEMS } from './components/dashboard/nav'

// Developer portal
import DeveloperLayout from './components/developer/DeveloperLayout'
import DeveloperDashboard from './pages/developer/DeveloperDashboard'
import AvailableIssues from './pages/developer/AvailableIssues'
import DevMyIssues from './pages/developer/DevMyIssues'
import DevProfile from './pages/developer/DevProfile'

// User portal
import UserLayout from './components/user/UserLayout'
import UserDashboard from './pages/user/UserDashboard'
import ReportIssue from './pages/user/ReportIssue'
import UserMyReports from './pages/user/UserMyReports'


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
  '/issues': <IssuesManagement />,
  '/developers-mgmt': <DeveloperManagement />,
  '/approval-queue': <ApprovalQueue />,
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin dashboard */}
      <Route element={<ProtectedRoute allow={['admin']} />}>
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
          <Route path="/issues" element={<IssuesManagement />} />
          <Route path="/developers-mgmt" element={<DeveloperManagement />} />
          <Route path="/approval-queue" element={<ApprovalQueue />} />
          {NAV_ITEMS.filter((i) => !BUILT[i.to]).map((i) => (
            <Route
              key={i.to}
              path={i.to}
              element={<Placeholder title={i.label} icon={i.icon} />}
            />
          ))}
        </Route>
      </Route>

      {/* Developer portal */}
      <Route element={<ProtectedRoute allow={['developer']} />}>
        <Route element={<DeveloperLayout />}>
          <Route path="/developer" element={<DeveloperDashboard />} />
          <Route path="/developer/available" element={<AvailableIssues />} />
          <Route path="/developer/my-issues" element={<DevMyIssues />} />
          <Route path="/developer/status" element={<DevProfile />} />
          <Route path="/developer/profile" element={<DevProfile />} />
        </Route>
      </Route>

      {/* User portal */}
      <Route element={<ProtectedRoute allow={['user']} />}>
        <Route element={<UserLayout />}>
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/user/report" element={<ReportIssue />} />
          <Route path="/user/my-reports" element={<UserMyReports />} />
        </Route>
      </Route>
    </Routes>
  )
}
