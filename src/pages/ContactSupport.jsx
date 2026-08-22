import { useState } from 'react'

const SUBJECTS = [
  'General question',
  'Bug report',
  'Feature request',
  'Account / access issue',
  'Data / entry issue',
  'Admin / project help',
  'Other',
]

export default function ContactSupport() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    // Simulate sending
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1200)
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-accent/70 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-4">
          Support
        </div>
        <h1 className="font-display font-bold text-3xl text-base-100 mb-2">Contact Support</h1>
        <p className="text-base-400 text-sm">Fill out the form below and we'll get back to you within 24 hours.</p>
      </div>

      {sent ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h2 className="font-display font-semibold text-lg text-base-100 mb-2">Message sent!</h2>
          <p className="text-sm text-base-400">We've received your message and will reply to <span className="text-base-200">{form.email}</span> soon.</p>
          <button
            onClick={() => { setSent(false); setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' }) }}
            className="mt-6 px-5 py-2.5 bg-base-800 hover:bg-base-700 border border-base-700 rounded-xl text-sm text-base-200 transition-colors"
          >
            Send another message
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-base-400 font-medium mb-1.5" htmlFor="name">Your name</label>
              <input
                id="name" name="name" required
                value={form.name} onChange={handleChange}
                placeholder="Naveen Reddy"
                className="w-full bg-base-900/80 border border-base-700 hover:border-base-600 focus:border-accent/50 rounded-xl px-4 py-3 text-sm text-base-100 placeholder-base-600 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-base-400 font-medium mb-1.5" htmlFor="email">Email address</label>
              <input
                id="email" name="email" type="email" required
                value={form.email} onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-base-900/80 border border-base-700 hover:border-base-600 focus:border-accent/50 rounded-xl px-4 py-3 text-sm text-base-100 placeholder-base-600 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs text-base-400 font-medium mb-1.5" htmlFor="subject">Subject</label>
            <select
              id="subject" name="subject"
              value={form.subject} onChange={handleChange}
              className="w-full bg-base-900/80 border border-base-700 hover:border-base-600 focus:border-accent/50 rounded-xl px-4 py-3 text-sm text-base-100 outline-none transition-colors appearance-none cursor-pointer"
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs text-base-400 font-medium mb-1.5" htmlFor="message">Message</label>
            <textarea
              id="message" name="message" required rows={6}
              value={form.message} onChange={handleChange}
              placeholder="Describe your issue or question in detail…"
              className="w-full bg-base-900/80 border border-base-700 hover:border-base-600 focus:border-accent/50 rounded-xl px-4 py-3 text-sm text-base-100 placeholder-base-600 outline-none transition-colors resize-y min-h-[140px]"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent/15 hover:bg-accent/25 border border-accent/40 text-accent rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Sending…
              </>
            ) : 'Send Message →'}
          </button>
        </form>
      )}

      {/* Info cards */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: '⚡', title: 'Response time', body: 'We typically respond within 24 hours on business days.' },
          { icon: '🔒', title: 'Data privacy', body: 'Your message is only seen by the TimeLog support team.' },
        ].map(c => (
          <div key={c.title} className="bg-base-900/60 border border-base-800 rounded-xl px-4 py-4 flex gap-3">
            <span className="text-xl mt-0.5">{c.icon}</span>
            <div>
              <p className="text-sm font-medium text-base-200 mb-0.5">{c.title}</p>
              <p className="text-xs text-base-500">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
