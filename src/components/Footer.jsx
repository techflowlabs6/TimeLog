import { NavLink } from 'react-router-dom'

const YEAR = new Date().getFullYear()

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/log', label: 'Log Time' },
  { to: '/my-log', label: 'My Entries' },
  { to: '/roadmap', label: 'Roadmap' },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Cookie Policy', to: '/cookies' },
]

const SUPPORT_LINKS = [
  { label: 'Help Center', to: '/help' },
  { label: 'Contact Support', to: '/contact' },
  { label: 'System Status', to: '/status' },
]

export default function Footer() {
  return (
    <footer className="border-t border-base-800/80 bg-base-950/90 backdrop-blur-md mt-auto pb-16 lg:pb-0">
      {/* Main footer grid */}
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">

          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1 mb-2 sm:mb-0">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold font-mono shadow-xs">
                T
              </div>
              <span className="font-display font-bold text-lg text-base-100">
                Time<span className="text-accent">Log</span>
              </span>
            </div>
            <p className="text-xs text-base-400 leading-relaxed max-w-sm">
              Team hours tracking built for modern engineering teams. Simple, accurate, real-time.
            </p>
            {/* Status badge */}
            <div className="mt-3.5 inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-2.5 py-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              All systems operational
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] font-mono tracking-[0.18em] uppercase text-base-500 dark:text-slate-400 font-bold mb-3">Navigation</h4>
            <ul className="space-y-2">
              {NAV_LINKS.map(link => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `text-xs sm:text-sm font-medium transition-colors ${isActive ? 'text-accent font-bold' : 'text-base-400 hover:text-base-100'}`
                    }
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[10px] font-mono tracking-[0.18em] uppercase text-base-500 dark:text-slate-400 font-bold mb-3">Support</h4>
            <ul className="space-y-2">
              {SUPPORT_LINKS.map(link => (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    className="text-xs sm:text-sm text-base-400 hover:text-base-100 transition-colors font-medium"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="text-[10px] font-mono tracking-[0.18em] uppercase text-base-500 dark:text-slate-400 font-bold mb-3">Legal</h4>
            <ul className="space-y-2">
              {LEGAL_LINKS.map(link => (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    className="text-xs sm:text-sm text-base-400 hover:text-base-100 transition-colors font-medium"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-base-800/80 bg-base-950">
        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <p className="text-[11px] text-base-400 font-mono text-center sm:text-left">
            © {YEAR} TimeLog — High-Output Engineering
          </p>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-accent font-mono font-bold bg-accent/15 px-2 py-0.5 rounded-md border border-accent/25">v2.1.0</span>
            <div className="w-px h-3 bg-base-700" />
            <NavLink to="/roadmap" className="text-[11px] text-base-400 hover:text-accent transition-colors font-mono font-medium">Roadmap</NavLink>
            <div className="w-px h-3 bg-base-700" />
            <NavLink to="/help" className="text-[11px] text-base-400 hover:text-accent transition-colors font-mono font-medium">Help</NavLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
