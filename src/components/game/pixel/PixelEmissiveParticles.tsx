'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

/**
 * PixelEmissiveParticles Component
 * Creates a particle effect around Pixel that changes based on mood
 */
export default function PixelEmissiveParticles({ count = 20, color = '#7C3AED', mood = 'neutral', isMoving = false }) {
  const particlesRef = useRef();
  
  // Generate initial positions for particles
  const initialPositions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    
    return positions;
  }, [count]);
  
  // Animation settings based on mood
  const animationParams = useMemo(() => {
    switch (mood) {
      case 'happy':
        return { speed: 0.8, radius: 0.6, variation: 0.2 };
      case 'curious':
        return { speed: 1.2, radius: 0.8, variation: 0.3 };
      case 'excited':
        return { speed: 1.5, radius: 0.7, variation: 0.4 };
      case 'concerned':
        return { speed: 0.5, radius: 0.5, variation: 0.1 };
      default:
        return { speed: 0.7, radius: 0.6, variation: 0.2 };
    }
  }, [mood]);
  
  // Animate particles
  useFrame((state) => {
    if (!particlesRef.current) return;
    
    const { speed, radius, variation } = animationParams;
    const positions = particlesRef.current.geometry.attributes.position;
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Base animation - orbital motion with individual variations
      const angle = (time * speed * (0.5 + Math.sin(i) * 0.5)) + (i * Math.PI * 2 / count);
      const particleRadius = radius * (1 + Math.sin(time + i) * variation);
      
      // Calculate new positions with some noise for natural movement
      positions.array[i3] = Math.sin(angle) * particleRadius + Math.sin(time * 2 + i) * 0.03;
      positions.array[i3 + 1] = Math.cos(i * 0.7 + time) * 0.1 + Math.sin(time * 1.5) * 0.05;
      positions.array[i3 + 2] = Math.cos(angle) * particleRadius + Math.cos(time * 2 + i) * 0.03;
      
      // Add extra movement when Pixel is moving
      if (isMoving) {
        const direction = new Vector3(
          positions.array[i3], 
          positions.array[i3 + 1], 
          positions.array[i3 + 2]
        ).normalize();
        
        positions.array[i3] += direction.x * Math.sin(time * 5) * 0.02;
        positions.array[i3 + 1] += direction.y * Math.sin(time * 5) * 0.02;
        positions.array[i3 + 2] += direction.z * Math.sin(time * 5) * 0.02;
      }
    }
    
    positions.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={initialPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color={color} 
        transparent 
        opacity={0.8}
        emissive={color}
        emissiveIntensity={1}
      />
    </points>
  );
} 