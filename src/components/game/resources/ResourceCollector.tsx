'use client';
import { useRef } from 'react';
import { Group, Vector3, MeshStandardMaterial } from 'three';
import { Html } from '@react-three/drei';
import { ResourceType } from '../../../types/resources';

interface ResourceCollectorProps {
  position: [number, number, number];
  resource: ResourceType;
  collectionRadius: number;
}

export function ResourceCollector({ position, resource, collectionRadius }: ResourceCollectorProps) {
  const collectorRef = useRef<Group>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const particlesRef = useRef<Vector3[]>([]);
  const collectionTime = useRef(0);
  const particles = useRef<Vector3[]>([]);

  return (
    <group position={position}>
      {/* Collector sphere */}
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color={resource.color} transparent opacity={0.8} />
      </mesh>

      {/* Collection area indicator */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[collectionRadius - 0.1, collectionRadius, 32]} />
        <meshBasicMaterial color={resource.color} transparent opacity={0.2} />
      </mesh>

      {/* Resource info label */}
      <Html
        position={[0, 2 + Math.sin(Date.now() * 0.001) * 0.1, 0]}
        center
        style={{
          background: `rgba(0, 0, 0, 0.7)`,
          padding: '4px 8px',
          borderRadius: '4px',
          border: `1px solid ${resource.color}`,
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
          {resource.icon} {resource.name}
        </div>
        <div style={{ fontSize: '0.8em', opacity: 0.9 }}>
          {Math.floor(resource.amount)} (+{resource.generationRate.toFixed(1)}/s)
        </div>
      </Html>

      {/* Particle system for collection effect */}
      {particles.current.map((particle, index) => (
        <mesh key={index} position={particle.toArray()}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color={resource.color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
} 