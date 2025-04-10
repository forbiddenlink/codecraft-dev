'use client';
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import { useAppDispatch } from '@/hooks/reduxHooks';
import { updateResource } from '@/store/slices/resourceSlice';
import { Resource } from '@/store/slices/resourceSlice';
import * as THREE from 'three';

interface ResourceCollectorProps {
  resource: Resource;
  position: [number, number, number];
  collectionRadius?: number;
  collectionAmount?: number;
  pulseSpeed?: number;
}

export default function ResourceCollector({
  resource,
  position,
  collectionRadius = 3,
  collectionAmount = 5,
  pulseSpeed = 1
}: ResourceCollectorProps) {
  const dispatch = useAppDispatch();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const sphereRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const lastCollectionTime = useRef(0);
  const collectionCooldown = 1000; // 1 second cooldown

  // Create particle system
  const particles = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const particleCount = 20;
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 1] = (Math.random() - 0.5) * 0.5;
      positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
      
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = Math.random() * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    return geometry;
  }, []);

  useFrame((state) => {
    if (!sphereRef.current || !pulseRef.current || !particlesRef.current) return;

    // Floating animation
    sphereRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;

    // Pulse effect
    const scale = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.1;
    sphereRef.current.scale.set(scale, scale, scale);

    // Outer pulse ring
    pulseRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * pulseSpeed * 0.5) * 0.2);
    pulseRef.current.material.opacity = (1 + Math.sin(state.clock.elapsedTime * pulseSpeed)) * 0.2;

    // Update particles
    if (collecting) {
      const positions = particles.attributes.position.array as Float32Array;
      const velocities = particles.attributes.velocity.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i];
        positions[i + 1] += velocities[i + 1];
        positions[i + 2] += velocities[i + 2];
        
        // Reset particles that go too far
        if (Math.abs(positions[i + 1]) > 2) {
          positions[i] = (Math.random() - 0.5) * 0.5;
          positions[i + 1] = -0.5;
          positions[i + 2] = (Math.random() - 0.5) * 0.5;
        }
      }
      
      particles.attributes.position.needsUpdate = true;
    }

    // Check player distance and collect resources
    if (active) {
      const now = Date.now();
      if (now - lastCollectionTime.current >= collectionCooldown) {
        dispatch(updateResource({ id: resource.id, amount: collectionAmount }));
        setCollecting(true);
        setTimeout(() => setCollecting(false), 200);
        lastCollectionTime.current = now;
        
        // Play collection sound
        const audio = new Audio('/sounds/collect.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {}); // Ignore autoplay restrictions
      }
    }
  });

  const cooldownProgress = Math.min(
    (Date.now() - lastCollectionTime.current) / collectionCooldown,
    1
  );

  return (
    <group position={position}>
      {/* Main collector sphere */}
      <Sphere ref={sphereRef} args={[0.5, 32, 32]}>
        <meshStandardMaterial
          color={resource.color}
          emissive={resource.color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          transparent
          opacity={0.8}
        />
      </Sphere>

      {/* Outer pulse ring */}
      <Sphere ref={pulseRef} args={[0.6, 32, 32]}>
        <meshStandardMaterial
          color={resource.color}
          transparent
          opacity={0.2}
          wireframe
        />
      </Sphere>

      {/* Particle system */}
      <points ref={particlesRef} geometry={particles}>
        <pointsMaterial
          size={0.1}
          color={resource.color}
          transparent
          opacity={collecting ? 0.8 : 0}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Resource icon */}
      <Html
        position={[0, 1.2, 0]}
        center
        style={{
          fontSize: '24px',
          transition: 'transform 0.2s',
          transform: hovered ? 'scale(1.2)' : 'scale(1)',
        }}
      >
        <div style={{ position: 'relative' }}>
          {resource.icon}
          {active && (
            <div
              style={{
                position: 'absolute',
                bottom: '-20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '30px',
                height: '3px',
                background: '#1a1a1a',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${cooldownProgress * 100}%`,
                  height: '100%',
                  background: resource.color,
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
          )}
        </div>
      </Html>

      {/* Interaction sphere (invisible) */}
      <Sphere
        args={[collectionRadius, 8, 8]}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => {
          setHovered(false);
          setActive(false);
        }}
        onPointerDown={() => setActive(true)}
        onPointerUp={() => setActive(false)}
      >
        <meshBasicMaterial visible={false} />
      </Sphere>

      {/* Collection radius indicator (only visible when hovered) */}
      {hovered && (
        <Sphere args={[collectionRadius, 16, 16]}>
          <meshBasicMaterial
            color={resource.color}
            transparent
            opacity={0.1}
            wireframe
          />
        </Sphere>
      )}
    </group>
  );
} 