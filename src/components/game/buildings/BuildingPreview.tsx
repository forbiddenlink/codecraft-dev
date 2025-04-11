'use client';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { useState, useEffect } from 'react';
import { Vector3 } from 'three';
import { useAppSelector } from '@/store/hooks';
import BuildingModel from './BuildingModel';
import { useBuildingSystem } from '@/hooks/useBuildingSystem';

interface BuildingPreviewProps {
  gridSnap?: boolean;
}

export default function BuildingPreview({ gridSnap = true }: BuildingPreviewProps) {
  const { selectedTemplateId, buildMode } = useAppSelector(state => state.building);
  
  const {
    error,
    rotation,
    template,
    rotateBuilding,
    tryPlaceBuilding,
    cancelPlacement
  } = useBuildingSystem(selectedTemplateId || '');
  
  const [previewPosition, setPreviewPosition] = useState<Vector3 | null>(null);
  
  // Handle keyboard events for preview manipulation
  useEffect(() => {
    if (!buildMode) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R') {
        rotateBuilding();
      }
      if (event.key === 'Escape') {
        cancelPlacement();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buildMode, rotateBuilding, cancelPlacement]);
  
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
      
      setPreviewPosition(snappedPosition);
    }
  });
  
  // Handle placement on mouse click
  const handlePlacement = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    
    if (!previewPosition || !template) return;
    
    tryPlaceBuilding(previewPosition);
  };
  
  // If not in build mode or no template selected, don't render anything
  if (!buildMode || !selectedTemplateId || !template || !previewPosition) return null;
  
  return (
    <group 
      position={[previewPosition.x, previewPosition.y, previewPosition.z]}
      rotation={[0, rotation, 0]}
      onClick={handlePlacement}
    >
      <BuildingModel
        elementType={template.htmlElement}
        styles={{
          ...template.defaultStyles,
          opacity: 0.7, // Make preview semi-transparent
          color: !error ? '#00ff00' : '#ff0000'
        }}
        position={[0, 0, 0]}
        isHovered={false}
        isSelected={false}
        isActive={true}
        isError={!!error}
      />
    </group>
  );
} 