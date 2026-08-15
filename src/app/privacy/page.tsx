import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How CodeCraft: Galactic Developer collects and uses data.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-16">
      <article className="mx-auto max-w-2xl prose prose-invert">
        <p className="text-sm text-slate-400 mb-8">
          <Link href="/" className="underline hover:text-white">
            ← Back to CodeCraft
          </Link>
        </p>
        <h1>Privacy Policy</h1>
        <p className="text-slate-400">Last updated: July 28, 2026</p>

        <p>
          CodeCraft: Galactic Developer (&quot;CodeCraft&quot;) is an educational coding game. This
          policy explains what data we process when you use the site.
        </p>

        <h2>What we store on your device</h2>
        <ul>
          <li>Challenge progress and completion IDs (localStorage)</li>
          <li>Optional username from onboarding</li>
          <li>Sound and onboarding preference flags</li>
        </ul>

        <h2>Analytics & error monitoring</h2>
        <p>
          When enabled via environment configuration, we may use Vercel Analytics, PostHog, and/or
          Sentry to understand product usage and diagnose errors. These tools may collect
          approximate location, device/browser info, and interaction events (for example challenge
          started/completed). Analytics are optional and can be disabled by the site operator.
        </p>

        <h2>Accounts</h2>
        <p>
          The current game loop does not require an account. Multiplayer and collaboration features
          may use third-party providers (for example Liveblocks) when those keys are configured.
        </p>

        <h2>Contact</h2>
        <p>
          Security reports:{' '}
          <a href="https://github.com/forbiddenlink/codecraft-dev/security/advisories/new">
            GitHub security advisories
          </a>
          . Product feedback: open an issue on the{' '}
          <a href="https://github.com/forbiddenlink/codecraft-dev">repository</a>.
        </p>
      </article>
    </main>
  )
}
