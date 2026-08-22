import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MobileHeader from './components/MobileHeader'
import TopHeader from './components/TopHeader'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LogTime from './pages/LogTime'
import MyLog from './pages/MyLog'
import AdminProjects from './pages/AdminProjects'
import Roadmap from './pages/Roadmap'
import HelpCenter from './pages/HelpCenter'
import ContactSupport from './pages/ContactSupport'
import SystemStatus from './pages/SystemStatus'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import CookiePolicy from './pages/CookiePolicy'
import { useAuth } from './context/AuthContext'

const SIDEBAR_KEY = 'timelog_sidebar_collapsed_v1'

function Shell({ children }) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_KEY) === 'true'
      setCollapsed(saved)
    } catch {
      setCollapsed(false)
    }
  }, [])

  function toggleSidebar() {
    setCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next))
      } catch {}
      return next
    })
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full overflow-hidden bg-base-950 text-base-100">
      {/* Mobile header — shown below lg */}
      <MobileHeader />
      {/* Desktop sidebar — completely stationary, locked on left */}
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      {/* Right column: top header (pinned at top) + scrollable page content + footer */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <TopHeader />
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col scroll-smooth">
          <main className="flex-1 px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1500px] w-full min-w-0 mx-auto transition-all duration-300">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Shell>
              <Dashboard />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/log"
        element={
          <ProtectedRoute>
            <Shell>
              <LogTime />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-log"
        element={
          <ProtectedRoute>
            <Shell>
              <MyLog />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/roadmap"
        element={
          <ProtectedRoute>
            <Shell>
              <Roadmap />
            </Shell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute adminOnly>
            <Shell>
              <AdminProjects />
            </Shell>
          </ProtectedRoute>
        }
      />
      {/* Support pages */}
      <Route path="/help" element={<ProtectedRoute><Shell><HelpCenter /></Shell></ProtectedRoute>} />
      <Route path="/contact" element={<ProtectedRoute><Shell><ContactSupport /></Shell></ProtectedRoute>} />
      <Route path="/status" element={<ProtectedRoute><Shell><SystemStatus /></Shell></ProtectedRoute>} />
      {/* Legal pages */}
      <Route path="/privacy" element={<ProtectedRoute><Shell><PrivacyPolicy /></Shell></ProtectedRoute>} />
      <Route path="/terms" element={<ProtectedRoute><Shell><TermsOfService /></Shell></ProtectedRoute>} />
      <Route path="/cookies" element={<ProtectedRoute><Shell><CookiePolicy /></Shell></ProtectedRoute>} />
    </Routes>
  )
}
