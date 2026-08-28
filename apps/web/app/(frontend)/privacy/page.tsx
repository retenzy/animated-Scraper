import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - Retenzy',
  description: 'Retenzy privacy policy for the Amazon Review Exporter Chrome extension and web dashboard.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: August 3, 2026</p>

        <div className="space-y-8 text-sm text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Overview</h2>
            <p>
              Retenzy (&ldquo;we&rdquo;, &ldquo;our&rdquo;) provides the Retenzy Amazon Reviews
              Extractor Chrome extension and the Retenzy web dashboard (retenzy.com). This policy
              explains what data we collect, how it is used, and the controls you have over it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Data collected by the extension</h2>
            <p>The extension performs all review extraction locally in your browser.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Extracted reviews</strong> — review text, titles, star ratings, dates, and
                author names are stored only in your browser&apos;s local IndexedDB and are never
                uploaded to our servers.
              </li>
              <li>
                <strong>Scrape activity</strong> — for your dashboard history, we receive your
                account identifier, product reference (ASIN), the page URL, the job status, and the
                review count of each scraping job.
              </li>
              <li>
                <strong>Extension ID</strong> — used only to connect the extension to your dashboard
                account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. Account data</h2>
            <p>
              When you sign in with Google or an email verification code, we store your email
              address and a credit balance (coins) to power our credit-based billing. Payment
              processing is handled by our payment providers; we do not store credit card numbers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. How data is used</h2>
            <p>We use your data solely to operate and improve the service:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To authenticate you and manage your credits.</li>
              <li>To display scrape history in your dashboard.</li>
              <li>To provide customer support.</li>
            </ul>
            <p className="mt-2">We do not sell or rent your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Data retention</h2>
            <p>
              Review data stored in your browser remains until you delete it or clear your browser
              data. Account data is retained while your account is active. You may delete your
              account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Third-party services</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Authentication:</strong> Google OAuth — see Google&apos;s privacy policy.</li>
              <li><strong>Payments:</strong> PayPal — see PayPal&apos;s privacy policy.</li>
              <li><strong>Email (optional):</strong> SendGrid for sending verification codes.</li>
              <li><strong>Hosting &amp; analytics:</strong> Vercel and Vercel Analytics.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Your rights</h2>
            <p>
              You may access, correct, export, or request deletion of your personal data. Contact us
              at support@retenzy.com and we will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Contact</h2>
            <p>
              Questions about this policy: <a className="text-primary underline" href="mailto:support@retenzy.com">support@retenzy.com</a>
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
