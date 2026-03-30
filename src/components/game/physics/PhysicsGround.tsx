'use client';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Plane } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo } from 'react';

export interface PhysicsGroundProps {
  onClick: (event: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void;
  color?: string;
  size?: number;
}

/**
 * Physics-enabled ground plane using Rapier RigidBody.
 * Acts as a fixed collider for all physics objects.
 */
export default function PhysicsGround({
  onClick,
  onPointerMove,
  color = '#1a1a1a',
  size = 200
}: PhysicsGroundProps) {
  // Create procedural grid texture
  const gridTexture = useMemo(() => {
    const textureSize = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const context = canvas.getContext('2d');
    if (!context) return null;

    // Fill background
    context.fillStyle = '#141414';
    context.fillRect(0, 0, textureSize, textureSize);

    // Draw grid
    context.strokeStyle = '#1a1a1a';
    context.lineWidth = 2;
    const gridSize = textureSize / 100;

    for (let i = 0; i <= textureSize; i += gridSize) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i, textureSize);
      context.stroke();

      context.beginPath();
      context.moveTo(0, i);
      context.lineTo(textureSize, i);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 100);
    return texture;
  }, []);

  // Create procedural noise texture for roughness
  const noiseTexture = useMemo(() => {
    const textureSize = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = textureSize;
    canvas.height = textureSize;
    const context = canvas.getContext('2d');
    if (!context) return null;

    const imageData = context.createImageData(textureSize, textureSize);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[size / 2, 0.1, size / 2]} position={[0, -0.1, 0]} />
      <Plane
        args={[size, size]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        name="ground"
        onClick={onClick}
        onPointerMove={onPointerMove}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.8}
          metalness={0.2}
          envMapIntensity={0.2}
          toneMapped={true}
          transparent={false}
          opacity={1}
          map={gridTexture}
          roughnessMap={noiseTexture}
        />
      </Plane>
    </RigidBody>
  );
}
