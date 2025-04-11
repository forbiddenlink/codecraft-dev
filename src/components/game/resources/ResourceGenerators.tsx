'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail, Html } from '@react-three/drei';
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
  energy: '#FBBF24',
  minerals: '#3B82F6',
  water: '#1E3A8A',
  food: '#10B981',
  default: '#F8FAFC'
};

const RESOURCE_ICONS = {
  energy: '⚡',
  minerals: '💎',
  water: '💧',
  food: '🌾',
  default: '📦'
};

const RESOURCE_NAMES = {
  energy: 'Energy',
  minerals: 'Minerals',
  water: 'Water',
  food: 'Food',
  default: 'Resource'
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

        if (Math.sin(time * 2) > 0.9) {
          const startPos = new Vector3(...generator.position);
          particlesRef.current[key].push(startPos.clone());
        }

        particlesRef.current[key] = particlesRef.current[key].filter((particle) => {
          particle.y += 0.05;
          particle.x += Math.sin(time + particle.y) * 0.02;
          particle.z += Math.cos(time + particle.y) * 0.02;
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
          const icon = RESOURCE_ICONS[resource.resourceId] || RESOURCE_ICONS.default;
          const name = RESOURCE_NAMES[resource.resourceId] || RESOURCE_NAMES.default;

          if (!generator.isActive || !showProductionEffects) return null;

          return (
            <group key={key} position={generator.position}>
              {/* Resource Label */}
              <Html
                position={[0, 2, 0]}
                center
                occlude
                distanceFactor={8}
                sprite
                transform
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  pointerEvents: 'none',
                  width: 'auto',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                  backdropFilter: 'blur(4px)',
                  border: `1px solid ${color}40`,
                  boxShadow: `0 0 10px ${color}40`,
                }}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">{icon}</span>
                  <div className="flex flex-col items-center">
                    <span className="font-bold tracking-wide">{name}</span>
                    <span className="text-sm text-green-400 font-medium">Generator</span>
                  </div>
                </div>
              </Html>

              {/* Particle Effects */}
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