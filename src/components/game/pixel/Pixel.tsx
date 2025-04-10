'use client';
import { Sphere } from '@react-three/drei';

export default function Pixel() {
  return (
    <Sphere position={[-2.5, 1.2, 0]} args={[0.3, 32, 32]}>
      <meshStandardMaterial color="hotpink" emissive="deeppink" emissiveIntensity={0.3} />
    </Sphere>
  );
}
