import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', icon: '◈' },
  { to: '/log', label: 'Log Time', icon: '＋' },
  { to: '/my-log', label: 'My Entries', icon: '≡' },
  { to: '/roadmap', label: 'Roadmap', icon: '↗' }
]

export default function Sidebar({ collapsed, onToggle }) {
  const { profile, isAdmin, signOut } = useAuth()

  return (
    <aside
      className={`hidden lg:flex shrink-0 h-screen sticky top-0 flex-col border-r border-base-700 bg-base-900/70 backdrop-blur-xl transition-all duration-300 z-30 ${
        collapsed ? 'w-16 px-2 py-5' : 'w-64 px-5 py-6'
      }`}
    >
      {/* Header & Collapse Toggle Button */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-7`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold font-mono shadow-xs">
              T
            </div>
            <div>
              <div className="font-display font-bold text-lg tracking-tight text-base-100 leading-none">
                Time<span className="text-accent">Log</span>
              </div>
              <div className="label-eyebrow text-[9px] mt-0.5 text-base-400">team hours, tracked</div>
            </div>
          </div>
        )}

        <button
          onClick={onToggle}
          className="p-2 text-base-400 hover:text-base-100 hover:bg-base-800/80 rounded-xl transition-colors focus:outline-none border border-transparent hover:border-base-700"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <svg className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            title={collapsed ? l.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                collapsed ? 'justify-center px-0' : ''
              } ${
                isActive
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-xs font-semibold'
                  : 'text-base-400 hover:text-base-100 hover:bg-base-800/60 border border-transparent'
              }`
            }
          >
            <span className="w-5 text-center text-base shrink-0">{l.icon}</span>
            {!collapsed && <span className="truncate">{l.label}</span>}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin/projects"
            title={collapsed ? 'Projects (Admin)' : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                collapsed ? 'justify-center px-0' : ''
              } ${
                isActive
                  ? 'bg-accent/15 text-accent border border-accent/30 shadow-xs font-semibold'
                  : 'text-base-400 hover:text-base-100 hover:bg-base-800/60 border border-transparent'
              }`
            }
          >
            <span className="w-5 text-center text-base shrink-0">⚙</span>
            {!collapsed && <span className="truncate">Projects (admin)</span>}
          </NavLink>
        )}
      </nav>

      {/* User Profile & Sign Out */}
      <div className="pt-4 border-t border-base-800/80">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} mb-3`}>
          <div className="w-8 h-8 rounded-full bg-accent/20 text-accent flex items-center justify-center font-mono text-xs font-semibold border border-accent/30 shrink-0 shadow-xs">
            {(profile?.full_name || profile?.email || '?').slice(0, 1).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-base-100 truncate">{profile?.full_name || 'Member'}</div>
              <div className="text-xs text-base-400 truncate capitalize">{profile?.role || 'Member'}</div>
            </div>
          )}
        </div>

        <button
          onClick={signOut}
          title={collapsed ? 'Sign Out' : undefined}
          className={`w-full flex items-center text-left text-xs font-medium text-base-400 hover:text-red-400 transition-colors py-2 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20 ${
            collapsed ? 'justify-center px-0' : 'px-3 gap-2'
          }`}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
