// File: /src/components/game/world/GameWorld.tsx
'use client';
import dynamic from 'next/dynamic';

const GameWorldClient = dynamic(() => import('./GameWorldClient'), { ssr: false });

export default function GameWorld() {
  return <GameWorldClient />;
}