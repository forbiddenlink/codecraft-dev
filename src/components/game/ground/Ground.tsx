'use client';
import { Plane } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo } from 'react';

export interface GroundProps {
  onClick: (event: ThreeEvent<PointerEvent>) => void;
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void;
  color?: string;
}

const Ground = ({ onClick, onPointerMove, color = '#1a1a1a' }: GroundProps) => {
  // Create procedural grid texture
  const gridTexture = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d')!;

    // Fill background
    context.fillStyle = '#141414';
    context.fillRect(0, 0, size, size);

    // Draw grid
    context.strokeStyle = '#1a1a1a';
    context.lineWidth = 2;
    const gridSize = size / 100; // 100 grid cells

    for (let i = 0; i <= size; i += gridSize) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i, size);
      context.stroke();

      context.beginPath();
      context.moveTo(0, i);
      context.lineTo(size, i);
      context.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 100);
    return texture;
  }, []);

  // Create procedural noise texture
  const noiseTexture = useMemo(() => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d')!;
    const imageData = context.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() * 255;
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255;   // A
    }

    context.putImageData(imageData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  return (
    <Plane
      args={[200, 200]}
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
  );
};

export default Ground; 