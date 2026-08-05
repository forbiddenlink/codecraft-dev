import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms for using CodeCraft: Galactic Developer.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-16">
      <article className="mx-auto max-w-2xl prose prose-invert">
        <p className="text-sm text-slate-400 mb-8">
          <Link href="/" className="underline hover:text-white">
            ← Back to CodeCraft
          </Link>
        </p>
        <h1>Terms of Service</h1>
        <p className="text-slate-400">Last updated: July 28, 2026</p>

        <p>
          By using CodeCraft: Galactic Developer, you agree to these terms. The product is provided
          for educational and entertainment purposes.
        </p>

        <h2>Acceptable use</h2>
        <ul>
          <li>Do not attempt to abuse multiplayer rooms, APIs, or shared infrastructure.</li>
          <li>Do not use the service to distribute malware or harass others.</li>
          <li>
            Respect rate limits and fair-use expectations on any hosted code-execution features.
          </li>
        </ul>

        <h2>Content & code you write</h2>
        <p>
          Code you enter in the editor stays in your browser session unless you opt into
          collaboration or cloud features. You retain ownership of your code; you grant us a limited
          license to process it as needed to run the game (validation, previews, optional
          collaboration).
        </p>

        <h2>Disclaimer</h2>
        <p>
          The service is provided &quot;as is&quot; without warranties. Learning outcomes are not
          guaranteed. We are not liable for data loss of local progress stored in your browser.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these terms. Continued use after changes constitutes acceptance of the
          updated terms.
        </p>
      </article>
    </main>
  )
}
