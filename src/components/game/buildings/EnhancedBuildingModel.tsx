'use client';
import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';
import { Text, Sphere, Box, Cylinder, Cone, Sparkles, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface BuildingModelProps {
  type: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  isActive?: boolean;
  level?: number;
  onClick?: () => void;
  onHover?: (hovered: boolean) => void;
}

const AnimatedGroup = animated.group;
const AnimatedMesh = animated.mesh;

// Energy Generator Building
function EnergyGenerator({ isActive, level = 1 }: { isActive?: boolean; level?: number }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((_state) => {
    if (isActive && coreRef.current) {
      coreRef.current.rotation.y += 0.02;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.y += isActive ? 0.01 : 0.002;
    }
  });

  const { glowIntensity } = useSpring({
    glowIntensity: isActive ? 1.5 : 0.3,
    config: { tension: 200, friction: 20 }
  });

  return (
    <group>
      {/* Base platform */}
      <Cylinder args={[2, 2.5, 0.5, 8]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.2} />
      </Cylinder>

      {/* Main tower */}
      <Cylinder args={[1, 1.2, 4, 8]} position={[0, 2.5, 0]}>
        <meshStandardMaterial 
          color="#3b82f6" 
          metalness={0.6} 
          roughness={0.3}
          emissive="#3b82f6"
          emissiveIntensity={isActive ? 0.3 : 0.1}
        />
      </Cylinder>

      {/* Energy core */}
      <Sphere ref={coreRef} args={[0.8, 32, 32]} position={[0, 5, 0]}>
        <AnimatedMesh>
          <animated.meshStandardMaterial
            color="#60a5fa"
            metalness={0.9}
            roughness={0.1}
            emissive="#60a5fa"
            emissiveIntensity={glowIntensity}
          />
        </AnimatedMesh>
      </Sphere>

      {/* Rotating rings */}
      <group ref={ringsRef} position={[0, 5, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            rotation={[Math.PI / 2 + (i * Math.PI / 6), 0, 0]}
            position={[
              Math.cos(i * Math.PI * 2 / 3) * 1.5,
              0,
              Math.sin(i * Math.PI * 2 / 3) * 1.5
            ]}
          >
            <torusGeometry args={[1.2, 0.05, 16, 100]} />
            <meshStandardMaterial
              color="#93c5fd"
              emissive="#60a5fa"
              emissiveIntensity={isActive ? 0.5 : 0.2}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Energy particles */}
      {isActive && (
        <EnergyParticles count={20} radius={2} height={6} />
      )}

      {/* Level indicator */}
      {level > 1 && (
        <Text
          position={[0, 6, 0]}
          fontSize={0.5}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
        >
          Lv.{level}
        </Text>
      )}

      {/* Point light */}
      {isActive && (
        <pointLight
          position={[0, 5, 0]}
          intensity={2}
          distance={10}
          color="#60a5fa"
        />
      )}
    </group>
  );
}

// Resource Collector Building
function ResourceCollector({ isActive }: { isActive?: boolean; level?: number }) {
  const drillRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (drillRef.current && isActive) {
      drillRef.current.rotation.y += 0.05;
      drillRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.3;
    }
  });

  return (
    <group>
      {/* Base */}
      <Box args={[3, 0.5, 3]} position={[0, 0.25, 0]}>
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </Box>

      {/* Support legs */}
      {[-1, 1].map((x) =>
        [-1, 1].map((z) => (
          <Cylinder
            key={`${x}-${z}`}
            args={[0.2, 0.3, 2, 8]}
            position={[x * 1.2, 1, z * 1.2]}
          >
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </Cylinder>
        ))
      )}

      {/* Drill mechanism */}
      <group ref={drillRef} position={[0, 2, 0]}>
        {/* Drill bit */}
        <Cone args={[0.5, 2, 8]} position={[0, -1, 0]} rotation={[Math.PI, 0, 0]}>
          <meshStandardMaterial
            color="#10b981"
            metalness={0.9}
            roughness={0.2}
            emissive="#10b981"
            emissiveIntensity={isActive ? 0.5 : 0.1}
          />
        </Cone>

        {/* Drill shaft */}
        <Cylinder args={[0.3, 0.3, 1.5, 8]} position={[0, 0.5, 0]}>
          <meshStandardMaterial color="#22c55e" metalness={0.8} roughness={0.3} />
        </Cylinder>
      </group>

      {/* Collection indicator */}
      {isActive && (
        <group position={[0, 3, 0]}>
          <Sphere args={[0.3, 16, 16]}>
            <meshStandardMaterial
              color="#34d399"
              emissive="#10b981"
              emissiveIntensity={1}
              transparent
              opacity={0.6}
            />
          </Sphere>
        </group>
      )}

      {/* Resource flow effect */}
      {isActive && <ResourceFlowEffect />}
    </group>
  );
}

