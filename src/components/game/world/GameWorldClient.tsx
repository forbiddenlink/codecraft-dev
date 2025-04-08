// File: /src/components/game/world/GameWorldClient.tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, RoundedBox, Plane, Capsule, Sphere } from '@react-three/drei';
import { useAppSelector } from '@/hooks/reduxHooks';
import { parseHtmlToGameObjects } from '@/utils/parseHtmlToGameObjects';
import React, { useState, useEffect } from 'react';
import { validateCode } from '@/utils/validateCode';
import { challenges } from '@/data/challenges';

function HUDOverlay({ currentChallenge, challengePassed, onPrev, onNext, index }: {
  currentChallenge: typeof challenges[0],
  challengePassed: boolean,
  onPrev: () => void,
  onNext: () => void,
  index: number,
}) {
  return (
    <Html position={[0, 1.5, 0]} center distanceFactor={15}>
      <div style={{
        background: 'rgba(0,0,0,0.75)',
        padding: '0.75rem',
        borderRadius: '0.5rem',
        color: 'white',
        fontFamily: 'monospace',
        maxWidth: '220px',
        wordWrap: 'break-word',
        textAlign: 'left',
        fontSize: '12px',
      }}>
        <p><strong>Challenge {index + 1}:</strong><br />{currentChallenge.title}</p>
        <p>{currentChallenge.description}</p>
        <p>Status: {challengePassed ? '✅ Complete' : '🕐 In Progress'}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <button onClick={onPrev} style={{ background: '#333', color: 'white', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '12px' }}>⟵ Prev</button>
          <button onClick={onNext} style={{ background: '#333', color: 'white', border: 'none', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '12px' }}>Next ⟶</button>
        </div>
      </div>
    </Html>
  );
}

export default function GameWorldClient() {
  const code = useAppSelector((state) => state.editor.currentCode);
  const elements = parseHtmlToGameObjects(code);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const currentChallenge = challenges[challengeIndex];
  const [challengePassed, setChallengePassed] = useState(false);

  useEffect(() => {
    const result = validateCode(code, currentChallenge);
    setChallengePassed(result);
  }, [code, currentChallenge]);

  const handlePrev = () => setChallengeIndex((i) => (i > 0 ? i - 1 : i));
  const handleNext = () => setChallengeIndex((i) => (i < challenges.length - 1 ? i + 1 : i));

  function renderShape(tag: string, index: number, position: [number, number, number], scale: [number, number, number], rotation: [number, number, number], color: string, opacity: number) {
    switch (tag) {
      case 'header':
        return (
          <RoundedBox key={index} position={position} scale={scale} rotation={rotation} radius={0.2} smoothness={4}>
            <meshStandardMaterial color={color} transparent opacity={opacity} />
          </RoundedBox>
        );
      case 'section':
        return (
          <Capsule key={index} position={position} scale={scale} rotation={rotation}>
            <meshStandardMaterial color={color} transparent opacity={opacity} />
          </Capsule>
        );
      case 'footer':
        return (
          <Plane key={index} position={position} scale={scale} rotation={rotation}>
            <meshStandardMaterial color={color} transparent opacity={opacity} />
          </Plane>
        );
      case 'article':
        return (
          <Sphere key={index} position={position} scale={scale} rotation={rotation}>
            <meshStandardMaterial color={color} transparent opacity={opacity} />
          </Sphere>
        );
      default:
        return (
          <RoundedBox key={index} position={position} scale={scale} rotation={rotation} radius={0.1}>
            <meshStandardMaterial color={color} transparent opacity={opacity} />
          </RoundedBox>
        );
    }
  }

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
        const color = el.color || 'royalblue';

        return renderShape(el.tag, index, position, scale, rotation, color, opacity);
      })}

      <OrbitControls />
      <HUDOverlay 
        currentChallenge={currentChallenge} 
        challengePassed={challengePassed} 
        onPrev={handlePrev} 
        onNext={handleNext} 
        index={challengeIndex} 
      />
    </Canvas>
  );
}
