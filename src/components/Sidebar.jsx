import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/log', label: 'Log Time', icon: '＋' },
  { to: '/my-log', label: 'My Entries', icon: '☰' },
  { to: '/roadmap', label: 'Roadmap', icon: '↗' }
]

export default function Sidebar() {
  const { profile, isAdmin, signOut } = useAuth()

  return (
    <aside className="hidden md:flex w-64 shrink-0 h-screen sticky top-0 flex-col border-r border-base-700 bg-base-950/60 px-5 py-6">
      <div className="mb-10">
        <div className="font-display font-semibold text-xl tracking-tight text-base-100">
          Time<span className="text-accent">Log</span>
        </div>
        <div className="label-eyebrow mt-1">team hours, tracked</div>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-base-400 hover:text-base-100 hover:bg-base-800/60 border border-transparent'
              }`
            }
          >
            <span className="w-4 text-center">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink
            to="/admin/projects"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-accent/10 text-accent border border-accent/20'
                  : 'text-base-400 hover:text-base-100 hover:bg-base-800/60 border border-transparent'
              }`
            }
          >
            <span className="w-4 text-center">⚙</span>
            Projects (admin)
          </NavLink>
        )}
      </nav>

      <div className="mt-auto pt-6 border-t border-base-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-mono text-xs font-semibold shrink-0">
            {(profile?.full_name || profile?.email || '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-base-100 truncate">{profile?.full_name || 'Unnamed'}</div>
            <div className="text-xs text-base-400 truncate">{profile?.role || 'Member'}</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-2 text-left text-sm text-base-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-base-800/60"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
