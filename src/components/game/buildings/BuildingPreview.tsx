'use client';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useState, useEffect } from 'react';
import { Vector3 } from 'three';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { buildingTemplates, BuildingTemplate } from '@/data/buildingTemplates';
import { 
  placeBuilding, 
  updatePreviewPosition, 
  rotatePreview, 
  cancelPlacement 
} from '@/store/slices/buildingSlice';
import BuildingModel from './BuildingModel';

interface BuildingPreviewProps {
  gridSnap?: boolean;
}

interface BuildingBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

interface PlacedBuilding {
  templateId: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: number;
}

export default function BuildingPreview({ gridSnap = true }: BuildingPreviewProps) {
  const dispatch = useAppDispatch();
  const { 
    selectedTemplateId, 
    buildMode, 
    previewPosition, 
    previewRotation 
  } = useAppSelector(state => state.building);
  
  const placedBuildings = useAppSelector(state => state.building.placedBuildings);
  
  const [isValid, setIsValid] = useState(true);
  
  const template = selectedTemplateId ? buildingTemplates[selectedTemplateId] : null;
  
  // Handle keyboard events for preview manipulation
  useEffect(() => {
    if (!buildMode) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R') {
        dispatch(rotatePreview());
      }
      if (event.key === 'Escape') {
        dispatch(cancelPlacement());
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, buildMode]);
  
  // Update preview position based on mouse position
  useFrame((state) => {
    if (!buildMode || !selectedTemplateId || !template) return;
    
    // Ray casting to find ground intersection
    const raycaster = state.raycaster;
    const intersects = raycaster.intersectObjects(state.scene.children, true);
    
    const groundIntersect = intersects.find(
      intersect => intersect.object.name === 'ground'
    );
    
    if (groundIntersect) {
      const point = groundIntersect.point;
      
      // Apply grid snapping if enabled
      let snappedPosition;
      if (gridSnap) {
        const gridSize = 2; // Default grid size
        snappedPosition = new Vector3(
          Math.round(point.x / gridSize) * gridSize,
          0, // Keep at ground level
          Math.round(point.z / gridSize) * gridSize
        );
      } else {
        snappedPosition = new Vector3(point.x, 0, point.z);
      }
      
      // Update preview position in Redux
      dispatch(updatePreviewPosition({
        x: snappedPosition.x,
        y: snappedPosition.y,
        z: snappedPosition.z
      }));
      
      // Check if placement is valid (no collisions with existing buildings)
      const isValidPlacement = !checkCollisions(snappedPosition, template, previewRotation, placedBuildings);
      setIsValid(isValidPlacement);
    }
  });
  
  // Handle placement on mouse click
  const handlePlacement = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    
    if (!isValid || !previewPosition || !template) return;
    
    // Place the building
    dispatch(placeBuilding({
      templateId: template.id,
      position: previewPosition,
      rotation: previewRotation,
      effects: template.effects || []
    }));
  };
  
  // If not in build mode or no template selected, don't render anything
  if (!buildMode || !selectedTemplateId || !template || !previewPosition) return null;
  
  return (
    <group 
      position={[previewPosition.x, previewPosition.y, previewPosition.z]}
      rotation={[0, previewRotation, 0]}
      onClick={handlePlacement}
    >
      {/* Building preview using BuildingModel */}
      <BuildingModel
        elementType={template.htmlElement}
        styles={{
          ...template.defaultStyles,
          opacity: 0.7, // Make preview semi-transparent
          color: isValid ? '#00ff00' : '#ff0000',
          emissive: isValid ? '#00ff00' : '#ff0000',
          emissiveIntensity: 0.5
        }}
        position={[0, 0, 0]}
        isHovered={false}
        isSelected={false}
        isActive={true}
        isError={!isValid}
      />
    </group>
  );
}

/**
 * Calculate building bounds adjusted for rotation
 */
function calculateBuildingBounds(
  position: Vector3,
  template: BuildingTemplate,
  rotation: number
): BuildingBounds {
  const halfWidth = template.gridSize.width / 2;
  const halfDepth = template.gridSize.depth / 2;
  
  // Adjust for rotation (using absolute values for accurate bounds)
  const rotatedHalfWidth = Math.abs(Math.cos(rotation) * halfWidth) + Math.abs(Math.sin(rotation) * halfDepth);
  const rotatedHalfDepth = Math.abs(Math.sin(rotation) * halfWidth) + Math.abs(Math.cos(rotation) * halfDepth);
  
  return {
    minX: position.x - rotatedHalfWidth,
    maxX: position.x + rotatedHalfWidth,
    minZ: position.z - rotatedHalfDepth,
    maxZ: position.z + rotatedHalfDepth
  };
}

/**
 * Check for collisions between buildings using AABB collision detection
 */
function checkCollisions(
  position: Vector3,
  template: BuildingTemplate,
  rotation: number,
  placedBuildings: PlacedBuilding[]
): boolean {
  // Get the bounds of the new building
  const newBuildingBounds = calculateBuildingBounds(position, template, rotation);
  
  // Check for overlap with existing buildings
  return placedBuildings.some(building => {
    // Get template for this building
    const buildingTemplate = buildingTemplates[building.templateId];
    if (!buildingTemplate) return false;
    
    // Get the bounds of the existing building
    const existingBuildingBounds = calculateBuildingBounds(
      new Vector3(building.position.x, building.position.y, building.position.z),
      buildingTemplate,
      building.rotation
    );
    
    // Check for overlap (AABB collision)
    return !(
      newBuildingBounds.minX > existingBuildingBounds.maxX ||
      newBuildingBounds.maxX < existingBuildingBounds.minX ||
      newBuildingBounds.minZ > existingBuildingBounds.maxZ ||
      newBuildingBounds.maxZ < existingBuildingBounds.minZ
    );
  });
} 