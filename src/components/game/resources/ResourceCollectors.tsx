'use client';
import { useAppSelector } from '@/store/hooks';
import { ResourceCollector } from './ResourceCollector';

type ResourceKey = 'energy' | 'minerals' | 'water' | 'food';

type ResourceMetadata = {
  [K in ResourceKey]: {
    name: string;
    color: string;
    icon: string;
    generationRate: number;
  }
};

const RESOURCE_METADATA: ResourceMetadata = {
  energy: {
    name: 'Energy',
    color: '#FBBF24',
    icon: '⚡',
    generationRate: 1
  },
  minerals: {
    name: 'Minerals',
    color: '#3B82F6',
    icon: '💎',
    generationRate: 0.5
  },
  water: {
    name: 'Water',
    color: '#1E3A8A',
    icon: '💧',
    generationRate: 0.8
  },
  food: {
    name: 'Food',
    color: '#10B981',
    icon: '🌾',
    generationRate: 0.6
  }
};

type CollectorPositions = {
  [K in ResourceKey]: [number, number, number][];
};

type Storage = {
  [K in ResourceKey]: number;
};

type ProductionRates = {
  [K in ResourceKey]: number;
};

export default function ResourceCollectors() {
  const storage = useAppSelector(state => state.resource.storage) as Storage;
  const productionRates = useAppSelector(state => state.resource.productionRates) as ProductionRates;

  // Spread out collector positions in a wider area
  const collectorPositions: CollectorPositions = {
    energy: [
      [-15, 0, -10], // Far Left
      [0, 0, -15],   // Center Back
      [15, 0, -10],  // Far Right
    ],
    minerals: [
      [-20, 0, 0],   // Far Left
      [-10, 0, 10],  // Left Front
      [10, 0, 10],   // Right Front
    ],
    water: [
      [-5, 0, -20],  // Back Left
      [5, 0, -20],   // Back Right
      [0, 0, -10],   // Center
    ],
    food: [
      [20, 0, 0],    // Far Right
      [15, 0, 15],   // Right Front
      [-15, 0, 15],  // Left Front
    ]
  };

  return (
    <group>
      {Object.entries(storage).map(([resourceType, amount]: [string, number]) => 
        collectorPositions[resourceType as ResourceKey]?.map((position: [number, number, number], index: number) => (
          <ResourceCollector
            key={`${resourceType}-${index}`}
            resource={{
              id: resourceType,
              name: RESOURCE_METADATA[resourceType as ResourceKey].name,
              color: RESOURCE_METADATA[resourceType as ResourceKey].color,
              icon: RESOURCE_METADATA[resourceType as ResourceKey].icon,
              amount,
              generationRate: productionRates[resourceType as ResourceKey]
            }}
            position={position}
            collectionRadius={3.5}
          />
        ))
      )}
    </group>
  );
} 