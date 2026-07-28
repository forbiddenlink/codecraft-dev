'use client';

import { useEffect } from 'react';
import GameWorld from '@/components/game/world/GameWorld';
import EditorOverlay from '@/components/editor/EditorOverlay';
import { MainMenu } from '@/components/ui/MainMenu';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { HelpModal } from '@/components/ui/HelpModal';
import { FeatureHub } from '@/components/integration/FeatureHub';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { ColonyEventModal } from '@/components/game/events/ColonyEventModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useColonyEvents } from '@/hooks/useColonyEvents';
import { soundSystem } from '@/utils/soundSystem';

export default function Home() {
  useKeyboardShortcuts();
  useGameLoop(1000);
  useColonyEvents();

  useEffect(() => {
    soundSystem.init();
  }, []);

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
  );
}
