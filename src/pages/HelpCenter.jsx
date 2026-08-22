import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const FAQS = [
  {
    q: 'How do I log my hours?',
    a: 'Go to "Log Time" in the sidebar or top navigation. Fill in your project, date, hours worked, and an optional note, then click Save. Your entry will appear immediately in your personal log.'
  },
  {
    q: 'Can I edit or delete a time entry?',
    a: 'Yes. Navigate to "My Entries", find the entry you want to change, and use the edit (pencil) or delete (trash) icon next to it. Admins can also edit any team member\'s entries from the Admin panel.'
  },
  {
    q: 'How are weekly hours calculated?',
    a: 'The dashboard shows hours for the current ISO week (Monday–Sunday). Totals update in real time as entries are added or modified.'
  },
  {
    q: 'What does the Dashboard show?',
    a: 'The Dashboard shows total all-time hours, hours this week, hours this month, active members and projects, a pie chart of hours by project, and a bar chart of hours by team member.'
  },
  {
    q: 'Who has Admin access?',
    a: 'Users with the "admin" role can manage projects, view all team entries, and configure the workspace. Contact your workspace admin to request elevated access.'
  },
  {
    q: 'Can I filter entries by date range or project?',
    a: 'Yes. The Dashboard has "From", "To", and "Project" filters at the top that update all charts and stats instantly.'
  },
  {
    q: 'Is my data secure?',
    a: 'TimeLog uses Supabase with row-level security (RLS) policies. Each user can only read and write their own entries unless they have admin privileges. All data is encrypted in transit and at rest.'
  },
  {
    q: 'How do I sign out?',
    a: 'Click your avatar or name in the top-right header, then select "Sign Out" from the dropdown. On mobile, open the hamburger menu and use the Sign Out button at the bottom of the drawer.'
  },
]

const GUIDES = [
  { icon: '⏱', title: 'Logging your first entry', link: '/log' },
  { icon: '📊', title: 'Reading the dashboard', link: '/' },
  { icon: '🗂', title: 'Browsing your time log', link: '/my-log' },
  { icon: '🗺', title: 'Using the Roadmap', link: '/roadmap' },
]

function Accordion({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-base-800 rounded-xl overflow-hidden transition-all">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-base-850/60 transition-colors gap-4"
      >
        <span className="text-sm font-medium text-base-100">{q}</span>
        <svg
          className={`w-4 h-4 text-base-500 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-base-400 leading-relaxed border-t border-base-800/60 pt-3">
          {a}
        </div>
      )}
    </div>
  )
}

export default function HelpCenter() {
  return (
    <div className="max-w-3xl mx-auto py-4">
      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-accent/70 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-4">
          Support
        </div>
        <h1 className="font-display font-bold text-3xl text-base-100 mb-2">Help Center</h1>
        <p className="text-base-400 text-sm">Everything you need to know about using TimeLog.</p>
      </div>

      {/* Quick Start Guides */}
      <section className="mb-10">
        <h2 className="text-[10px] font-mono tracking-[0.18em] uppercase text-base-500 mb-4">Quick Start Guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GUIDES.map(g => (
            <NavLink
              key={g.link}
              to={g.link}
              className="flex items-center gap-3 px-4 py-3.5 bg-base-900/80 border border-base-800 rounded-xl hover:border-accent/30 hover:bg-base-850/80 transition-all group"
            >
              <span className="text-xl">{g.icon}</span>
              <span className="text-sm font-medium text-base-200 group-hover:text-accent transition-colors">{g.title}</span>
              <svg className="w-4 h-4 text-base-600 group-hover:text-accent ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </NavLink>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-[10px] font-mono tracking-[0.18em] uppercase text-base-500 mb-4">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {FAQS.map((f, i) => <Accordion key={i} q={f.q} a={f.a} />)}
        </div>
      </section>

      {/* Still stuck */}
      <div className="bg-base-900/80 border border-base-800 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="text-3xl">💬</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-base-100 mb-0.5">Still need help?</p>
          <p className="text-xs text-base-400">Reach out and our team will get back to you shortly.</p>
        </div>
        <NavLink
          to="/contact"
          className="shrink-0 px-4 py-2 bg-accent/10 hover:bg-accent/20 text-accent border border-accent/30 rounded-xl text-sm font-medium transition-colors"
        >
          Contact Support →
        </NavLink>
      </div>
    </div>
  )
}
