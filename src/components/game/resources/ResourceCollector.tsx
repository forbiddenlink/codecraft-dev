'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail, Html, Sphere } from '@react-three/drei';
import { Group, Vector3, MeshStandardMaterial } from 'three';
import { animated, useSpring } from '@react-spring/three';
import { Resource } from '@/types/resources';

interface ResourceCollectorProps {
  resource: Resource;
  position: [number, number, number];
  collectionRadius: number;
  collectionAmount: number;
}

const AnimatedSphere = animated(Sphere);

export default function ResourceCollector({
  resource,
  position,
  collectionRadius,
  collectionAmount,
}: ResourceCollectorProps) {
  const collectorRef = useRef<Group>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);
  const particlesRef = useRef<Group>(null);
  const collectionTime = useRef(0);
  const particles = useRef<Vector3[]>([]);

  // Animation springs
  const { scale } = useSpring({
    scale: 1,
    config: { tension: 170, friction: 26 },
  });

  useFrame((state, delta) => {
    if (!collectorRef.current || !particlesRef.current) return;

    // Rotate collector
    collectorRef.current.rotation.y += delta * 0.5;

    // Pulse effect
    if (materialRef.current) {
      const time = state.clock.getElapsedTime();
      materialRef.current.emissiveIntensity = 0.5 + Math.sin(time * 2) * 0.2;
    }

    // Update collection particles
    collectionTime.current += delta;
    if (collectionTime.current >= 0.5) {
      collectionTime.current = 0;
      // Add new particle
      particles.current.push(
        new Vector3(
          Math.random() * collectionRadius * 2 - collectionRadius,
          Math.random() * 2 + 1,
          Math.random() * collectionRadius * 2 - collectionRadius
        )
      );
    }

    // Animate particles
    particles.current.forEach((particle, i) => {
      // Move particle towards collector
      particle.lerp(new Vector3(0, 1, 0), 0.1);
      // Remove particle if too close
      if (particle.length() < 0.5) {
        particles.current.splice(i, 1);
      }
    });
  });

  return (
    <group position={position}>
      {/* Collector base */}
      <animated.group ref={collectorRef} scale={scale}>
        <AnimatedSphere args={[0.5, 32, 32]}>
          <meshStandardMaterial
            ref={materialRef}
            color={resource.color}
            emissive={resource.color}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </AnimatedSphere>
        
        {/* Collection area indicator */}
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[collectionRadius - 0.1, collectionRadius, 32]} />
          <meshBasicMaterial 
            color={resource.color} 
            transparent 
            opacity={0.2} 
          />
        </mesh>

        {/* Resource effect trail */}
        <Trail
          width={0.5}
          length={5}
          color={resource.color}
          attenuation={(t) => t * t}
        >
          <mesh visible={false}>
            <sphereGeometry args={[0.1]} />
          </mesh>
        </Trail>
      </animated.group>

      {/* Collection particles */}
      <group ref={particlesRef}>
        {particles.current.map((pos, i) => (
          <mesh key={i} position={pos.toArray()}>
            <sphereGeometry args={[0.05]} />
            <meshBasicMaterial color={resource.color} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>

      {/* Resource info */}
      <Html
        position={[0, 2, 0]}
        center
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: '4px 8px',
          borderRadius: '4px',
          color: 'white',
          fontSize: '12px',
          pointerEvents: 'none',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{resource.icon}</span>
          <div className="flex flex-col">
            <span className="font-medium">{resource.name}</span>
            <span className="text-sm text-green-400">+{collectionAmount}/s</span>
          </div>
        </div>
      </Html>
    </group>
  );
} 