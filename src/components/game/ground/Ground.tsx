'use client';
import { Plane } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';

interface GroundProps {
  onClick: (event: ThreeEvent<MouseEvent>) => void;
}

export default function Ground({ onClick }: GroundProps) {
  return (
    <Plane
      args={[100, 100]}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.1, 0]}
      receiveShadow
      name="ground"
      onClick={onClick}
    >
      <meshStandardMaterial
        color="#1a1a1a"
        roughness={0.8}
        metalness={0.3}
        envMapIntensity={0.2}
      />
    </Plane>
  );
} 