// File: /src/app/layout.tsx
import '@/styles/globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/store/Providers';
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PostHogProvider } from "@/components/PostHogProvider";

const inter = Inter({ subsets: ['latin'] });

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://codecraft-dev.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'CodeCraft: Galactic Developer',
    template: '%s | CodeCraft',
  },
  description: 'Build your space colony by writing real HTML, CSS, and JavaScript.',
  applicationName: 'CodeCraft: Galactic Developer',
  manifest: '/manifest.json',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'CodeCraft: Galactic Developer',
    title: 'CodeCraft: Galactic Developer',
    description: 'Build your space colony by writing real HTML, CSS, and JavaScript.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeCraft: Galactic Developer',
    description: 'Build your space colony by writing real HTML, CSS, and JavaScript.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4F46E5' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CodeCraft: Galactic Developer',
    url: siteUrl,
    description: 'Educational coding game where you build a space colony by writing real HTML, CSS, and JavaScript.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
  };

  return (
    <html lang="en">
      <body className={`${inter.className} bg-space-black text-stellar-white`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black"
        >
          Skip to content
        </a>
        <Providers>
          <PostHogProvider>
            <div id="main-content">{children}</div>
          </PostHogProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
