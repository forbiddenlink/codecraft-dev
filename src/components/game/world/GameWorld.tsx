// File: /src/components/game/world/GameWorld.tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useAppSelector } from '@/hooks/reduxHooks';
import { Box } from '@react-three/drei';

export default function GameWorld() {
  const code = useAppSelector((state) => state.editor.currentCode);

  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {/* Basic placeholder: show cube when <div> exists in code */}
      {code.includes('<div') && (
        <Box position={[0, 0.5, 0]}>
          <meshStandardMaterial color='royalblue' />
        </Box>
      )}

      <OrbitControls />
    </Canvas>
  );
}