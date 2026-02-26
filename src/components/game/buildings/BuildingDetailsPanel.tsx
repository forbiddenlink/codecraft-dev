'use client';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { buildingTemplates } from '@/data/buildingTemplates';
import { 
  demolishBuilding, 
  setBuildingStatus, 
  updateBuildingEfficiency 
} from '@/store/slices/buildingSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { setLanguage, setCode } from '@/store/slices/editorSlice';
import { Html } from '@react-three/drei';

// Resource metadata for display
const RESOURCE_METADATA = {
  energy: {
    name: 'Energy',
    color: '#FFD700',
    icon: '⚡'
  },
  minerals: {
    name: 'Minerals',
    color: '#A0522D',
    icon: '💎'
  },
  water: {
    name: 'Water',
    color: '#4169E1',
    icon: '💧'
  },
  oxygen: {
    name: 'Oxygen',
    color: '#87CEEB',
    icon: '🫧'
  },
  food: {
    name: 'Food',
    color: '#32CD32',
    icon: '🌾'
  },
  colonists: {
    name: 'Colonists',
    color: '#FF6347',
    icon: '👤'
  },
  research: {
    name: 'Research',
    color: '#9370DB',
    icon: '🔬'
  }
};

interface BuildingDetailsPanelProps {
  buildingId: string | null;
  onClose: () => void;
  is3D?: boolean; // Whether to render as 3D HTML or 2D UI
}

export default function BuildingDetailsPanel({ 
  buildingId, 
  onClose,
  is3D = false
}: BuildingDetailsPanelProps) {
  const dispatch = useAppDispatch();
  
  // Get the selected building
  const building = useAppSelector(state =>
    buildingId ? state.building.placedBuildings.find((b: any) => b.id === buildingId) : null
  );
  
  // If no building or ID, don't render
  if (!building || !buildingId) return null;
  
  // Get the building template
  const template = buildingTemplates[building.templateId];
  if (!template) return null;
  
  // Handle demolishing the building
  const handleDemolish = () => {
    dispatch(demolishBuilding(buildingId));
    onClose();
  };
  
  // Handle toggling building status
  const handleToggleStatus = () => {
    dispatch(setBuildingStatus({
      buildingId,
      status: building.status === 'active' ? 'inactive' : 'active'
    }));
  };
  
  // Handle viewing the building's code
  const handleViewCode = () => {
    // Set code editor to HTML with the template's default code
    dispatch(setCode({ 
      language: 'html', 
      code: template.defaultHtml 
    }));
    
    // Close the panel
    onClose();
  };
  
  // Handle repairing the building
  const handleRepair = () => {
    // In a real implementation, this would check for resources
    // and trigger a repair process
    dispatch(updateBuildingEfficiency({
      buildingId,
      efficiency: 1
    }));
    
    dispatch(setBuildingStatus({
      buildingId,
      status: 'active'
    }));
  };
  
  // Status indicator color
  const statusColor = {
    active: 'bg-success',
    damaged: 'bg-error',
    inactive: 'bg-text-muted',
    construction: 'bg-warning'
  }[building.status] || 'bg-warning';

  // Health bar color
  const healthColor = building.health > 60
    ? 'bg-success'
    : building.health > 30
      ? 'bg-warning'
      : 'bg-error';

  // Panel content
  const panelContent = (
    <div className="panel w-[350px] p-6 text-text-secondary animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{template.icon}</span>
          <h2 className="text-h3">{template.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="btn-icon focus-ring"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Status */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
          <span className="text-body capitalize">{building.status}</span>

          {/* Efficiency */}
          <span className="ml-auto text-small">
            Efficiency: {Math.round(building.efficiency * 100)}%
          </span>
        </div>

        {/* Construction progress bar */}
        {building.status === 'construction' && (
          <div className="w-full bg-elevated rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="bg-success rounded-full h-2 transition-all duration-300"
              style={{ width: `${building.constructionProgress * 100}%` }}
            />
          </div>
        )}

        {/* Health bar */}
        <div className="w-full bg-elevated rounded-full h-2 overflow-hidden">
          <div
            className={`rounded-full h-2 transition-all duration-300 ${healthColor}`}
            style={{ width: `${building.health}%` }}
          />
        </div>
      </div>

      {/* Effects */}
      <div className="mb-5">
        <h3 className="text-h4 mb-3">Effects</h3>
        {building.effects && building.effects.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {building.effects.map((effect: any, index: number) => {
              const resourceMeta = (RESOURCE_METADATA as any)[effect.target];
              if (!resourceMeta) return null;

              return (
                <div
                  key={`${effect.type}-${effect.target}-${index}`}
                  className="flex items-center gap-2 bg-elevated p-2 rounded-md text-body"
                >
                  <span>{resourceMeta.icon}</span>
                  <span>
                    {effect.type === 'resource' && effect.value > 0 && '+'}
                    {effect.value}
                    {effect.type === 'efficiency' && 'x'}
                    {' '}{resourceMeta.name}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-small">No active effects</div>
        )}
      </div>

      {/* Technical */}
      <div className="mb-5 text-small space-y-1">
        <div>Position: {Math.round(building.position.x)}, {Math.round(building.position.z)}</div>
        <div>Rotation: {Math.round(building.rotation * (180/Math.PI))}°</div>
        <div>Template: {building.templateId}</div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {building.status !== 'construction' && (
          <button
            onClick={handleToggleStatus}
            className={`btn-secondary flex-1 focus-ring ${
              building.status === 'active'
                ? 'border-warning/30 hover:border-warning/50'
                : 'border-success/30 hover:border-success/50'
            }`}
          >
            {building.status === 'active' ? 'Deactivate' : 'Activate'}
          </button>
        )}

        {building.status === 'damaged' && (
          <button
            onClick={handleRepair}
            className="btn-primary flex-1 focus-ring"
          >
            Repair
          </button>
        )}

        <button
          onClick={handleViewCode}
          className="btn-secondary flex-1 focus-ring"
        >
          View Code
        </button>

        <button
          onClick={handleDemolish}
          className="btn-danger flex-1 focus-ring"
        >
          Demolish
        </button>
      </div>
    </div>
  );
  
  // Render as 3D HTML element if is3D is true
  if (is3D) {
    return (
      <Html
        position={[building.position.x, building.position.y + 3, building.position.z]}
        center
        distanceFactor={10}
        occlude={[]}
      >
        {panelContent}
      </Html>
    );
  }
  
  // Otherwise render as regular UI
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        {panelContent}
      </motion.div>
    </AnimatePresence>
  );
} 