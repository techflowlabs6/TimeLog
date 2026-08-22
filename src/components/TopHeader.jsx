import { useState, useRef, useEffect } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const ROUTE_META = {
  '/': { label: 'Dashboard', icon: '◈', desc: 'Overview of team hours & activity' },
  '/log': { label: 'Log Time', icon: '＋', desc: 'Record your work hours' },
  '/my-log': { label: 'My Entries', icon: '≡', desc: 'Your personal time log' },
  '/roadmap': { label: 'Roadmap', icon: '↗', desc: 'Project milestones & planning' },
  '/admin/projects': { label: 'Projects (Admin)', icon: '⚙', desc: 'Manage team projects' },
}

function BreadCrumb({ location }) {
  const meta = ROUTE_META[location.pathname] || { label: 'TimeLog', icon: '◈', desc: '' }
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-base-400 text-sm hidden sm:block font-medium">TimeLog</span>
      <svg className="w-3.5 h-3.5 text-base-600 hidden sm:block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      <span className="text-base-100 text-sm font-semibold flex items-center gap-1.5">
        <span className="text-accent">{meta.icon}</span>
        {meta.label}
      </span>
      {meta.desc && (
        <span className="hidden xl:block text-base-400 text-xs ml-1 font-normal">— {meta.desc}</span>
      )}
    </div>
  )
}

