import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MobileHeader from './components/MobileHeader'
import BottomNav from './components/BottomNav'
import TopHeader from './components/TopHeader'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import MemberProfileModal from './components/MemberProfileModal'
import { fetchAllData, updateUserProfileRole } from './lib/dataStore'
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

function AnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('config', 'G-G0VDGMHWC1', {
        page_path: location.pathname + location.search,
        page_title: document.title
      })
    }
  }, [location])

  return null
}

function Shell({ children }) {
  const { profile } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [allEntries, setAllEntries] = useState([])
  const [allProjects, setAllProjects] = useState([])

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

  async function handleOpenProfile() {
    const data = await fetchAllData()
    setAllEntries(data.entries || [])
    setAllProjects(data.projects || [])
    setProfileModalOpen(true)
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full max-w-full overflow-hidden bg-base-950 text-base-100">
      {/* Mobile header — shown below lg */}
      <MobileHeader onOpenProfile={handleOpenProfile} />

      {/* Desktop sidebar — completely stationary, locked on left */}
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />

      {/* Right column: top header (pinned at top) + scrollable page content + footer */}
      <div className="flex-1 flex flex-col h-full min-w-0 w-full max-w-full overflow-hidden">
        <TopHeader onViewProfile={handleOpenProfile} />
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col scroll-smooth w-full max-w-full">
          <main className="flex-1 px-3.5 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-[1500px] w-full min-w-0 max-w-full mx-auto transition-all duration-300 pb-28 sm:pb-20 md:pb-8 box-border">
            {children}
          </main>
          <Footer />
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar with Profile Trigger */}
      <BottomNav onOpenProfile={handleOpenProfile} />

      {/* Global Performance Profile Modal */}
      {profileModalOpen && profile && (
        <MemberProfileModal
          member={profile}
          entries={allEntries}
          projects={allProjects}
          onRoleChange={async (userId, newRole, newPermissions) => {
            await updateUserProfileRole(userId, newRole, newPermissions)
          }}
          onClose={() => setProfileModalOpen(false)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <>
      <AnalyticsTracker />
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
    </>
  )
}
