'use client';
import { useRef } from 'react';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import { Box, RoundedBox, Cylinder, Sphere, Text } from '@react-three/drei';
import { animated, useSpring } from '@react-spring/three';
import { useFrame } from '@react-three/fiber';
import { Color, Group, MeshStandardMaterial } from 'three';

export type PhysicsBuildingType =
  | 'div'
  | 'section'
  | 'article'
  | 'nav'
  | 'header'
  | 'footer'
  | 'aside'
  | 'main'
  | 'habitat'
  | 'laboratory'
  | 'greenhouse'
  | 'generator'
  | 'dock'
  | 'command'
  | 'storage';

interface PhysicsBuildingProps {
  elementType: PhysicsBuildingType;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color?: string;
  isHovered?: boolean;
  isSelected?: boolean;
  isActive?: boolean;
  textContent?: string;
  onClick?: () => void;
  enablePhysics?: boolean;
  mass?: number;
}

function getBuildingDimensions(elementType: PhysicsBuildingType): { width: number; height: number; depth: number } {
  switch (elementType) {
    case 'section':
    case 'main':
    case 'habitat':
    case 'command':
      return { width: 3, height: 2, depth: 3 };
    case 'article':
    case 'laboratory':
      return { width: 2, height: 2, depth: 2 };
    case 'nav':
    case 'dock':
      return { width: 3, height: 1, depth: 1.5 };
    case 'header':
      return { width: 3, height: 1, depth: 3 };
    case 'footer':
      return { width: 3, height: 0.7, depth: 3 };
    case 'generator':
      return { width: 1.5, height: 2, depth: 1.5 };
    case 'greenhouse':
      return { width: 2, height: 2, depth: 2 };
    case 'storage':
      return { width: 2, height: 1.5, depth: 2 };
    default:
      return { width: 2, height: 1.5, depth: 2 };
  }
}

function getDefaultColor(elementType: PhysicsBuildingType): string {
  switch (elementType) {
    case 'section':
    case 'main':
    case 'habitat':
      return '#7bb5d4';
    case 'article':
    case 'laboratory':
      return '#a8c6d9';
    case 'nav':
    case 'dock':
    case 'header':
    case 'footer':
      return '#5d8ca8';
    case 'generator':
      return '#4a5568';
    case 'greenhouse':
      return '#10b981';
    case 'storage':
      return '#6b7280';
    default:
      return '#4a5568';
  }
}

export default function PhysicsBuilding({
  elementType,
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  color,
  isHovered = false,
  isSelected = false,
  isActive = true,
  textContent,
  onClick,
  enablePhysics = true,
  mass = 1
}: PhysicsBuildingProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  const dimensions = getBuildingDimensions(elementType);
  const buildingColor = new Color(color || getDefaultColor(elementType));

  const { hoverScale, emissiveIntensity } = useSpring({
    hoverScale: isHovered || isSelected ? 1.05 : 1,
    emissiveIntensity: isHovered ? 2.0 : isSelected ? 1.5 : isActive ? 0.4 : 0.1,
    config: { tension: 170, friction: 26 }
  });

  useFrame((state) => {
    if (!materialRef.current) return;

    const time = state.clock.getElapsedTime();

    // Animate energy systems for generators
    if (isActive && elementType === 'generator') {
      materialRef.current.emissiveIntensity = 0.2 + Math.sin(time * 2) * 0.1;
    }
  });

  const renderShape = () => {
    const commonMaterial = (
      <animated.meshStandardMaterial
        ref={materialRef}
        color={buildingColor}
        emissive={buildingColor}
        emissiveIntensity={emissiveIntensity}
        metalness={0.4}
        roughness={0.6}
        toneMapped={false}
      />
    );

    switch (elementType) {
      case 'section':
      case 'main':
      case 'habitat':
      case 'command':
        return (
          <RoundedBox
            args={[dimensions.width, dimensions.height, dimensions.depth]}
            radius={0.2}
            smoothness={4}
          >
            {commonMaterial}
          </RoundedBox>
        );

      case 'generator':
        return (
          <group>
            <Cylinder args={[dimensions.width * 0.4, dimensions.width * 0.6, dimensions.height, 16]}>
              {commonMaterial}
            </Cylinder>
            <Box
              args={[dimensions.width * 0.8, dimensions.height * 0.2, dimensions.width * 0.8]}
              position={[0, -dimensions.height * 0.4, 0]}
            >
              <meshStandardMaterial
                color={new Color().copy(buildingColor).multiplyScalar(0.8)}
                metalness={0.5}
                roughness={0.7}
              />
            </Box>
          </group>
        );

      case 'greenhouse':
        return (
          <group>
            <Sphere
              args={[dimensions.width * 0.5, 16, 16, 0, Math.PI]}
              position={[0, dimensions.height * 0.2, 0]}
            >
              <meshStandardMaterial
                color={new Color(0xc1d9e8)}
                emissive={buildingColor}
                emissiveIntensity={0.3}
                metalness={0.1}
                roughness={0.3}
                transparent
                opacity={0.7}
                toneMapped={false}
              />
            </Sphere>
            <Cylinder
              args={[dimensions.width * 0.5, dimensions.width * 0.5, dimensions.height * 0.4, 16]}
              position={[0, -dimensions.height * 0.2, 0]}
            >
              <meshStandardMaterial
                color={buildingColor}
                metalness={0.4}
                roughness={0.6}
              />
            </Cylinder>
          </group>
        );

      case 'laboratory':
      case 'article':
        return (
          <group>
            <Box args={[dimensions.width, dimensions.height * 0.8, dimensions.depth]}>
              {commonMaterial}
            </Box>
            <Sphere
              args={[dimensions.width * 0.3, 16, 16]}
              position={[0, dimensions.height * 0.5, 0]}
            >
              <meshStandardMaterial
                color={new Color().copy(buildingColor).multiplyScalar(1.2)}
                emissive={buildingColor}
                emissiveIntensity={0.5}
                metalness={0.7}
                roughness={0.3}
                toneMapped={false}
              />
            </Sphere>
          </group>
        );

      default:
        return (
          <Box args={[dimensions.width, dimensions.height, dimensions.depth]}>
            {commonMaterial}
          </Box>
        );
    }
  };

  const content = (
    <animated.group
      ref={groupRef}
      scale={hoverScale.to(s => [s * scale[0], s * scale[1], s * scale[2]])}
      onClick={onClick}
    >
      {renderShape()}
      {textContent && (
        <Text
          position={[0, dimensions.height * 0.6, dimensions.depth * 0.6]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={dimensions.width * 1.5}
        >
          {textContent}
        </Text>
      )}
    </animated.group>
  );

  if (enablePhysics) {
    return (
      <RigidBody
        ref={rigidBodyRef}
        type="fixed"
        position={position}
        rotation={rotation}
        colliders={false}
      >
        <CuboidCollider
          args={[dimensions.width / 2, dimensions.height / 2, dimensions.depth / 2]}
        />
        {content}
      </RigidBody>
    );
  }

  return (
    <group position={position} rotation={rotation}>
      {content}
    </group>
  );
}
