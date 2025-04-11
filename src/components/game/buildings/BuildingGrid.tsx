'use client';
import { useMemo } from 'react';
import { Line } from '@react-three/drei';

interface BuildingGridProps {
  width: number;
  height: number;
  cellSize: number;
  showGridLines: boolean;
}

export default function BuildingGrid({ width, height, cellSize, showGridLines }: BuildingGridProps) {
  const gridPoints = useMemo(() => {
    if (!showGridLines) return [];

    const points: [number, number, number][][] = [];
    
    // Create horizontal lines
    for (let z = -height/2; z <= height/2; z += cellSize) {
      points.push([
        [-width/2, 0.1, z],
        [width/2, 0.1, z]
      ]);
    }
    
    // Create vertical lines
    for (let x = -width/2; x <= width/2; x += cellSize) {
      points.push([
        [x, 0.1, -height/2],
        [x, 0.1, height/2]
      ]);
    }
    
    return points;
  }, [width, height, cellSize, showGridLines]);

  if (!showGridLines) return null;

  return (
    <group>
      {gridPoints.map((points, index) => (
        <Line
          key={index}
          points={points}
          color="#4a5568"
          lineWidth={1}
          dashed={false}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
} 