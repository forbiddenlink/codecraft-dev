// File: /src/components/game/celebrations/CelebrationSparkles.tsx
'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface CelebrationSparklesProps {
  position?: [number, number, number];
  type?: 'success' | 'levelUp' | 'achievement' | 'mastery' | 'streak';
  onComplete?: () => void;
}

const CELEBRATION_CONFIGS = {
  success: {
    count: 50,
    size: 2,
    color: '#22c55e',
    scale: [3, 3, 3] as [number, number, number],
    speed: 0.8,
    duration: 2000,
  },
  levelUp: {
    count: 150,
    size: 3,
    color: '#fbbf24',
    scale: [6, 6, 6] as [number, number, number],
    speed: 1.2,
    duration: 3000,
  },
  achievement: {
    count: 100,
    size: 2.5,
    color: '#a855f7',
    scale: [5, 5, 5] as [number, number, number],
    speed: 1,
    duration: 2500,
  },
  mastery: {
    count: 200,
    size: 3,
    color: '#f59e0b',
    scale: [8, 8, 8] as [number, number, number],
    speed: 1.5,
    duration: 4000,
  },
  streak: {
    count: 80,
    size: 2,
    color: '#ef4444',
    scale: [4, 4, 4] as [number, number, number],
    speed: 1,
    duration: 2000,
  },
};

export default function CelebrationSparkles({
  position = [0, 0, 0],
  type = 'success',
  onComplete,
}: CelebrationSparklesProps) {
  const [visible, setVisible] = useState(true);
  const [opacity, setOpacity] = useState(1);
  const config = CELEBRATION_CONFIGS[type];

  useEffect(() => {
    // Fade out near end
    const fadeTimer = setTimeout(() => {
      setOpacity(0);
    }, config.duration - 500);

    // Remove after duration
    const removeTimer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, config.duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [config.duration, onComplete]);

  if (!visible) return null;

  return (
    <group position={position}>
      <Sparkles
        count={config.count}
        size={config.size}
        color={config.color}
        scale={config.scale}
        speed={config.speed}
        opacity={opacity}
        noise={1}
      />
    </group>
  );
}

// Firework burst effect for bigger celebrations
interface FireworkBurstProps {
  position?: [number, number, number];
  color?: string;
  count?: number;
  onComplete?: () => void;
}

export function FireworkBurst({
  position = [0, 0, 0],
  color = '#fbbf24',
  count = 100,
  onComplete,
}: FireworkBurstProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const [elapsed, setElapsed] = useState(0);

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
      // Start from center
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Random velocity in sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = 0.05 + Math.random() * 0.1;

      velocities.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.sin(phi) * Math.sin(theta) * speed + 0.03, // upward bias
        Math.cos(phi) * speed
      ));
    }
    return { positions, velocities };
  }, [count]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;

    setElapsed(e => {
      const newElapsed = e + delta;
      if (newElapsed > 2.5) {
        onComplete?.();
      }
      return newElapsed;
    });

    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y - 0.002; // gravity
      pos[i * 3 + 2] += velocities[i].z;

      // Slow down over time
      velocities[i].multiplyScalar(0.98);
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (elapsed > 2.5) return null;

  return (
    <points ref={pointsRef} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color={color}
        transparent
        opacity={Math.max(0, 1 - elapsed / 2.5)}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
