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
              // Add status-based colors
              emissive: isSelected ? '#3b82f6' : // Blue for selected
                      building.status === 'damaged' ? '#ef4444' : // Red for damaged
                      building.status === 'inactive' ? '#6b7280' : // Gray for inactive
                      building.status === 'construction' ? '#f59e0b' : // Orange for construction
                      '#10b981', // Green for active
              emissiveIntensity: isSelected ? 0.5 : 0.3,
              // Add status-based effects
              wireframe: building.status === 'construction',
              transparent: building.status !== 'active',
              metalness: building.status === 'active' ? 0.8 : 0.3,
              roughness: building.status === 'damaged' ? 0.9 : 0.4
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
          >
            {/* Add status indicators */}
            {building.status === 'construction' && (
              <mesh position={[0, template.gridSize.height + 1, 0]}>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
              </mesh>
            )}
            {building.status === 'damaged' && (
              <mesh position={[0, template.gridSize.height + 1, 0]}>
                <sphereGeometry args={[0.3]} />
                <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
              </mesh>
            )}
          </BuildingModel>
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