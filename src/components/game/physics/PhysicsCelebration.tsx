'use client';
import { useRef, useMemo, useState, useEffect } from 'react';
import { RigidBody, BallCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PhysicsParticle {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  color: string;
  size: number;
}

interface PhysicsCelebrationProps {
  position?: [number, number, number];
  type?: 'success' | 'levelUp' | 'achievement' | 'mastery' | 'streak';
  particleCount?: number;
  onComplete?: () => void;
}

const CELEBRATION_CONFIGS = {
  success: {
    count: 20,
    colors: ['#22c55e', '#10b981', '#34d399'],
    speed: 8,
    duration: 3000,
  },
  levelUp: {
    count: 40,
    colors: ['#fbbf24', '#f59e0b', '#fcd34d'],
    speed: 12,
    duration: 4000,
  },
  achievement: {
    count: 30,
    colors: ['#a855f7', '#8b5cf6', '#c084fc'],
    speed: 10,
    duration: 3500,
  },
  mastery: {
    count: 50,
    colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#f97316'],
    speed: 15,
    duration: 5000,
  },
  streak: {
    count: 25,
    colors: ['#ef4444', '#f87171', '#dc2626'],
    speed: 10,
    duration: 3000,
  },
};

/**
 * Physics-based celebration particles using Rapier.
 * Spawns particles that explode outward and fall with gravity.
 */
export default function PhysicsCelebration({
  position = [0, 0, 0],
  type = 'success',
  particleCount,
  onComplete,
}: PhysicsCelebrationProps) {
  const [visible, setVisible] = useState(true);
  const config = CELEBRATION_CONFIGS[type];
  const count = particleCount || config.count;

  // Generate initial particles with random velocities
  const particles = useMemo<PhysicsParticle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = config.speed * (0.5 + Math.random() * 0.5);

      return {
        id: i,
        position: [0, 0, 0] as [number, number, number],
        velocity: [
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.abs(Math.sin(phi) * Math.sin(theta) * speed) + 5, // upward bias
          Math.cos(phi) * speed,
        ] as [number, number, number],
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        size: 0.1 + Math.random() * 0.15,
      };
    });
  }, [count, config]);

  // Auto-hide after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, config.duration);

    return () => clearTimeout(timer);
  }, [config.duration, onComplete]);

  if (!visible) return null;

  return (
    <group position={position}>
      {particles.map((particle) => (
        <PhysicsParticle
          key={particle.id}
          initialVelocity={particle.velocity}
          color={particle.color}
          size={particle.size}
        />
      ))}
    </group>
  );
}

interface PhysicsParticleProps {
  initialVelocity: [number, number, number];
  color: string;
  size: number;
}

function PhysicsParticle({ initialVelocity, color, size }: PhysicsParticleProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [opacity, setOpacity] = useState(1);

  // Apply initial impulse on mount
  useEffect(() => {
    if (rigidBodyRef.current) {
      rigidBodyRef.current.applyImpulse(
        { x: initialVelocity[0], y: initialVelocity[1], z: initialVelocity[2] },
        true
      );
    }
  }, [initialVelocity]);

  // Fade out over time
  useFrame((state, delta) => {
    setOpacity((prev) => Math.max(0, prev - delta * 0.3));
  });

  if (opacity <= 0) return null;

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      colliders={false}
      mass={0.1}
      linearDamping={0.5}
      angularDamping={0.5}
      restitution={0.6}
    >
      <BallCollider args={[size / 2]} />
      <mesh>
        <sphereGeometry args={[size, 8, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>
    </RigidBody>
  );
}
