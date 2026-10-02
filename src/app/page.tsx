import HomeClient from '@/components/home/HomeClient'
import { StaticHero } from '@/components/home/StaticHero'

export default function Home() {
  return (
    <main id="main" className="relative h-screen">
      <h1 className="sr-only">CodeCraft: Galactic Developer</h1>
      <StaticHero />
      <HomeClient />
    </main>
  )
}
