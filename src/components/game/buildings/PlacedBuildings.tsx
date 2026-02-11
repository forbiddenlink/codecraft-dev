'use client';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { buildingTemplates } from '@/data/buildingTemplates';
import { selectBuilding } from '@/store/slices/buildingSlice';
import BuildingModel from './BuildingModel';
import BuildingDetailsPanel from './BuildingDetailsPanel';

interface PlacedBuilding {
  id: string;
  templateId: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: number;
  status: 'construction' | 'active' | 'damaged' | 'inactive';
}

export default function PlacedBuildings() {
  const dispatch = useAppDispatch();
  const placedBuildings = useAppSelector(state => state.building.placedBuildings);
  const selectedBuildingId = useAppSelector(state => state.building.selectedBuildingId);
  
  // Handle building selection
  const handleSelectBuilding = (buildingId: string) => {
    dispatch(selectBuilding(buildingId === selectedBuildingId ? null : buildingId));
  };
  
  // If no buildings placed, don't render anything
  if (!placedBuildings || placedBuildings.length === 0) return null;
  
  return (
    <group>
      {/* Render all placed buildings */}
      {placedBuildings.map((building: PlacedBuilding) => {
        const template = buildingTemplates[building.templateId];
        if (!template) return null;
        
        const isSelected = building.id === selectedBuildingId;
        
        return (
          <BuildingModel
            key={building.id}
            elementType={template.htmlElement}
            styles={{
              ...template.defaultStyles,
              // Add any custom styling based on building status
              opacity: building.status === 'construction' ? 0.7 : 1,
            }}
            position={[building.position.x, building.position.y, building.position.z]}
            rotation={[0, building.rotation, 0]}
            scale={[1, 1, 1]}
            isHovered={false}
            isSelected={isSelected}
            isActive={building.status === 'active'}
            isError={building.status === 'damaged'}
            textContent={template.name}
            onClick={() => handleSelectBuilding(building.id)}
          />
        );
      })}
      
      {/* Details panel for selected building */}
      {selectedBuildingId && (
        <BuildingDetailsPanel
          buildingId={selectedBuildingId}
          onClose={() => handleSelectBuilding(selectedBuildingId)}
        />
      )}
    </group>
  );
} 