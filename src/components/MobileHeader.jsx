import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/log', label: 'Log Time', icon: '＋' },
  { to: '/my-log', label: 'My Entries', icon: '☰' },
  { to: '/roadmap', label: 'Roadmap', icon: '↗' }
]

export default function MobileHeader() {
  const { profile, isAdmin, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  // Close slide-over menu whenever path changes
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // Get current page title for top bar display
  const currentLink = links.find((l) => l.to === location.pathname) || 
    (location.pathname === '/admin/projects' ? { label: 'Projects (Admin)' } : { label: 'TimeLog' })

  return (
    <>
      {/* Top Mobile Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-base-950/95 backdrop-blur-md border-b border-base-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 text-base-300 hover:text-base-100 hover:bg-base-850 rounded-lg transition-colors focus:outline-none"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <div className="font-display font-bold text-base tracking-tight text-base-100 leading-none">
              Time<span className="text-accent">Log</span>
            </div>
            <div className="text-[11px] text-base-400 font-mono mt-0.5">{currentLink.label}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center font-mono text-xs font-semibold">
            {(profile?.full_name || profile?.email || '?').slice(0, 1).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Slide-over Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Menu Panel */}
          <div className="relative w-4/5 max-w-xs bg-base-900 border-r border-base-700 h-full p-6 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="font-display font-semibold text-xl tracking-tight text-base-100">
                    Time<span className="text-accent">Log</span>
                  </div>
                  <div className="label-eyebrow mt-0.5">team hours, tracked</div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-base-400 hover:text-base-100 hover:bg-base-800 rounded-lg transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex flex-col gap-1.5">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-accent/10 text-accent border border-accent/20'
                          : 'text-base-300 hover:text-base-100 hover:bg-base-800/60 border border-transparent'
                      }`
                    }
                  >
                    <span className="w-5 text-center text-base">{l.icon}</span>
                    {l.label}
                  </NavLink>
                ))}
                {isAdmin && (
                  <NavLink
                    to="/admin/projects"
                    className={({ isActive }) =>
                      `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-accent/10 text-accent border border-accent/20'
                          : 'text-base-300 hover:text-base-100 hover:bg-base-800/60 border border-transparent'
                      }`
                    }
                  >
                    <span className="w-5 text-center text-base">⚙</span>
                    Projects (Admin)
                  </NavLink>
                )}
              </nav>
            </div>

            {/* Profile & Sign Out Footer */}
            <div className="pt-6 border-t border-base-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-accent/20 text-accent flex items-center justify-center font-mono text-sm font-semibold">
                  {(profile?.full_name || profile?.email || '?').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-base-100 truncate">
                    {profile?.full_name || 'User'}
                  </div>
                  <div className="text-xs text-base-400 truncate">{profile?.role || 'Member'}</div>
                </div>
              </div>
              <button
                onClick={signOut}
                className="w-full flex items-center justify-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
