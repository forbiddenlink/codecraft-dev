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
        const defaultScale: [number, number, number] = el.width && el.height
          ? [el.width / 50, el.height / 50, 1]
          : [1, 1, 1];

        const position = el.position || [index * 2, 0.5, 0];
        const scale = el.scale || defaultScale;
        const rotation = el.rotation || [0, 0, 0];
        const opacity = el.opacity ?? 1;

        return (
          <Box
            key={index}
            position={position}
            scale={scale}
            rotation={rotation}
          >
            <meshStandardMaterial color={el.color} transparent opacity={opacity} />
          </Box>
        );
      })}

      <OrbitControls />
    </Canvas>
  );
}