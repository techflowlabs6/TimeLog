function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="font-display font-semibold text-lg text-base-100 mb-3 pb-2 border-b border-base-800">{title}</h2>
      <div className="text-sm text-base-400 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-accent/70 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-4">
          Legal
        </div>
        <h1 className="font-display font-bold text-3xl text-base-100 mb-2">Privacy Policy</h1>
        <p className="text-base-500 text-xs font-mono">Last updated: August 2026</p>
      </div>

      <Section title="1. Introduction">
        <p>TimeLog ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our time-tracking application.</p>
        <p>By using TimeLog you agree to the collection and use of information in accordance with this policy.</p>
      </Section>

      <Section title="2. Information We Collect">
        <p><span className="text-base-200 font-medium">Account data:</span> When you register, we collect your name and email address to create and manage your account.</p>
        <p><span className="text-base-200 font-medium">Time entries:</span> All time logs you create — including project, date, hours, and notes — are stored and associated with your account.</p>
        <p><span className="text-base-200 font-medium">Usage data:</span> We may collect anonymised, aggregated analytics about how features are used to improve the product. No personally identifiable browsing data is sold.</p>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>We use collected data to: provide and maintain the TimeLog service; authenticate you securely; generate team reports and dashboards; send transactional notifications (e.g. password reset); and improve product features.</p>
        <p>We do <span className="text-base-200 font-medium">not</span> sell, trade, or rent your personal information to third parties.</p>
      </Section>

      <Section title="4. Data Storage & Security">
        <p>Your data is stored in Supabase (PostgreSQL) with row-level security (RLS) enabled. This means each user can only access their own data unless they hold an admin role. All data is encrypted in transit (TLS) and at rest (AES-256).</p>
      </Section>

      <Section title="5. Data Retention">
        <p>We retain your account data for as long as your account is active. You may request deletion of your account and all associated data by contacting support. Deletion is processed within 30 days.</p>
      </Section>

      <Section title="6. Your Rights">
        <p>Depending on your jurisdiction, you may have the right to: access the personal data we hold about you; request correction of inaccurate data; request erasure of your data; object to or restrict certain processing; and data portability.</p>
        <p>To exercise these rights, contact us at the address below.</p>
      </Section>

      <Section title="7. Cookies">
        <p>TimeLog uses only essential session cookies required for authentication. We do not use third-party advertising or tracking cookies. See our <a href="/cookies" className="text-accent hover:underline">Cookie Policy</a> for details.</p>
      </Section>

      <Section title="8. Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via the application or email. Continued use after changes constitutes acceptance.</p>
      </Section>

      <Section title="9. Contact">
        <p>If you have questions about this policy, please <a href="/contact" className="text-accent hover:underline">contact our support team</a>.</p>
      </Section>
    </div>
  )
}
