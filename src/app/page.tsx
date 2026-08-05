'use client'

import { useEffect } from 'react'
import EditorOverlay from '@/components/editor/EditorOverlay'
import { ColonyEventModal } from '@/components/game/events/ColonyEventModal'
import GameWorld from '@/components/game/world/GameWorld'
import { FeatureHub } from '@/components/integration/FeatureHub'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'
import { HelpModal } from '@/components/ui/HelpModal'
import { MainMenu } from '@/components/ui/MainMenu'
import { SettingsModal } from '@/components/ui/SettingsModal'
import { useColonyEvents } from '@/hooks/useColonyEvents'
import { useGameLoop } from '@/hooks/useGameLoop'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { createScreenReaderAnnouncer } from '@/utils/accessibilityUtils'
import { soundSystem } from '@/utils/soundSystem'

export default function Home() {
  useKeyboardShortcuts()
  useGameLoop(1000)
  useColonyEvents()

  useEffect(() => {
    soundSystem.init()
    // Mount the live-region node so announceToScreenReader() (used by
    // AccessibleButton) actually reaches assistive tech instead of no-op'ing.
    createScreenReaderAnnouncer()
  }, [])

  return (
    <main id="main" className="relative h-screen">
      <h1 className="sr-only">CodeCraft: Galactic Developer</h1>
      <GameWorld />
      <EditorOverlay />
      <MainMenu />
      <FeatureHub />
      <OnboardingFlow />
      <SettingsModal />
      <HelpModal />
      <ColonyEventModal />
    </main>
  )
}
