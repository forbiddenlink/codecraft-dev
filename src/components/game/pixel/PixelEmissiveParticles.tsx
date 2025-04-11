'use client';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

/**
 * PixelEmissiveParticles Component
 * Creates a particle effect around Pixel that changes based on mood
 */

interface ParticleBehavior {
  speed: number;
  radius: number;
  variation: number;
  opacity: number;
  size: number;
  trail: number;
}

// Enhanced mood-based particle behaviors
const MOOD_PARTICLE_BEHAVIORS: Record<string, ParticleBehavior> = {
  happy: {
    speed: 0.8,
    radius: 0.6,
    variation: 0.2,
    opacity: 0.9,
    size: 0.06,
    trail: 0.95
  },
  curious: {
    speed: 1.2,
    radius: 0.8,
    variation: 0.3,
    opacity: 0.8,
    size: 0.05,
    trail: 0.9
  },
  excited: {
    speed: 1.5,
    radius: 0.7,
    variation: 0.4,
    opacity: 0.95,
    size: 0.07,
    trail: 0.85
  },
  concerned: {
    speed: 0.5,
    radius: 0.5,
    variation: 0.1,
    opacity: 0.7,
    size: 0.04,
    trail: 0.98
  },
  thinking: {
    speed: 0.6,
    radius: 0.6,
    variation: 0.2,
    opacity: 0.75,
    size: 0.045,
    trail: 0.93
  },
  neutral: {
    speed: 0.7,
    radius: 0.6,
    variation: 0.2,
    opacity: 0.8,
    size: 0.05,
    trail: 0.92
  }
};

export default function PixelEmissiveParticles({ 
  count = 20, 
  color = '#7C3AED', 
  mood = 'neutral', 
  isMoving = false 
}) {
  const particlesRef = useRef();
  const trailRef = useRef<Float32Array>();
  
  // Generate initial positions and trail data
  const [initialPositions, initialTrail] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const trail = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
      
      // Initialize trail positions
      trail[i3] = positions[i3];
      trail[i3 + 1] = positions[i3 + 1];
      trail[i3 + 2] = positions[i3 + 2];
    }
    
    return [positions, trail];
  }, [count]);
  
  // Store trail data in ref for animation
  useEffect(() => {
    trailRef.current = initialTrail;
  }, [initialTrail]);
  
  // Animate particles with trails
  useFrame((state) => {
    if (!particlesRef.current || !trailRef.current) return;
    
    const behavior = MOOD_PARTICLE_BEHAVIORS[mood];
    const positions = particlesRef.current.geometry.attributes.position;
    const trail = trailRef.current;
    const time = state.clock.getElapsedTime();
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Update trail positions with lerp
      trail[i3] = trail[i3] * behavior.trail + positions.array[i3] * (1 - behavior.trail);
      trail[i3 + 1] = trail[i3 + 1] * behavior.trail + positions.array[i3 + 1] * (1 - behavior.trail);
      trail[i3 + 2] = trail[i3 + 2] * behavior.trail + positions.array[i3 + 2] * (1 - behavior.trail);
      
      // Base animation with mood-based behavior
      const angle = (time * behavior.speed * (0.5 + Math.sin(i) * 0.5)) + (i * Math.PI * 2 / count);
      const particleRadius = behavior.radius * (1 + Math.sin(time + i) * behavior.variation);
      
      // Calculate new positions with noise
      positions.array[i3] = Math.sin(angle) * particleRadius + Math.sin(time * 2 + i) * 0.03;
      positions.array[i3 + 1] = Math.cos(i * 0.7 + time) * 0.1 + Math.sin(time * 1.5) * 0.05;
      positions.array[i3 + 2] = Math.cos(angle) * particleRadius + Math.cos(time * 2 + i) * 0.03;
      
      // Add movement-based effects
      if (isMoving) {
        const direction = new Vector3(
          positions.array[i3], 
          positions.array[i3 + 1], 
          positions.array[i3 + 2]
        ).normalize();
        
        const movementIntensity = behavior.speed * 0.04;
        positions.array[i3] += direction.x * Math.sin(time * 5) * movementIntensity;
        positions.array[i3 + 1] += direction.y * Math.sin(time * 5) * movementIntensity;
        positions.array[i3 + 2] += direction.z * Math.sin(time * 5) * movementIntensity;
      }
    }
    
    positions.needsUpdate = true;
  });
  
  return (
    <group>
      {/* Main particles */}
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
          size={MOOD_PARTICLE_BEHAVIORS[mood].size}
          color={color} 
          transparent 
          opacity={MOOD_PARTICLE_BEHAVIORS[mood].opacity}
          emissive={color}
          emissiveIntensity={1}
          depthWrite={false}
        />
      </points>
      
      {/* Particle trails */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={initialTrail}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial 
          size={MOOD_PARTICLE_BEHAVIORS[mood].size * 0.8}
          color={color} 
          transparent 
          opacity={MOOD_PARTICLE_BEHAVIORS[mood].opacity * 0.5}
          emissive={color}
          emissiveIntensity={0.5}
          depthWrite={false}
        />
      </points>
    </group>
  );
} 