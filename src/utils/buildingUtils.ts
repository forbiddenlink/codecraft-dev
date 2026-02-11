import { Vector3 } from 'three';
import { PlacedBuilding, buildingTemplates } from '@/data/buildingTemplates';

interface GridBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

// Maximum colony size (in grid units)
export const COLONY_BOUNDS = {
  minX: -20,
  maxX: 20,
  minZ: -20,
  maxZ: 20
};

// Get the grid bounds of a building
export function getBuildingBounds(position: Vector3, templateId: string, rotation: number): GridBounds {
  const template = buildingTemplates[templateId];
  if (!template) return { minX: 0, maxX: 0, minZ: 0, maxZ: 0 };

  const width = template.gridSize.width;
  const depth = template.gridSize.width; // Using width for depth since buildings are square

  // Adjust bounds based on rotation
  const isRotated = Math.abs(rotation % Math.PI) > 0.1;
  const effectiveWidth = isRotated ? depth : width;
  const effectiveDepth = isRotated ? width : depth;

  return {
    minX: position.x - effectiveWidth / 2,
    maxX: position.x + effectiveWidth / 2,
    minZ: position.z - effectiveDepth / 2,
    maxZ: position.z + effectiveDepth / 2
  };
}

// Check if a building overlaps with existing buildings
export function checkBuildingCollision(
  position: Vector3,
  templateId: string,
  rotation: number,
  existingBuildings: PlacedBuilding[]
): boolean {
  const newBuildingBounds = getBuildingBounds(position, templateId, rotation);

  // Check colony bounds first
  if (
    newBuildingBounds.minX < COLONY_BOUNDS.minX ||
    newBuildingBounds.maxX > COLONY_BOUNDS.maxX ||
    newBuildingBounds.minZ < COLONY_BOUNDS.minZ ||
    newBuildingBounds.maxZ > COLONY_BOUNDS.maxZ
  ) {
    return true; // Collision with colony bounds
  }

  // Check collision with existing buildings
  return existingBuildings.some(building => {
    const existingBounds = getBuildingBounds(
      new Vector3(building.position.x, building.position.y, building.position.z),
      building.templateId,
      building.rotation
    );

    return !(
      newBuildingBounds.maxX < existingBounds.minX ||
      newBuildingBounds.minX > existingBounds.maxX ||
      newBuildingBounds.maxZ < existingBounds.minZ ||
      newBuildingBounds.minZ > existingBounds.maxZ
    );
  });
}

// Get valid grid positions around a point
export function getValidGridPositions(
  center: Vector3,
  radius: number,
  existingBuildings: PlacedBuilding[]
): Vector3[] {
  const positions: Vector3[] = [];
  
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      const pos = new Vector3(
        Math.round(center.x + x),
        0,
        Math.round(center.z + z)
      );
      
      // Check if position is within colony bounds and not colliding with buildings
      if (
        pos.x >= COLONY_BOUNDS.minX &&
        pos.x <= COLONY_BOUNDS.maxX &&
        pos.z >= COLONY_BOUNDS.minZ &&
        pos.z <= COLONY_BOUNDS.maxZ &&
        !existingBuildings.some(building => {
          const buildingPos = new Vector3(
            building.position.x,
            building.position.y,
            building.position.z
          );
          return buildingPos.distanceTo(pos) < 1; // Minimum 1 unit spacing
        })
      ) {
        positions.push(pos);
      }
    }
  }
  
  return positions;
} 