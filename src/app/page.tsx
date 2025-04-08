// File: /src/app/page.tsx
import MonacoEditor from '@/components/editor/MonacoEditor';
import GameWorld from '@/components/game/world/GameWorld';

export default function Home() {
  return (
    <main className="flex h-screen">
      <div className="w-1/2 h-full border-r border-lunar-surface">
        <MonacoEditor />
      </div>
      <div className="w-1/2 h-full">
        <GameWorld />
      </div>
    </main>
  );
}