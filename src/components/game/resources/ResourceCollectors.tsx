'use client';
import { useAppSelector } from '@/hooks/reduxHooks';
import ResourceCollector from './ResourceCollector';

export default function ResourceCollectors() {
  const resources = useAppSelector(state => state.resources.resources);

  // Tighter, more intuitive collector positions in a semi-circle around the player
  const collectorPositions = {
    energy: [
      [-4, 0, -2], // Left
      [4, 0, -2],  // Right
      [0, 0, -4],  // Back
    ],
    code: [
      [-3, 0, 2],  // Left
      [3, 0, 2],   // Right
      [0, 0, 0],   // Center
    ],
    data: [
      [-2, 0, 4],  // Left
      [2, 0, 4],   // Right
      [0, 0, 6],   // Front
    ],
  };

  return (
    <group>
      {Object.entries(resources).map(([id, resource]) => 
        collectorPositions[id as keyof typeof collectorPositions]?.map((position, index) => (
          <ResourceCollector
            key={`${id}-${index}`}
            resource={resource}
            position={position as [number, number, number]}
            collectionRadius={2.5} // Slightly reduced for tighter gameplay
            collectionAmount={resource.generationRate * 2}
          />
        ))
      )}
    </group>
  );
} 