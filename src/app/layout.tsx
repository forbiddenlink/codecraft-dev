// File: /src/app/layout.tsx
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/store/Providers';
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PostHogProvider } from "@/components/PostHogProvider";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CodeCraft: Galactic Developer',
  description: 'Build your space colony by writing real code!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-space-black text-stellar-white`}>
        <Providers><PostHogProvider>{children}</PostHogProvider></Providers>
              <Analytics />
              <SpeedInsights />
      </body>
    </html>
  );
}