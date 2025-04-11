'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import { Vector3 } from 'three';

interface ResourceGenerator {
  id: string;
  position: [number, number, number];
  isActive: boolean;
  resources: Array<{
    resourceId: string;
    amount: number;
  }>;
}

interface ResourceGeneratorsProps {
  generators: ResourceGenerator[];
  showProductionEffects?: boolean;
}

const RESOURCE_COLORS = {
  energy: '#FFD700',
  code: '#4CAF50',
  data: '#2196F3',
  default: '#FFFFFF'
};

export default function ResourceGenerators({ 
  generators, 
  showProductionEffects = true 
}: ResourceGeneratorsProps) {
  const particlesRef = useRef<{ [key: string]: Vector3[] }>({});

  useFrame((state) => {
    if (!showProductionEffects) return;

    const time = state.clock.getElapsedTime();

    generators.forEach((generator) => {
      if (!generator.isActive) return;

      generator.resources.forEach((resource) => {
        const key = `${generator.id}-${resource.resourceId}`;
        if (!particlesRef.current[key]) {
          particlesRef.current[key] = [];
        }

        // Add new particles periodically
        if (Math.sin(time * 2) > 0.9) {
          const startPos = new Vector3(...generator.position);
          particlesRef.current[key].push(startPos.clone());
        }

        // Update particle positions
        particlesRef.current[key] = particlesRef.current[key].filter((particle) => {
          // Move particle upward with a spiral motion
          particle.y += 0.05;
          particle.x += Math.sin(time + particle.y) * 0.02;
          particle.z += Math.cos(time + particle.y) * 0.02;

          // Remove particles that have moved too far
          return particle.y < generator.position[1] + 5;
        });
      });
    });
  });

  return (
    <group>
      {generators.map((generator) =>
        generator.resources.map((resource) => {
          const key = `${generator.id}-${resource.resourceId}`;
          const color = RESOURCE_COLORS[resource.resourceId] || RESOURCE_COLORS.default;

          if (!generator.isActive || !showProductionEffects) return null;

          return (
            <group key={key}>
              {particlesRef.current[key]?.map((position, index) => (
                <Trail
                  key={`${key}-${index}`}
                  width={0.2}
                  length={5}
                  color={color}
                  attenuation={(t) => t * t}
                >
                  <mesh position={position}>
                    <sphereGeometry args={[0.05]} />
                    <meshBasicMaterial color={color} transparent opacity={0.8} />
                  </mesh>
                </Trail>
              ))}
            </group>
          );
        })
      )}
    </group>
  );
} 