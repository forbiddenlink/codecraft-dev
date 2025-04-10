'use client';
import { Sphere } from '@react-three/drei';
import usePixelFloat from '@/hooks/usePixelFloat';

export default function Pixel() {
  const ref = usePixelFloat(); // 🔁 floating + spinning animation

  return (
    <Sphere ref={ref} position={[-2.5, 1.2, 0]} args={[0.3, 32, 32]}>
      <meshStandardMaterial color="hotpink" emissive="deeppink" emissiveIntensity={0.3} />
    </Sphere>
  );
}
