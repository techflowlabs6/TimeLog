import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import MobileHeader from './components/MobileHeader'
import BottomNav from './components/BottomNav'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import LogTime from './pages/LogTime'
import MyLog from './pages/MyLog'
import AdminProjects from './pages/AdminProjects'
import Roadmap from './pages/Roadmap'
import { useAuth } from './context/AuthContext'

function Shell({ children }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-base-950">
      <MobileHeader />
      <Sidebar />
      <main className="flex-1 px-4 py-5 pb-20 sm:px-6 sm:py-6 md:pb-8 lg:px-8 lg:py-8 max-w-[1400px] w-full min-w-0 mx-auto overflow-x-hidden">
        {children}
      </main>
      <BottomNav />
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
    </Routes>
  )
}
