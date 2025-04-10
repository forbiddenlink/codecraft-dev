// File: /src/app/page.tsx
import GameWorld from '@/components/game/world/GameWorld';
import EditorOverlay from '@/components/editor/EditorOverlay';

export default function Home() {
  return (
    <main className="relative h-screen">
      <GameWorld />
      <EditorOverlay />
    </main>
  );
}