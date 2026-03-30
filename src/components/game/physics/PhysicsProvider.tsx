'use client';
import { ReactNode } from 'react';
import { Physics } from '@react-three/rapier';

interface PhysicsProviderProps {
  children: ReactNode;
  debug?: boolean;
  gravity?: [number, number, number];
}

/**
 * Physics provider using Rapier for high-performance physics simulation.
 * Wraps the 3D scene content with Rapier physics context.
 */
export default function PhysicsProvider({
  children,
  debug = false,
  gravity = [0, -9.81, 0]
}: PhysicsProviderProps) {
  return (
    <Physics gravity={gravity} debug={debug}>
      {children}
    </Physics>
  );
}
