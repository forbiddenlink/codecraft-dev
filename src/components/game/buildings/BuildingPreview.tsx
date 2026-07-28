'use client';

import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useState } from 'react';
import { Vector3 } from 'three';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import BuildingModel from './BuildingModel';
import { buildingTemplates } from '@/data/buildingTemplates';
import { buildingSystem } from '@/game/systems/BuildingSystem';
import {
  cancelPlacement,
  rotatePreview,
  updatePreviewPosition,
} from '@/store/slices/buildingSlice';
import { trackBuildingConstructed } from '@/utils/analytics';

interface BuildingPreviewProps {
  gridSnap?: boolean;
}

export default function BuildingPreview({ gridSnap = true }: BuildingPreviewProps) {
  const dispatch = useAppDispatch();
  const { selectedTemplateId, buildMode, previewRotation } = useAppSelector(
    (state) => state.building,
  );
  const resolvedTemplate = selectedTemplateId
    ? buildingTemplates[selectedTemplateId]
    : null;

  const [previewPosition, setPreviewPosition] = useState<Vector3 | null>(null);
  const [placementError, setPlacementError] = useState(false);

  useEffect(() => {
    if (!buildMode) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        dispatch(rotatePreview());
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        dispatch(cancelPlacement());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buildMode, dispatch]);

  useFrame((state) => {
    if (!buildMode || !selectedTemplateId || !resolvedTemplate) return;

    const intersects = state.raycaster.intersectObjects(state.scene.children, true);
    const groundIntersect = intersects.find(
      (intersect) => intersect.object.name === 'ground',
    );

    if (!groundIntersect) return;

    const point = groundIntersect.point;
    const gridSize = 2;
    const snapped = gridSnap
      ? new Vector3(
          Math.round(point.x / gridSize) * gridSize,
          0,
          Math.round(point.z / gridSize) * gridSize,
        )
      : new Vector3(point.x, 0, point.z);

    setPreviewPosition(snapped);
    dispatch(updatePreviewPosition({ x: snapped.x, y: snapped.y, z: snapped.z }));
  });

  const handlePlacement = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!previewPosition || !resolvedTemplate || !selectedTemplateId) return;

    const placedId = buildingSystem.placeBuilding(
      selectedTemplateId,
      previewPosition,
      previewRotation,
    );

    if (!placedId) {
      setPlacementError(true);
      return;
    }

    setPlacementError(false);
    void trackBuildingConstructed(
      selectedTemplateId,
      1,
      Object.fromEntries(resolvedTemplate.costs.map((c) => [c.resourceId, c.amount])),
    );
  };

  if (!buildMode || !selectedTemplateId || !resolvedTemplate || !previewPosition) {
    return null;
  }

  return (
    <group
      position={[previewPosition.x, previewPosition.y, previewPosition.z]}
      rotation={[0, previewRotation, 0]}
      onClick={handlePlacement}
    >
      <BuildingModel
        elementType={resolvedTemplate.htmlElement}
        styles={{
          ...resolvedTemplate.defaultStyles,
          opacity: 0.7,
          color: !placementError ? '#00ff00' : '#ff0000',
        }}
        position={[0, 0, 0]}
        isHovered={false}
        isSelected={false}
        isActive={true}
        isError={placementError}
      />
    </group>
  );
}
