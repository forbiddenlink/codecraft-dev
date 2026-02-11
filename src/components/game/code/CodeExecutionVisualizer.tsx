'use client';
import { useRef, useState, useEffect } from 'react';
import { Text, Billboard, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpring, animated } from '@react-spring/three';

interface ExecutionData {
  variables: Record<string, string | number | boolean | null | undefined>;
  callStack: string[];
  output: string[];
  errors?: Array<{ message: string; line?: number }>;
  performance?: {
    executionTime: number;
    memoryUsed: number;
  };
  status?: 'idle' | 'running' | 'success' | 'error';
}

interface CodeExecutionVisualizerProps {
  executionData: ExecutionData;
  position: [number, number, number];
  showRealTimeFeedback?: boolean;
}

const AnimatedGroup = animated.group;

// Particle effect for successful execution
function SuccessParticles({ position }: { position: [number, number, number] }) {
  const particlesRef = useRef<THREE.Points>(null);
  const [particleData] = useState(() => {
    const positions = [];
    const colors = [];
    const velocities = [];
    
    for (let i = 0; i < 50; i++) {
      positions.push(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      );
      colors.push(0.2, 0.8, 0.4); // Green
      velocities.push(
        (Math.random() - 0.5) * 0.02,
        Math.random() * 0.05,
        (Math.random() - 0.5) * 0.02
      );
    }
    
    return { positions, colors, velocities };
  });

  useFrame(() => {
    if (!particlesRef.current) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < positions.length; i += 3) {
      positions[i] += particleData.velocities[i];
      positions[i + 1] += particleData.velocities[i + 1];
      positions[i + 2] += particleData.velocities[i + 2];
      
      // Reset particles that go too high
      if (positions[i + 1] > 3) {
        positions[i] = (Math.random() - 0.5) * 2;
        positions[i + 1] = 0;
        positions[i + 2] = (Math.random() - 0.5) * 2;
      }
    }
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(particleData.positions), 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(particleData.colors), 3));

  return (
    <points ref={particlesRef} position={position} geometry={geometry}>
      <pointsMaterial size={0.1} vertexColors transparent opacity={0.8} />
    </points>
  );
}

// Animated data card component
function DataCard({ 
  title, 
  items, 
  color, 
  position,
  highlighted 
}: { 
  title: string;
  items: Array<{ key: string; value: string; isNew?: boolean }>;
  color: string;
  position: [number, number, number];
  highlighted?: boolean;
}) {
  const { scale } = useSpring({
    scale: highlighted ? 1.1 : 1,
    config: { tension: 300, friction: 20 }
  });

  return (
    <AnimatedGroup position={position} scale={scale}>
      {/* Card background */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[4, 3 + items.length * 0.5]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Border glow */}
      <mesh position={[0, 0, -0.15]}>
        <planeGeometry args={[4.1, 3.1 + items.length * 0.5]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.3}
          side={THREE.DoubleSide}
          emissive={color}
          emissiveIntensity={highlighted ? 0.5 : 0.2}
        />
      </mesh>

      {/* Title */}
      <Billboard>
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.4}
          color={color}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {title}
        </Text>
      </Billboard>

      {/* Items */}
      {items.map((item, index) => (
        <Billboard key={item.key}>
          <group position={[0, 0.6 - index * 0.4, 0]}>
            <Text
              fontSize={0.25}
              color={item.isNew ? '#fbbf24' : '#e5e7eb'}
              anchorX="center"
              anchorY="middle"
            >
              {`${item.key}: ${item.value}`}
            </Text>
            {item.isNew && (
              <Sphere args={[0.05]} position={[-1.5, 0, 0]}>
                <meshStandardMaterial 
                  color="#fbbf24" 
                  emissive="#fbbf24"
                  emissiveIntensity={0.5}
                />
              </Sphere>
            )}
          </group>
        </Billboard>
      ))}
    </AnimatedGroup>
  );
}

