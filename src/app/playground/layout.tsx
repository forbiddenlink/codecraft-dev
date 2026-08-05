import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Playground',
  description:
    'Experiment with HTML, CSS, and JavaScript in the CodeCraft playground — no colony stakes, just live coding.',
  alternates: {
    canonical: '/playground',
  },
  openGraph: {
    title: 'CodeCraft Playground',
    description: 'Live HTML/CSS/JS playground for CodeCraft: Galactic Developer.',
    url: '/playground',
  },
}

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return children
}
