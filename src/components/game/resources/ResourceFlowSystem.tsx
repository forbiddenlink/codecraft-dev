'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import { Vector3 } from 'three';

export interface ResourceFlow {
  from: [number, number, number];
  to: [number, number, number];
  resource: string;
  amount: number;
}

interface ResourceFlowSystemProps {
  flows: ResourceFlow[];
}

const RESOURCE_COLORS = {
  energy: '#FFD700',
  code: '#4CAF50',
  data: '#2196F3',
  default: '#FFFFFF'
};

export default function ResourceFlowSystem({ flows }: ResourceFlowSystemProps) {
  const particlesRef = useRef<{ [key: string]: Vector3 }>({});

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Update particle positions
    flows.forEach((flow, index) => {
      const particleKey = `${flow.resource}-${index}`;
      if (!particlesRef.current[particleKey]) {
        particlesRef.current[particleKey] = new Vector3(...flow.from);
      }

      const particle = particlesRef.current[particleKey];
      const target = new Vector3(...flow.to);
      
      // Calculate path progress (0 to 1)
      const progress = (Math.sin(time * 2 + index) + 1) / 2;
      
      // Lerp between from and to positions with a slight arc
      particle.lerp(target, 0.1);
      particle.y = flow.from[1] + Math.sin(progress * Math.PI) * 2; // Arc height

      // Reset particle when it reaches the target
      if (particle.distanceTo(target) < 0.1) {
        particle.set(...flow.from);
      }
    });
  });

  return (
    <group>
      {flows.map((flow, index) => (
        <Trail
          key={`${flow.resource}-${index}`}
          width={0.5}
          length={4}
          color={RESOURCE_COLORS[flow.resource] || RESOURCE_COLORS.default}
          attenuation={(t) => t * t}
        >
          <mesh position={particlesRef.current[`${flow.resource}-${index}`] || flow.from}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial
              color={RESOURCE_COLORS[flow.resource] || RESOURCE_COLORS.default}
              transparent
              opacity={0.8}
            />
          </mesh>
        </Trail>
      ))}
    </group>
  );
} 