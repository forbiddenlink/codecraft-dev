'use client';
import { useRef } from 'react';
import { RigidBody, BallCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { ResourceType } from '@/utils/resourceManagement';

interface PhysicsResourceCollectorProps {
  position: [number, number, number];
  resource: ResourceType;
  collectionRadius?: number;
}

const RESOURCE_DISPLAY: Record<ResourceType, { color: string; icon: string; name: string }> = {
  energy: { color: '#FFD700', icon: '', name: 'Energy' },
  minerals: { color: '#8B4513', icon: '', name: 'Minerals' },
  water: { color: '#4169E1', icon: '', name: 'Water' },
  food: { color: '#32CD32', icon: '', name: 'Food' },
  knowledge: { color: '#9370DB', icon: '', name: 'Knowledge' },
  bytes: { color: '#00CED1', icon: '', name: 'Bytes' }
};

/**
 * Physics-enabled resource collector with Rapier collision detection.
 * Uses a ball collider for the main collector sphere.
 */
export default function PhysicsResourceCollector({
  position,
  resource,
  collectionRadius = 3.5
}: PhysicsResourceCollectorProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const meshRef = useRef<Mesh>(null);
  const resourceDisplay = RESOURCE_DISPLAY[resource];

  // Animate the collector with a subtle pulse
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(time * 2) * 0.05;
    meshRef.current.scale.set(pulse, pulse, pulse);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="fixed"
      position={position}
      colliders={false}
    >
      <BallCollider args={[0.5]} />

      {/* Main collector sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={resourceDisplay.color}
          emissive={resourceDisplay.color}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Collection area indicator (visual only, no physics) */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[collectionRadius - 0.1, collectionRadius, 32]} />
        <meshBasicMaterial color={resourceDisplay.color} transparent opacity={0.2} />
      </mesh>

      {/* Resource info label */}
      <Html
        position={[0, 1.5, 0]}
        center
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '4px 8px',
          borderRadius: '4px',
          border: `1px solid ${resourceDisplay.color}`,
          color: 'white',
          width: 'auto',
          whiteSpace: 'nowrap',
          textAlign: 'center',
          backdropFilter: 'blur(4px)',
          transform: 'scale(0.8)',
          userSelect: 'none',
          pointerEvents: 'none',
          textShadow: '0 0 2px rgba(0,0,0,0.5)',
          boxShadow: '0 0 5px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ fontSize: '1em', marginBottom: '2px' }}>
          {resourceDisplay.icon} {resourceDisplay.name}
        </div>
      </Html>
    </RigidBody>
  );
}
