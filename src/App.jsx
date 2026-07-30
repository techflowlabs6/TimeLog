import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
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
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 py-8 max-w-[1400px]">{children}</main>
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
