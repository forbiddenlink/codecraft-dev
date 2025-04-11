'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

interface WeatherSystemProps {
  currentWeather: 'clear' | 'cloudy' | 'stormy' | 'foggy';
  intensity: number;
}

export default function WeatherSystem({ currentWeather, intensity }: WeatherSystemProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 1000;

  // Generate random positions for particles
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;     // x
    positions[i * 3 + 1] = Math.random() * 30 + 10;    // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // z
  }

  // Animation spring for weather transitions
  const { opacity, size } = useSpring({
    opacity: currentWeather === 'clear' ? 0 : intensity,
    size: currentWeather === 'stormy' ? 0.2 : 0.1,
    config: { tension: 120, friction: 14 }
  });

  useFrame((state) => {
    if (!particlesRef.current) return;

    // Animate particles based on weather type
    const particles = particlesRef.current;
    const positions = particles.geometry.attributes.position.array as Float32Array;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Different movement patterns for different weather types
      switch (currentWeather) {
        case 'stormy':
          positions[i3 + 1] -= 0.2 * intensity; // Fall faster
          positions[i3] += Math.sin(time + i) * 0.02; // Sway
          break;
        case 'cloudy':
          positions[i3] += Math.sin(time * 0.1 + i) * 0.01;
          positions[i3 + 2] += Math.cos(time * 0.1 + i) * 0.01;
          break;
        case 'foggy':
          positions[i3] += Math.sin(time * 0.05 + i) * 0.005;
          positions[i3 + 2] += Math.cos(time * 0.05 + i) * 0.005;
          break;
      }

      // Reset particles that fall below ground
      if (positions[i3 + 1] < 0) {
        positions[i3 + 1] = 30;
      }
    }

    particles.geometry.attributes.position.needsUpdate = true;
  });

  if (currentWeather === 'clear') return null;

  return (
    <Points ref={particlesRef}>
      <animated.pointsMaterial
        transparent
        size={size}
        sizeAttenuation
        depthWrite={false}
        opacity={opacity}
        color={currentWeather === 'stormy' ? '#8395a7' : '#ffffff'}
      />
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
    </Points>
  );
} 