function SearchBar() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  // Keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    function handler(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-base-850 border border-base-700 rounded-xl text-base-400 hover:text-base-100 hover:border-accent/40 transition-all text-sm group shadow-xs"
        title="Search (Ctrl+K)"
        aria-label="Open Search"
      >
        <svg className="w-4 h-4 shrink-0 text-base-400 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span className="hidden md:block text-xs font-medium">Search…</span>
        <span className="hidden lg:flex items-center gap-0.5 text-[10px] font-mono bg-base-900 border border-base-700 rounded px-1.5 py-0.5 text-base-400 group-hover:border-accent/40 transition-colors">
          <span>⌘</span><span>K</span>
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 bg-base-900 border border-base-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-base-700 bg-base-850/50">
              <svg className="w-5 h-5 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search pages, entries, projects…"
                className="flex-1 bg-transparent text-base-100 text-sm placeholder-base-400 outline-none"
              />
              <kbd className="text-[10px] font-mono text-base-400 bg-base-850 border border-base-700 rounded px-1.5 py-0.5">ESC</kbd>
            </div>
            <div className="p-3">
              <p className="text-xs text-base-400 px-2 pb-2 font-mono uppercase tracking-wider font-semibold">Quick Navigation</p>
              {Object.entries(ROUTE_META).map(([path, meta]) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-base-300 hover:text-base-100 hover:bg-base-800 transition-colors"
                >
                  <span className="text-accent w-5 text-center font-bold">{meta.icon}</span>
                  <span className="font-semibold">{meta.label}</span>
                  <span className="ml-auto text-xs text-base-400">{meta.desc}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const NOTIFS = [
    { id: 1, icon: '🕐', title: 'New hours logged', body: 'Sushma logged 3h on French Grammar', time: '2m ago', unread: true },
    { id: 2, icon: '✅', title: 'Week summary ready', body: 'Your team logged 62.5h this week', time: '1h ago', unread: true },
    { id: 3, icon: '🚀', title: 'Roadmap updated', body: 'New milestone added to Q3 plan', time: '3h ago', unread: false },
  ]
  const unreadCount = NOTIFS.filter(n => n.unread).length

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 text-base-400 hover:text-base-100 hover:bg-base-800 rounded-xl transition-colors border border-transparent hover:border-base-700"
        aria-label="Notifications"
        title="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full animate-pulse shadow-xs" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-base-900 border border-base-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-700 bg-base-850/50">
            <span className="text-sm font-semibold text-base-100">Notifications</span>
            <span className="text-xs text-accent font-semibold bg-accent/15 border border-accent/25 rounded-full px-2 py-0.5 font-mono">{unreadCount} new</span>
          </div>
          <div className="divide-y divide-base-800/80 max-h-72 overflow-y-auto">
            {NOTIFS.map(n => (
              <div key={n.id} className={`flex gap-3 px-4 py-3 transition-colors hover:bg-base-850 ${n.unread ? '' : 'opacity-60'}`}>
                <div className="text-lg shrink-0 mt-0.5">{n.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-base-100 truncate">{n.title}</p>
                    {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
                  </div>
                  <p className="text-xs text-base-400 mt-0.5 line-clamp-1">{n.body}</p>
                  <p className="text-[10px] text-base-400 font-mono mt-1 font-medium">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-base-700 bg-base-850/30">
            <button className="text-xs text-accent hover:text-accent/80 transition-colors font-semibold w-full text-center">
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function UserDropdown({ profile, isAdmin, signOut }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const initial = (profile?.full_name || profile?.email || '?').slice(0, 1).toUpperCase()

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 pl-2 pr-2.5 py-1 bg-base-850 border border-base-700 rounded-xl hover:border-accent/40 transition-all group shadow-xs"
        aria-label="User menu"
        title="User menu"
      >
        <div className="w-7 h-7 rounded-lg bg-accent/20 text-accent flex items-center justify-center font-mono text-xs font-bold border border-accent/30 shadow-xs">
          {initial}
        </div>
        <div className="hidden md:block text-left min-w-0">
          <div className="text-xs font-semibold text-base-100 leading-none truncate max-w-[100px]">
            {profile?.full_name || 'Team Member'}
          </div>
          <div className="text-[10px] text-base-400 font-mono mt-0.5 capitalize">
            {isAdmin ? 'admin' : profile?.role || 'member'}
          </div>
        </div>
        <svg className={`w-3.5 h-3.5 text-base-400 transition-transform hidden md:block ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-base-900 border border-base-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Profile header */}
          <div className="px-4 py-3.5 border-b border-base-700 bg-base-850/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-mono text-sm font-bold border border-accent/30 shadow-xs">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-base-100 truncate">{profile?.full_name || 'Team Member'}</p>
                <p className="text-[11px] text-base-400 truncate">{profile?.email || ''}</p>
              </div>
            </div>
            {isAdmin && (
              <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-accent bg-accent/15 border border-accent/30 rounded-lg px-2 py-0.5 w-fit font-semibold">
                <span>⚙</span> Admin Access
              </div>
            )}
          </div>

          {/* Menu items */}
          <div className="p-1.5 space-y-0.5">
            <NavLink to="/my-log" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-base-300 hover:text-base-100 hover:bg-base-800 transition-colors">
              <svg className="w-4 h-4 text-base-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Entries
            </NavLink>
            <NavLink to="/roadmap" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-base-300 hover:text-base-100 hover:bg-base-800 transition-colors">
              <svg className="w-4 h-4 text-base-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Roadmap
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin/projects" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-base-300 hover:text-base-100 hover:bg-base-800 transition-colors">
                <svg className="w-4 h-4 text-base-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </NavLink>
            )}
          </div>

          <div className="p-1.5 border-t border-base-700 bg-base-850/40">
            <button
              onClick={() => { setOpen(false); signOut() }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TopHeader() {
  const { profile, isAdmin, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  return (
    <header className="hidden lg:flex sticky top-0 z-40 h-14 items-center justify-between px-6 bg-base-900/75 backdrop-blur-xl border-b border-base-700/80 shadow-xs">
      {/* Left: Breadcrumb */}
      <BreadCrumb location={location} />

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        <SearchBar />
        <NotificationBell />
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-base-400 hover:text-base-100 hover:bg-base-800 rounded-xl transition-colors border border-transparent hover:border-base-700 focus:outline-none"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
        <div className="w-px h-5 bg-base-700/80 mx-0.5" />
        {/* Status pill */}
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2.5 py-0.5 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          Online
        </div>
        <UserDropdown profile={profile} isAdmin={isAdmin} signOut={signOut} />
      </div>
    </header>
  )
}
