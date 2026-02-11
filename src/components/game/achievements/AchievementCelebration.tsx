'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from '@react-spring/three';
import { Billboard, Text, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp: number;
  unlockedAt?: number;
}

interface AchievementCelebrationProps {
  achievement: Achievement | null;
  onComplete?: () => void;
}

// 3D Fireworks effect
function Fireworks({ position, color }: { position: [number, number, number]; color: string }) {
  const particlesRef = useRef<THREE.Points>(null);
  const [particles] = useState(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    const velocities = [];
    
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 0.05 + Math.random() * 0.05;
      
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      
      velocities.push({
        x: Math.cos(angle) * speed,
        y: Math.random() * 0.1,
        z: Math.sin(angle) * speed
      });
    }
    
    return { positions, velocities };
  });

  const [lifetime, setLifetime] = useState(0);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    
    setLifetime(l => l + delta);
    
    if (lifetime > 3) return; // Stop after 3 seconds
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length / 3; i++) {
      positions[i * 3] += particles.velocities[i].x;
      positions[i * 3 + 1] += particles.velocities[i].y - 0.002; // Gravity
      positions[i * 3 + 2] += particles.velocities[i].z;
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(particles.positions, 3));

  return (
    <points ref={particlesRef} position={position} geometry={geometry}>
      <pointsMaterial
        size={0.15}
        color={color}
        transparent
        opacity={Math.max(0, 1 - lifetime / 3)}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// 3D Achievement Badge
function AchievementBadge3D({ achievement }: { achievement: Achievement }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const rarityColors = {
    common: '#9ca3af',
    rare: '#3b82f6',
    epic: '#8b5cf6',
    legendary: '#f59e0b'
  };

  const color = rarityColors[achievement.rarity];

  const { scale, rotation } = useSpring({
    from: { scale: 0, rotation: 0 },
    to: { scale: 1, rotation: Math.PI * 2 },
    config: { tension: 200, friction: 20 }
  });

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.3;
    }
  });

  return (
    <animated.group ref={groupRef} scale={scale} rotation-y={rotation}>
      {/* Outer glow ring */}
      <mesh>
        <torusGeometry args={[1.5, 0.1, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Main badge sphere */}
      <Sphere args={[1, 32, 32]}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </Sphere>

      {/* Icon/Text */}
      <Billboard>
        <Text
          fontSize={0.8}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {achievement.icon}
        </Text>
      </Billboard>

      {/* Orbiting particles */}
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <Sphere
            key={i}
            args={[0.1]}
            position={[
              Math.cos(angle) * 2,
              Math.sin(angle) * 0.5,
              Math.sin(angle) * 2
            ]}
          >
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={1}
            />
          </Sphere>
        );
      })}

      {/* Fireworks */}
      <Fireworks position={[0, 0, 0]} color={color} />
      <Fireworks position={[2, 1, 0]} color={color} />
      <Fireworks position={[-2, 1, 0]} color={color} />
    </animated.group>
  );
}

// 2D UI Overlay
export function AchievementUI({ achievement, onComplete }: AchievementCelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (achievement) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement, onComplete]);

  if (!achievement) return null;

  const rarityColors = {
    common: 'from-gray-500 to-gray-700',
    rare: 'from-blue-500 to-blue-700',
    epic: 'from-purple-500 to-purple-700',
    legendary: 'from-yellow-500 to-orange-600'
  };

  const rarityLabels = {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary'
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Background overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Achievement card */}
          <motion.div
            className={`relative bg-gradient-to-br ${rarityColors[achievement.rarity]} p-8 rounded-2xl shadow-2xl max-w-md mx-4`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            {/* Sparkles */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 text-center">
              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-sm font-bold uppercase tracking-wider text-white/80 mb-2">
                  Achievement Unlocked!
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-4">
                  {rarityLabels[achievement.rarity]}
                </div>
              </motion.div>

              {/* Icon */}
              <motion.div
                className="text-6xl mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                {achievement.icon}
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-3xl font-bold text-white mb-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {achievement.title}
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-white/90 mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {achievement.description}
              </motion.p>

              {/* XP Reward */}
              <motion.div
                className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
              >
                <span className="text-2xl">⭐</span>
                <span className="text-white font-bold">+{achievement.xp} XP</span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// 3D Scene Component
export function AchievementCelebration3D({ achievement }: { achievement: Achievement | null }) {
  if (!achievement) return null;

  return (
    <group position={[0, 5, 0]}>
      <AchievementBadge3D achievement={achievement} />
      
      {/* Ambient lighting */}
      <pointLight position={[0, 0, 0]} intensity={2} distance={20} />
    </group>
  );
}

export default AchievementUI;

