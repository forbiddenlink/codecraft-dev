'use client';
import { useAppSelector } from '@/store/hooks';
import ResourceCollector from './ResourceCollector';

const RESOURCE_METADATA = {
  energy: {
    name: 'Energy',
    color: '#FFD700',
    icon: '⚡',
    generationRate: 1
  },
  minerals: {
    name: 'Minerals',
    color: '#A0522D',
    icon: '💎',
    generationRate: 0.5
  },
  water: {
    name: 'Water',
    color: '#4169E1',
    icon: '💧',
    generationRate: 0.8
  },
  food: {
    name: 'Food',
    color: '#32CD32',
    icon: '🌾',
    generationRate: 0.6
  }
};

export default function ResourceCollectors() {
  const storage = useAppSelector(state => state.resource.storage);
  const productionRates = useAppSelector(state => state.resource.productionRates);

  // Tighter, more intuitive collector positions in a semi-circle around the player
  const collectorPositions = {
    energy: [
      [-4, 0, -2], // Left
      [4, 0, -2],  // Right
      [0, 0, -4],  // Back
    ],
    minerals: [
      [-3, 0, 2],  // Left
      [3, 0, 2],   // Right
      [0, 0, 0],   // Center
    ],
    water: [
      [-2, 0, 4],  // Left
      [2, 0, 4],   // Right
      [0, 0, 6],   // Front
    ],
    food: [
      [-1, 0, 3],  // Left
      [1, 0, 3],   // Right
      [0, 0, 5],   // Front
    ]
  };

  return (
    <group>
      {Object.entries(storage).map(([resourceType, amount]) => 
        collectorPositions[resourceType]?.map((position, index) => (
          <ResourceCollector
            key={`${resourceType}-${index}`}
            resource={{
              id: resourceType,
              name: RESOURCE_METADATA[resourceType].name,
              color: RESOURCE_METADATA[resourceType].color,
              icon: RESOURCE_METADATA[resourceType].icon,
              amount,
              generationRate: productionRates[resourceType]
            }}
            position={position as [number, number, number]}
            collectionRadius={2.5}
            collectionAmount={RESOURCE_METADATA[resourceType].generationRate * 2}
          />
        ))
      )}
    </group>
  );
} 