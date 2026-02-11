'use client';
import { useRef } from 'react';
import { Vector3 } from 'three';
import { Html } from '@react-three/drei';
import { ResourceType } from '@/utils/resourceManagement';

interface ResourceCollectorProps {
  position: [number, number, number];
  resource: ResourceType;
  collectionRadius: number;
}

const RESOURCE_DISPLAY: Record<ResourceType, { color: string; icon: string; name: string }> = {
  energy: { color: '#FFD700', icon: '⚡', name: 'Energy' },
  minerals: { color: '#8B4513', icon: '💎', name: 'Minerals' },
  water: { color: '#4169E1', icon: '💧', name: 'Water' },
  food: { color: '#32CD32', icon: '🌾', name: 'Food' },
  knowledge: { color: '#9370DB', icon: '📚', name: 'Knowledge' },
  bytes: { color: '#00CED1', icon: '💾', name: 'Bytes' }
};

export function ResourceCollector({ position, resource, collectionRadius = 5 }: ResourceCollectorProps) {
  const particles = useRef<Vector3[]>([]);
  const resourceDisplay = RESOURCE_DISPLAY[resource];

  return (
    <group position={position}>
      {/* Collector sphere */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={resourceDisplay.color} transparent opacity={0.8} />
      </mesh>

      {/* Collection area indicator */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[collectionRadius - 0.1, collectionRadius, 32]} />
        <meshBasicMaterial color={resourceDisplay.color} transparent opacity={0.2} />
      </mesh>

      {/* Resource info label */}
      <Html
        position={[0, 2 + Math.sin(Date.now() * 0.001) * 0.1, 0]}
        center
        style={{
          background: `rgba(0, 0, 0, 0.7)`,
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

      {/* Particle system for collection effect */}
      {particles.current.map((particle, index) => (
        <mesh key={index} position={particle.toArray()}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color={resourceDisplay.color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
} 