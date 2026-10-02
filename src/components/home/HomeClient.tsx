'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
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
import { useAppSelector } from '@/store/hooks'
import { createScreenReaderAnnouncer } from '@/utils/accessibilityUtils'
import { soundSystem } from '@/utils/soundSystem'

// The editor pulls in Monaco glue plus the Liveblocks/Yjs presence client (~180 KB), so it is
// only fetched the first time the editor opens or a multiplayer session starts.
const EditorOverlay = dynamic(() => import('@/components/editor/EditorOverlay'), { ssr: false })

function LazyEditorOverlay() {
  const needed = useAppSelector((state) => state.editor.isVisible || state.multiplayer.isInSession)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (needed) setMounted(true)
  }, [needed])

  return mounted ? <EditorOverlay /> : null
}

export default function HomeClient() {
  useKeyboardShortcuts()
  useGameLoop(1000)
  useColonyEvents()

  useEffect(() => {
    soundSystem.init()
    // Mount the live-region node so announceToScreenReader() (used by
    // AccessibleButton) actually reaches assistive tech instead of no-op'ing.
    createScreenReaderAnnouncer()
    // Tells the server-rendered hero (StaticHero) that the real UI has taken over.
    document.documentElement.setAttribute('data-app-ready', '')
  }, [])

  return (
    <>
      <GameWorld />
      <LazyEditorOverlay />
      <MainMenu />
      <FeatureHub />
      <OnboardingFlow />
      <SettingsModal />
      <HelpModal />
      <ColonyEventModal />
    </>
  )
}
