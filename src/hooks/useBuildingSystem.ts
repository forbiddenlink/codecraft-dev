import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Vector3 } from 'three';
import { buildingSystem } from '@/game/systems/BuildingSystem';
import { RootState } from '@/store/store';
import { buildingTemplates } from '@/data/buildingTemplates';

export type ResourceType = 'energy' | 'minerals' | 'water' | 'food';

export interface BuildingPlacementError {
  type: 'collision' | 'resources' | 'invalid_position';
  message: string;
}

export const useBuildingSystem = (templateId: string) => {
  const [error, setError] = useState<BuildingPlacementError | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Get building template
  const template = buildingTemplates[templateId];
  
  // Get current resources from store
  const resources = useSelector((state: RootState) => state.resource.storage);

  /**
   * Check if we have sufficient resources to place the building
   */
  const checkResourceRequirements = useCallback(() => {
    if (!template) return false;

    return template.costs.every(cost => {
      const available = resources[cost.resourceId as ResourceType] || 0;
      return available >= cost.amount;
    });
  }, [template, resources]);

  /**
   * Start building placement mode
   */
  const startPlacement = useCallback(() => {
    setIsPlacing(true);
    setError(null);
  }, []);

  /**
   * Cancel building placement mode
   */
  const cancelPlacement = useCallback(() => {
    setIsPlacing(false);
    setError(null);
    setRotation(0);
  }, []);

  /**
   * Rotate the building preview
   */
  const rotateBuilding = useCallback(() => {
    setRotation((prev) => (prev + Math.PI / 2) % (Math.PI * 2));
  }, []);

  /**
   * Try to place the building at the given position
   */
  const tryPlaceBuilding = useCallback((position: Vector3) => {
    if (!template) {
      setError({ type: 'invalid_position', message: 'Invalid building template' });
      return null;
    }

    // Check resources first
    if (!checkResourceRequirements()) {
      setError({ type: 'resources', message: 'Insufficient resources' });
      return null;
    }

    // Try to place the building
    const buildingId = buildingSystem.placeBuilding(templateId, position, rotation);
    
    if (!buildingId) {
      setError({ type: 'collision', message: 'Invalid placement position' });
      return null;
    }

    // Success - reset state
    setIsPlacing(false);
    setError(null);
    setRotation(0);
    
    return buildingId;
  }, [templateId, rotation, template, checkResourceRequirements]);

  /**
   * Get missing resources for this building
   */
  const getMissingResources = useCallback(() => {
    if (!template) return [];

    return template.costs.filter(cost => {
      const available = resources[cost.resourceId as ResourceType] || 0;
      return available < cost.amount;
    }).map(cost => ({
      resourceId: cost.resourceId,
      required: cost.amount,
      available: resources[cost.resourceId as ResourceType] || 0
    }));
  }, [template, resources]);

  return {
    isPlacing,
    error,
    rotation,
    template,
    startPlacement,
    cancelPlacement,
    rotateBuilding,
    tryPlaceBuilding,
    checkResourceRequirements,
    getMissingResources
  };
}; 