import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function BottomNav() {
  const { isAdmin } = useAuth()

  const links = [
    { to: '/', label: 'Dashboard', icon: '◈' },
    { to: '/log', label: 'Log Time', icon: '＋' },
    { to: '/my-log', label: 'My Log', icon: '☰' },
    { to: '/roadmap', label: 'Roadmap', icon: '↗' },
    ...(isAdmin ? [{ to: '/admin/projects', label: 'Admin', icon: '⚙' }] : [])
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-base-950/95 backdrop-blur-md border-t border-base-800 px-2 py-1.5 flex items-center justify-around">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.to === '/'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors min-w-[54px] ${
              isActive
                ? 'text-accent font-medium'
                : 'text-base-400 hover:text-base-200'
            }`
          }
        >
          <span className="text-base leading-none mb-0.5">{l.icon}</span>
          <span className="text-[10px] tracking-tight">{l.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
