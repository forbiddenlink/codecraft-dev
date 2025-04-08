// File: /src/components/game/world/GameWorld.tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useAppSelector } from '@/hooks/reduxHooks';
import { parseHtmlToGameObjects } from '@/utils/parseHtmlToGameObjects';
import { Box } from '@react-three/drei';
import React from 'react';

export default function GameWorld() {
  const code = useAppSelector((state) => state.editor.currentCode);
  const elements = parseHtmlToGameObjects(code);

  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {elements.map((el, index) => {
        const posX = index * 2;
        return (
          <Box key={index} position={[posX, 0.5, 0]}>
            <meshStandardMaterial color={el.color} />
          </Box>
        );
      })}

      <OrbitControls />
    </Canvas>
  );
}