// Living Quarters Building
function LivingQuarters({}: { level?: number }) {
  const [lightsOn, setLightsOn] = useState(true);

  useFrame(() => {
    // Flickering window lights
    if (Math.random() > 0.98) {
      setLightsOn(l => !l);
    }
  });

  return (
    <group>
      {/* Main structure */}
      <Box args={[4, 3, 3]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#475569" metalness={0.3} roughness={0.7} />
      </Box>

      {/* Roof */}
      <Cone args={[3, 1.5, 4]} position={[0, 3.75, 0]}>
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.5} />
      </Cone>

      {/* Windows with lights */}
      {[-1, 1].map((x) =>
        [0.5, 1.5].map((y, i) => (
          <group key={`${x}-${i}`} position={[x * 1.5, y, 1.51]}>
            <Box args={[0.6, 0.6, 0.05]}>
              <meshStandardMaterial
                color={lightsOn ? "#fbbf24" : "#78350f"}
                emissive="#fbbf24"
                emissiveIntensity={lightsOn ? 0.8 : 0.1}
              />
            </Box>
          </group>
        ))
      )}

      {/* Door */}
      <Box args={[0.8, 1.2, 0.1]} position={[0, 0.6, 1.51]}>
        <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
      </Box>

      {/* Chimney */}
      <Cylinder args={[0.2, 0.2, 1, 8]} position={[1, 5, 0]}>
        <meshStandardMaterial color="#334155" />
      </Cylinder>

      {/* Smoke particles */}
      <SmokeParticles position={[1, 5.5, 0]} />
    </group>
  );
}

// Command Center Building
function CommandCenter({}: { level?: number }) {
  const antennaRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (antennaRef.current) {
      antennaRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <group>
      {/* Base platform */}
      <Cylinder args={[3, 3.5, 1, 6]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </Cylinder>

      {/* Main building */}
      <Box args={[5, 4, 5]} position={[0, 2.5, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
      </Box>

      {/* Holographic display */}
      <group position={[0, 5, 0]}>
        <Sphere args={[1.5, 32, 32]}>
          <meshStandardMaterial
            color="#3b82f6"
            transparent
            opacity={0.3}
            emissive="#60a5fa"
            emissiveIntensity={0.5}
          />
        </Sphere>
        
        {/* Rotating data rings */}
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            rotation={[0, (i * Math.PI * 2) / 3, 0]}
          >
            <torusGeometry args={[1.2 + i * 0.2, 0.02, 16, 100]} />
            <meshStandardMaterial
              color="#60a5fa"
              emissive="#3b82f6"
              emissiveIntensity={1}
            />
          </mesh>
        ))}
      </group>

      {/* Communication antenna */}
      <group ref={antennaRef} position={[0, 6.5, 0]}>
        <Cylinder args={[0.1, 0.1, 2, 8]}>
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
        </Cylinder>
        
        {/* Antenna dish */}
        <mesh position={[0, 1.5, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <sphereGeometry args={[0.8, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* Scanning beam */}
      <mesh rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 3, 8, 32, 1, true]} />
        <meshStandardMaterial
          color="#3b82f6"
          transparent
          opacity={0.2}
          emissive="#60a5fa"
          emissiveIntensity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Energy Particles Effect
function EnergyParticles({ count, radius, height }: { count: number; radius: number; height: number }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.random() * height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, [count, radius, height]);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += 0.02;
        if (positions[i * 3 + 1] > height) {
          positions[i * 3 + 1] = 0;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.1}
        color="#60a5fa"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Resource Flow Effect
function ResourceFlowEffect() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 10;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = (i / count) * 3;
      positions[i * 3 + 2] = 0;
    }
    return positions;
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += 0.05;
        if (positions[i * 3 + 1] > 3) {
          positions[i * 3 + 1] = 0;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.15}
        color="#10b981"
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Smoke Particles
function SmokeParticles({ position }: { position: [number, number, number] }) {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 5;

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.2;
      positions[i * 3 + 1] = i * 0.3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
    }
    return positions;
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += 0.02;
        if (positions[i * 3 + 1] > 2) {
          positions[i * 3 + 1] = 0;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(particles, 3));

  return (
    <points ref={particlesRef} position={position} geometry={geometry}>
      <pointsMaterial
        size={0.2}
        color="#94a3b8"
        transparent
        opacity={0.4}
      />
    </points>
  );
}

// Orbiting Satellites (Level 5+)
function OrbitingSatellites({ count = 3, radius = 4, speed = 0.5 }: {
  count?: number;
  radius?: number;
  speed?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * speed;
    }
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return (
          <group
            key={i}
            position={[
              Math.cos(angle) * radius,
              2,
              Math.sin(angle) * radius
            ]}
          >
            {/* Satellite body */}
            <Box args={[0.3, 0.1, 0.3]}>
              <meshStandardMaterial
                color="#60a5fa"
                metalness={0.8}
                emissive="#3b82f6"
                emissiveIntensity={0.5}
                toneMapped={false}
              />
            </Box>
            {/* Solar panels */}
            <Box args={[0.6, 0.02, 0.2]} position={[0.4, 0, 0]}>
              <meshStandardMaterial color="#1e3a5f" metalness={0.3} />
            </Box>
            <Box args={[0.6, 0.02, 0.2]} position={[-0.4, 0, 0]}>
              <meshStandardMaterial color="#1e3a5f" metalness={0.3} />
            </Box>
          </group>
        );
      })}
    </group>
  );
}

