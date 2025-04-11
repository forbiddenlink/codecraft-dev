'use client';
import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ExecutionData {
  variables: Record<string, string | number | boolean | null | undefined>;
  callStack: string[];
  output: string[];
}

interface CodeExecutionVisualizerProps {
  executionData: ExecutionData;
  position: [number, number, number];
}

export default function CodeExecutionVisualizer({ 
  executionData, 
  position 
}: CodeExecutionVisualizerProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Make the visualization face the camera
      groupRef.current.quaternion.copy(state.camera.quaternion);
      
      // Add a slight floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Variables section */}
      <group position={[-5, 0, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.6}
          color="#3b82f6"
          anchorX="left"
          anchorY="top"
        >
          Variables:
        </Text>
        {Object.entries(executionData.variables).map(([name, value], index) => (
          <Text
            key={name}
            position={[0.5, 0.5 - index * 0.7, 0]}
            fontSize={0.5}
            color="#60a5fa"
            anchorX="left"
            anchorY="top"
          >
            {`${name}: ${JSON.stringify(value)}`}
          </Text>
        ))}
      </group>

      {/* Call stack section */}
      <group position={[0, 0, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.6}
          color="#8b5cf6"
          anchorX="left"
          anchorY="top"
        >
          Call Stack:
        </Text>
        {executionData.callStack.map((call, index) => (
          <Text
            key={index}
            position={[0.5, 0.5 - index * 0.7, 0]}
            fontSize={0.5}
            color="#a78bfa"
            anchorX="left"
            anchorY="top"
          >
            {call}
          </Text>
        ))}
      </group>

      {/* Output section */}
      <group position={[5, 0, 0]}>
        <Text
          position={[0, 1, 0]}
          fontSize={0.6}
          color="#10b981"
          anchorX="left"
          anchorY="top"
        >
          Output:
        </Text>
        {executionData.output.map((line, index) => (
          <Text
            key={index}
            position={[0.5, 0.5 - index * 0.7, 0]}
            fontSize={0.5}
            color="#34d399"
            anchorX="left"
            anchorY="top"
          >
            {line}
          </Text>
        ))}
      </group>
    </group>
  );
} 