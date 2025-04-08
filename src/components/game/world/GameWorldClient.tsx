'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { useAppSelector } from '@/hooks/reduxHooks';
import { parseHtmlToGameObjects } from '@/utils/parseHtmlToGameObjects';
import { Box } from '@react-three/drei';
import React, { useState, useEffect, Suspense } from 'react';
import { validateCode } from '@/utils/validateCode';
import { challenges } from '@/data/challenges';

function HUDOverlay({ currentChallenge, challengePassed }: { 
  currentChallenge: typeof challenges[0], 
  challengePassed: boolean 
}) {
  return (
    <Html position={[0, 1.5, 0]} center distanceFactor={15}>
      <div style={{
        background: 'rgba(0,0,0,0.75)',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        color: 'white',
        fontFamily: 'monospace',
        maxWidth: '200px',
        wordWrap: 'break-word',
        textAlign: 'left',
        pointerEvents: 'none',
        fontSize: '12px',
      }}>
        <p><strong>Challenge:</strong><br />{currentChallenge.title}</p>
        <p>{currentChallenge.description}</p>
        <p>Status: {challengePassed ? '✅ Complete' : '🕐 In Progress'}</p>
      </div>
    </Html>
  );
}

export default function GameWorldClient() {
  const code = useAppSelector((state) => state.editor.currentCode);
  const elements = parseHtmlToGameObjects(code);
  const [challengePassed, setChallengePassed] = useState(false);
  const currentChallenge = challenges[0];

  useEffect(() => {
    const result = validateCode(code, currentChallenge);
    setChallengePassed(result);
  }, [code, currentChallenge]);

  return (
    <Canvas camera={{ position: [0, 2, 5], fov: 60 }} dpr={[1, 2]}>
      <Suspense fallback={null}>
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
          const color = el.color || 'royalblue';

          return (
            <Box
              key={index}
              position={position}
              scale={scale}
              rotation={rotation}
            >
              <meshStandardMaterial color={color} transparent opacity={opacity} />
            </Box>
          );
        })}

        <OrbitControls makeDefault />
        <HUDOverlay currentChallenge={currentChallenge} challengePassed={challengePassed} />
      </Suspense>
    </Canvas>
  );
} 