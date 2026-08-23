import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function BottomNav({ onOpenProfile }) {
  const { user, profile, isAdmin } = useAuth()

  const links = [
    { to: '/', label: 'Dashboard', icon: '◈' },
    { to: '/log', label: 'Log Time', icon: '＋' },
    { to: '/my-log', label: 'My Entries', icon: '≡' },
    { to: '/roadmap', label: 'Roadmap', icon: '↗' },
    ...(isAdmin ? [{ to: '/admin/projects', label: 'Projects', icon: '⚙' }] : [])
  ]

  const initial = (profile?.full_name || user?.email || 'NR').slice(0, 2).toUpperCase()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-950/95 backdrop-blur-lg border-t border-base-800/90 px-3 py-2 flex items-center justify-around shadow-2xl safe-area-bottom">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] ${
              isActive
                ? 'text-accent font-bold bg-accent/10 border border-accent/25 shadow-xs'
                : 'text-base-400 hover:text-base-100 hover:bg-base-900'
            }`
          }
        >
          <span className="text-base leading-none mb-0.5">{l.icon}</span>
          <span className="text-[10px] tracking-tight">{l.label}</span>
        </NavLink>
      ))}

      {/* Profile Trigger Tab */}
      <button
        type="button"
        onClick={onOpenProfile}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all min-w-[56px] text-base-400 hover:text-accent hover:bg-base-900 active:scale-95"
        title="View Performance Profile"
      >
        <span className="w-5 h-5 rounded-full bg-accent/20 border border-accent/40 text-accent font-mono text-[9px] font-bold flex items-center justify-center mb-0.5 shadow-xs">
          {initial}
        </span>
        <span className="text-[10px] tracking-tight font-medium">Profile</span>
      </button>
    </nav>
  )
}
