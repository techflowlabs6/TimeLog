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
    <footer className="border-t border-base-800/80 bg-base-950/80 backdrop-blur-sm mt-auto">
      {/* Main footer grid */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-xs font-bold font-mono">T</div>
              <span className="font-display font-bold text-lg text-base-100">
                Time<span className="text-accent">Log</span>
              </span>
            </div>
            <p className="text-xs text-base-500 leading-relaxed max-w-[220px]">
              Team hours tracking built for modern engineering teams. Simple, accurate, real-time.
            </p>
            {/* Status badge */}
            <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              All systems operational
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[10px] font-mono tracking-[0.18em] uppercase text-base-500 mb-4">Navigation</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map(link => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `text-sm transition-colors ${isActive ? 'text-accent' : 'text-base-400 hover:text-base-200'}`
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
            <h4 className="text-[10px] font-mono tracking-[0.18em] uppercase text-base-500 mb-4">Support</h4>
            <ul className="space-y-2.5">
              {SUPPORT_LINKS.map(link => (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    className="text-sm text-base-400 hover:text-base-200 transition-colors"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[10px] font-mono tracking-[0.18em] uppercase text-base-500 mb-4">Legal</h4>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map(link => (
                <li key={link.label}>
                  <NavLink
                    to={link.to}
                    className="text-sm text-base-400 hover:text-base-200 transition-colors"
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
      <div className="border-t border-base-700/60">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-base-400 font-mono">
            © {YEAR} TimeLog — Built with ♥ for high-output teams
          </p>
          <div className="flex items-center gap-4">
            <span className="text-[10px] text-base-400 font-mono font-semibold bg-base-850 px-2 py-0.5 rounded border border-base-700">v2.0.0</span>
            <div className="w-px h-3 bg-base-700" />
            <a href="/roadmap" className="text-[11px] text-base-400 hover:text-accent transition-colors font-mono">Changelog</a>
            <div className="w-px h-3 bg-base-700" />
            <a href="/help" className="text-[11px] text-base-400 hover:text-accent transition-colors font-mono">Docs</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
