// File: /src/app/page.tsx
'use client';

import { useEffect } from 'react';
import GameWorld from '@/components/game/world/GameWorld';
import EditorOverlay from '@/components/editor/EditorOverlay';
import { MainMenu } from '@/components/ui/MainMenu';
import { FeatureHub } from '@/components/integration/FeatureHub';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useGameLoop } from '@/hooks/useGameLoop';
import { soundSystem } from '@/utils/soundSystem';

export default function Home() {
  // Initialize global keyboard shortcuts
  useKeyboardShortcuts();

  // Initialize game loop for resource generation (1 tick per second)
  useGameLoop(1000);

  // Initialize sound system
  useEffect(() => {
    soundSystem.init();
  }, []);

  return (
    <main className="relative h-screen">
      {/* 3D Game World */}
      <GameWorld />

      {/* Code Editor Overlay */}
      <EditorOverlay />

      {/* Main Menu Button & Panel */}
      <MainMenu />

      {/* Feature Integration Hub (Analytics, Achievements, Multiplayer, Dialogue) */}
      <FeatureHub />
    </main>
  );
}