// Energy Shield (Level 3+)
function EnergyShield({ radius = 3, color = '#60a5fa' }: {
  radius?: number;
  color?: string;
}) {
  const shieldRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (shieldRef.current && shieldRef.current.material instanceof THREE.ShaderMaterial) {
      shieldRef.current.material.uniforms.time.value = clock.elapsedTime;
    }
  });

  // Simple animated shield using standard material
  const { opacity } = useSpring({
    opacity: 0.15,
    from: { opacity: 0.1 },
    loop: { reverse: true },
    config: { duration: 2000 }
  });

  return (
    <animated.mesh ref={shieldRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <animated.meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        emissive={color}
        emissiveIntensity={0.3}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </animated.mesh>
  );
}

// Communication Antenna (Level 2+)
function CommunicationAntenna({ height = 1.5, isActive = true }: {
  height?: number;
  isActive?: boolean;
}) {
  const tipRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (tipRef.current) {
      // Pulsing glow effect
      const intensity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.3;
      if (tipRef.current.material instanceof THREE.MeshStandardMaterial) {
        tipRef.current.material.emissiveIntensity = isActive ? intensity : 0.2;
      }
    }
  });

  return (
    <group position={[0, 3, 0]}>
      {/* Antenna pole */}
      <Cylinder args={[0.05, 0.05, height, 8]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
      </Cylinder>
      {/* Glowing tip */}
      <Sphere ref={tipRef} args={[0.1, 16, 16]} position={[0, height / 2 + 0.1, 0]}>
        <meshStandardMaterial
          color="#60a5fa"
          emissive="#60a5fa"
          emissiveIntensity={isActive ? 1 : 0.2}
          toneMapped={false}
        />
      </Sphere>
      {/* Signal rings when active */}
      {isActive && (
        <SignalRings position={[0, height / 2 + 0.1, 0]} />
      )}
    </group>
  );
}

// Signal Rings for antenna
function SignalRings({ position }: { position: [number, number, number] }) {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        const scale = 0.5 + ((clock.elapsedTime * 0.5 + i * 0.3) % 1) * 1.5;
        const opacity = 1 - ((clock.elapsedTime * 0.5 + i * 0.3) % 1);
        ring.scale.set(scale, scale, scale);
        if (ring instanceof THREE.Mesh && ring.material instanceof THREE.MeshStandardMaterial) {
          ring.material.opacity = opacity * 0.5;
        }
      });
    }
  });

  return (
    <group ref={ringsRef} position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.3, 0.02, 8, 32]} />
          <meshStandardMaterial
            color="#60a5fa"
            transparent
            opacity={0.5}
            emissive="#60a5fa"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

