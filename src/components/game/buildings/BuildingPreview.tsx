'use client';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import { Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHooks';
import { buildingTemplates } from '@/data/buildingTemplates';
import { placeBuilding, updatePreviewPosition, rotatePreview, cancelPlacement } from '@/store/slices/buildingSlice';
import { Box } from '@react-three/drei';

export default function BuildingPreview() {
  const dispatch = useAppDispatch();
  const { selectedTemplateId, placementMode, previewPosition, previewRotation } = useAppSelector(
    (state) => state.buildings
  );
  const [isValid, setIsValid] = useState(true);
  const previewRef = useRef<Mesh>(null);
  const materialRef = useRef<MeshStandardMaterial>(null);

  const template = selectedTemplateId ? buildingTemplates[selectedTemplateId] : null;

  useFrame((state) => {
    if (!placementMode || !selectedTemplateId || !template || !previewRef.current) return;

    // Update material based on validity
    if (materialRef.current) {
      materialRef.current.opacity = isValid ? 0.5 : 0.3;
      materialRef.current.color.setHex(isValid ? 0x00ff00 : 0xff0000);
    }

    // Ray casting to find ground intersection
    const raycaster = state.raycaster;
    const intersects = raycaster.intersectObjects(state.scene.children, true);
    
    const groundIntersect = intersects.find(
      (intersect) => intersect.object.name === 'ground'
    );

    if (groundIntersect) {
      const point = groundIntersect.point;
      // Snap to grid
      const snappedPosition = new Vector3(
        Math.round(point.x * 2) / 2,
        0,
        Math.round(point.z * 2) / 2
      );
      
      dispatch(updatePreviewPosition({
        x: snappedPosition.x,
        y: snappedPosition.y,
        z: snappedPosition.z,
      }));

      // Check if position is valid (no overlapping buildings, within bounds, etc.)
      // This is where we'll add collision detection later
      setIsValid(true);
    }
  });

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'r') {
      dispatch(rotatePreview());
    }
    if (event.key === 'Escape') {
      dispatch(cancelPlacement());
    }
  };

  const handleClick = () => {
    if (!isValid || !previewPosition || !template) return;

    dispatch(placeBuilding({
      id: `${template.id}-${Date.now()}`,
      templateId: template.id,
      position: previewPosition,
      rotation: previewRotation,
    }));
  };

  if (!placementMode || !selectedTemplateId || !template || !previewPosition) return null;

  return (
    <group
      position={[previewPosition.x, previewPosition.y, previewPosition.z]}
      rotation={[0, previewRotation, 0]}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <Box
        ref={previewRef}
        args={[
          template.gridSize.width,
          1,
          template.gridSize.height,
        ]}
      >
        <meshStandardMaterial
          ref={materialRef}
          transparent
          opacity={0.5}
          color={isValid ? 0x00ff00 : 0xff0000}
        />
      </Box>
    </group>
  );
} 