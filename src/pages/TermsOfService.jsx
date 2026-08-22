function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="font-display font-semibold text-lg text-base-100 mb-3 pb-2 border-b border-base-800">{title}</h2>
      <div className="text-sm text-base-400 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase text-accent/70 bg-accent/10 border border-accent/20 rounded-full px-3 py-1 mb-4">
          Legal
        </div>
        <h1 className="font-display font-bold text-3xl text-base-100 mb-2">Terms of Service</h1>
        <p className="text-base-500 text-xs font-mono">Last updated: August 2026</p>
      </div>

      <Section title="1. Acceptance of Terms">
        <p>By accessing or using TimeLog you agree to be bound by these Terms of Service and our <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>. If you do not agree, do not use the service.</p>
      </Section>

      <Section title="2. Description of Service">
        <p>TimeLog is a web-based team time-tracking application that allows users to log work hours, manage projects, and view team productivity reports. The service is provided "as is" and may be updated at any time.</p>
      </Section>

      <Section title="3. User Accounts">
        <p>You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorised use of your account.</p>
        <p>Accounts are for individual use only. Sharing login credentials between multiple individuals is prohibited.</p>
      </Section>

      <Section title="4. Acceptable Use">
        <p>You agree <span className="text-base-200 font-medium">not</span> to: use the service for any unlawful purpose; attempt to gain unauthorised access to any part of the service; interfere with or disrupt the integrity of the service; upload malicious code; or misrepresent your identity.</p>
      </Section>

      <Section title="5. Data Ownership">
        <p>You retain full ownership of all time entries, project data, and content you submit to TimeLog. We claim no intellectual property rights over your data.</p>
        <p>By using the service you grant us a limited, non-exclusive licence to store and process your data solely to provide the service.</p>
      </Section>

      <Section title="6. Service Availability">
        <p>We strive for high availability but do not guarantee uninterrupted service. We reserve the right to suspend or discontinue any part of the service at any time with reasonable notice.</p>
      </Section>

      <Section title="7. Limitation of Liability">
        <p>To the maximum extent permitted by law, TimeLog shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, even if we have been advised of the possibility of such damages.</p>
      </Section>

      <Section title="8. Modifications to Terms">
        <p>We may revise these terms at any time. Material changes will be communicated via the application or email. Continued use of TimeLog after changes constitutes your acceptance of the revised terms.</p>
      </Section>

      <Section title="9. Governing Law">
        <p>These terms are governed by and construed in accordance with applicable law. Any disputes shall be resolved through good-faith negotiation, then binding arbitration.</p>
      </Section>

      <Section title="10. Contact">
        <p>Questions about these terms? <a href="/contact" className="text-accent hover:underline">Contact our support team</a>.</p>
      </Section>
    </div>
  )
}
