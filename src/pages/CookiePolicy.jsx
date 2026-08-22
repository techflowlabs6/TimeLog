const COOKIES = [
  {
    name: 'sb-access-token',
    type: 'Essential',
    purpose: 'Stores your authentication session token provided by Supabase Auth. Required to keep you logged in.',
    expiry: 'Session',
    provider: 'Supabase',
  },
  {
    name: 'sb-refresh-token',
    type: 'Essential',
    purpose: 'Used to silently refresh your access token so you stay logged in without re-entering credentials.',
    expiry: '7 days',
    provider: 'Supabase',
  },
  {
    name: 'timelog_sidebar_collapsed_v1',
    type: 'Preference',
    purpose: 'Remembers whether you have collapsed the sidebar navigation. Stored in localStorage, not a cookie.',
    expiry: 'Persistent',
    provider: 'TimeLog',
  },
]

const TYPE_STYLE = {
  Essential: 'text-accent/80 bg-accent/10 border-accent/20',
  Preference: 'text-purple-400/80 bg-purple-500/10 border-purple-500/20',
  Analytics: 'text-yellow-400/80 bg-yellow-500/10 border-yellow-500/20',
}

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="font-display font-semibold text-lg text-base-100 mb-3 pb-2 border-b border-base-800">{title}</h2>
      <div className="text-sm text-base-400 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function CookiePolicy() {
  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-accent/70 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-4">
          Legal
        </div>
        <h1 className="font-display font-bold text-3xl text-base-100 mb-2">Cookie Policy</h1>
        <p className="text-base-500 text-xs font-mono">Last updated: August 2026</p>
      </div>

      <Section title="What are cookies?">
        <p>Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently and to provide information to site owners.</p>
      </Section>

      <Section title="How TimeLog uses cookies">
        <p>TimeLog uses only <span className="text-base-200 font-medium">essential cookies</span> required for authentication and session management. We do <span className="text-base-200 font-medium">not</span> use advertising, tracking, or third-party analytics cookies.</p>
      </Section>

      {/* Cookies table */}
      <Section title="Cookies we use">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-base-800">
                <th className="text-left py-2.5 px-3 text-base-500 font-mono uppercase tracking-wider w-1/5">Name</th>
                <th className="text-left py-2.5 px-3 text-base-500 font-mono uppercase tracking-wider w-1/6">Type</th>
                <th className="text-left py-2.5 px-3 text-base-500 font-mono uppercase tracking-wider">Purpose</th>
                <th className="text-left py-2.5 px-3 text-base-500 font-mono uppercase tracking-wider w-1/8">Expiry</th>
                <th className="text-left py-2.5 px-3 text-base-500 font-mono uppercase tracking-wider w-1/8">Provider</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-800/50">
              {COOKIES.map(c => (
                <tr key={c.name} className="hover:bg-base-850/40 transition-colors">
                  <td className="py-3 px-3 font-mono text-base-300 align-top">{c.name}</td>
                  <td className="py-3 px-3 align-top">
                    <span className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded border ${TYPE_STYLE[c.type] || ''}`}>
                      {c.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-base-400 leading-relaxed align-top">{c.purpose}</td>
                  <td className="py-3 px-3 text-base-500 font-mono align-top whitespace-nowrap">{c.expiry}</td>
                  <td className="py-3 px-3 text-base-500 align-top">{c.provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Managing cookies">
        <p>You can control or delete cookies through your browser settings. Note that disabling essential cookies will prevent you from logging in to TimeLog.</p>
        <p>Most browsers allow you to: view and delete cookies; block cookies from specific sites; block all third-party cookies; and receive notifications before cookies are set.</p>
      </Section>

      <Section title="Changes to this policy">
        <p>We may update this Cookie Policy occasionally. The date at the top of this page will reflect when it was last revised.</p>
      </Section>

      <Section title="Contact">
        <p>Questions? <a href="/contact" className="text-accent hover:underline">Contact our support team</a>.</p>
      </Section>
    </div>
  )
}