// Level Badge
function LevelBadge({ level }: { level: number }) {
  const colors = {
    1: '#64748b',
    2: '#3b82f6',
    3: '#8b5cf6',
    4: '#f59e0b',
    5: '#ef4444',
    6: '#fbbf24'
  };

  const color = colors[Math.min(level, 6) as keyof typeof colors] || colors[6];

  return (
    <Billboard position={[0, 4, 0]}>
      <mesh>
        <circleGeometry args={[0.4, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={level >= 4 ? 1 : 0.5}
          toneMapped={false}
        />
      </mesh>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {level}
      </Text>
    </Billboard>
  );
}

// Progressive Upgrade Visuals Component
function BuildingUpgradeVisuals({ level, isActive = true }: {
  level: number;
  isActive?: boolean;
}) {
  const enhancements = useMemo(() => ({
    hasAntenna: level >= 2,
    hasShield: level >= 3,
    hasParticles: level >= 4,
    hasSatellites: level >= 5,
    hasAura: level >= 6
  }), [level]);

  return (
    <group>
      {/* Level 2+: Communication antenna */}
      {enhancements.hasAntenna && (
        <CommunicationAntenna isActive={isActive} />
      )}

      {/* Level 3+: Energy shield */}
      {enhancements.hasShield && (
        <EnergyShield radius={3.5} />
      )}

      {/* Level 4+: Ambient particles */}
      {enhancements.hasParticles && (
        <Sparkles
          count={30}
          size={1}
          speed={0.4}
          opacity={0.6}
          color="#60a5fa"
          scale={[4, 4, 4]}
        />
      )}

      {/* Level 5+: Orbiting satellites */}
      {enhancements.hasSatellites && (
        <OrbitingSatellites count={3} radius={4} speed={0.3} />
      )}

      {/* Level 6+: Legendary aura */}
      {enhancements.hasAura && (
        <>
          <Sparkles
            count={50}
            size={2}
            speed={0.6}
            opacity={0.8}
            color="#fbbf24"
            scale={[5, 6, 5]}
          />
          <pointLight color="#fbbf24" intensity={2} distance={10} />
        </>
      )}

      {/* Level indicator badge (level 2+) */}
      {level >= 2 && (
        <LevelBadge level={level} />
      )}
    </group>
  );
}

// Main Building Model Component
export default function EnhancedBuildingModel({
  type,
  position,
  rotation = [0, 0, 0],
  scale = 1,
  isActive = true,
  level = 1,
  onClick,
  onHover
}: BuildingModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const { groupScale } = useSpring({
    groupScale: hovered ? scale * 1.05 : scale,
    config: { tension: 300, friction: 20 }
  });

  const handlePointerOver = () => {
    setHovered(true);
    onHover?.(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    onHover?.(false);
    document.body.style.cursor = 'default';
  };

  // Select building model based on type
  const getBuildingModel = () => {
    switch (type) {
      case 'energyGenerator':
      case 'powerGrid':
      case 'communicationBeacon':
        return <EnergyGenerator isActive={isActive} level={level} />;
      case 'resourceCollector':
      case 'miningStation':
        return <ResourceCollector isActive={isActive} level={level} />;
      case 'livingQuarters':
      case 'habitat':
        return <LivingQuarters level={level} />;
      case 'commandCenter':
      case 'controlHub':
        return <CommandCenter level={level} />;
      default:
        // Default building
        return (
          <Box args={[2, 2, 2]}>
            <meshStandardMaterial color="#64748b" />
          </Box>
        );
    }
  };

  return (
    <AnimatedGroup
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={groupScale}
      onClick={onClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {getBuildingModel()}

      {/* Progressive upgrade visuals based on level */}
      <BuildingUpgradeVisuals level={level} isActive={isActive} />

      {/* Hover effect */}
      {hovered && (
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[3, 3, 0.1, 32]} />
          <meshStandardMaterial
            color="#3b82f6"
            transparent
            opacity={0.3}
            emissive="#60a5fa"
            emissiveIntensity={0.5}
            toneMapped={false}
          />
        </mesh>
      )}
    </AnimatedGroup>
  );
}

