// File: /src/app/layout.tsx
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/store/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CodeCraft: Galactic Developer',
  description: 'Build your space colony by writing real code!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-space-black text-stellar-white`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}