// Main visualizer component
export default function CodeExecutionVisualizer({ 
  executionData, 
  position,
  showRealTimeFeedback = true
}: CodeExecutionVisualizerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [recentlyChanged, setRecentlyChanged] = useState<Set<string>>(new Set());
  const [showSuccess, setShowSuccess] = useState(false);

  // Floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  // Track variable changes
  useEffect(() => {
    const newChanged = new Set<string>();
    Object.keys(executionData.variables).forEach(key => {
      newChanged.add(key);
    });
    setRecentlyChanged(newChanged);
    
    const timer = setTimeout(() => setRecentlyChanged(new Set()), 2000);
    return () => clearTimeout(timer);
  }, [executionData.variables]);

  // Show success animation
  useEffect(() => {
    if (executionData.status === 'success') {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [executionData.status]);

  const hasErrors = executionData.errors && executionData.errors.length > 0;
  const hasOutput = executionData.output && executionData.output.length > 0;
  const hasVariables = Object.keys(executionData.variables).length > 0;

  // Prepare data for cards
  const variableItems = Object.entries(executionData.variables).map(([key, value]) => ({
    key,
    value: JSON.stringify(value),
    isNew: recentlyChanged.has(key)
  }));

  const outputItems = executionData.output.map((line, index) => ({
    key: `${index}`,
    value: line
  }));

  const callStackItems = executionData.callStack.map((call, index) => ({
    key: `${index}`,
    value: call
  }));

  return (
    <group ref={groupRef} position={position}>
      {/* Success particles */}
      {showSuccess && <SuccessParticles position={[0, 0, 0]} />}

      {/* Status indicator sphere */}
      <Sphere args={[0.3]} position={[0, 2, 0]}>
        <meshStandardMaterial
          color={
            executionData.status === 'success' ? '#10b981' :
            executionData.status === 'error' ? '#ef4444' :
            executionData.status === 'running' ? '#3b82f6' :
            '#6b7280'
          }
          emissive={
            executionData.status === 'success' ? '#10b981' :
            executionData.status === 'error' ? '#ef4444' :
            executionData.status === 'running' ? '#3b82f6' :
            '#6b7280'
          }
          emissiveIntensity={executionData.status === 'running' ? 1 : 0.5}
        />
      </Sphere>

      {/* Variables card */}
      {hasVariables && showRealTimeFeedback && (
        <DataCard
          title="Variables"
          items={variableItems}
          color="#3b82f6"
          position={[-5, 0, 0]}
          highlighted={recentlyChanged.size > 0}
        />
      )}

      {/* Call stack card */}
      {callStackItems.length > 0 && showRealTimeFeedback && (
        <DataCard
          title="Call Stack"
          items={callStackItems}
          color="#8b5cf6"
          position={[0, 0, 0]}
        />
      )}

      {/* Output card */}
      {hasOutput && (
        <DataCard
          title="Output"
          items={outputItems}
          color="#10b981"
          position={[5, 0, 0]}
        />
      )}

      {/* Error display */}
      {hasErrors && (
        <DataCard
          title="Errors"
          items={executionData.errors!.map((error, index) => ({
            key: `${index}`,
            value: `${error.line ? `Line ${error.line}: ` : ''}${error.message}`
          }))}
          color="#ef4444"
          position={[0, -3, 0]}
          highlighted={true}
        />
      )}

      {/* Performance metrics */}
      {executionData.performance && showRealTimeFeedback && (
        <Billboard position={[0, -4, 0]}>
          <Text
            fontSize={0.25}
            color="#9ca3af"
            anchorX="center"
            anchorY="middle"
          >
            {`⚡ ${executionData.performance.executionTime.toFixed(2)}ms | 💾 ${(executionData.performance.memoryUsed / 1024).toFixed(1)}KB`}
          </Text>
        </Billboard>
      )}

      {/* Ambient lighting for the cards */}
      <pointLight position={[0, 2, 0]} intensity={0.5} color="#3b82f6" distance={10} />
    </group>
  );
}
