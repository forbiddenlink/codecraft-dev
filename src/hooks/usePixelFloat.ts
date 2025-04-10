// File: /src/hooks/usePixelFloat.ts
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

export default function usePixelFloat(speed = 1.5, height = 0.2) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.position.y = 1.2 + Math.sin(t * speed) * height;
      ref.current.rotation.y = t * 0.5; // gentle idle spin
    }
  });

  return ref;
}
