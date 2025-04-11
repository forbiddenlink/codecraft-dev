'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { buildingTemplates } from '@/data/buildingTemplates';
import { 
  toggleBuildMode,
  setSelectedTemplateId
} from '@/store/slices/buildingSlice';
import { setCode, setLanguage } from '@/store/slices/editorSlice';

// Building categories
const CATEGORIES = [
  { id: 'habitat', name: 'Habitat', icon: '🏠' },
  { id: 'production', name: 'Production', icon: '⚙️' },
  { id: 'storage', name: 'Storage', icon: '📦' },
  { id: 'research', name: 'Research', icon: '🧪' },
  { id: 'special', name: 'Special', icon: '✨' }
];

export default function BuildingMenu() {
  const dispatch = useAppDispatch();
  const selectedTemplateId = useAppSelector(state => state.building.selectedTemplateId);
  const isBuildModeActive = useAppSelector(state => state.building.buildMode);
  const playerLevel = useAppSelector(state => state.user.level);
  const completedChallenges = useAppSelector(state => state.user.completedChallenges);
  
  const [activeCategory, setActiveCategory] = useState('habitat');
  
  // Filter buildings by category and player level
  const availableBuildings = Object.entries(buildingTemplates)
    .filter(([, template]) => {
      // Check category
      if (template.category !== activeCategory) return false;
      
      // Check player level
      if (template.requiredLevel > playerLevel) return false;
      
      // Check unlock requirement if any
      if (template.unlockRequirement) {
        if (template.unlockRequirement.type === 'level') {
          if ((template.unlockRequirement.value as number) > playerLevel) return false;
        }
        else if (template.unlockRequirement.type === 'challenge') {
          if (!completedChallenges.includes(template.unlockRequirement.value as string)) return false;
        }
      }
      
      return true;
    });

  // Handle building selection
  const handleBuildingSelect = (templateId: string) => {
    // Toggle if already selected
    if (selectedTemplateId === templateId) {
      dispatch(setSelectedTemplateId(null));
      dispatch(toggleBuildMode(false));
      return;
    }
    
    // Set selected template
    dispatch(setSelectedTemplateId(templateId));
    dispatch(toggleBuildMode(true));
    
    // Get building template
    const template = buildingTemplates[templateId];
    
    // Insert template code into editor
    if (template) {
      // Set HTML editor and insert template code
      dispatch(setLanguage('html'));
      dispatch(setCode(template.defaultHtml));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 bg-opacity-90 p-4 rounded-lg shadow-lg text-white w-[300px]"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🏗️</span>
        <h2 className="text-lg font-bold">Buildings</h2>
      </div>

      {/* Building Categories */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 text-sm ${
              activeCategory === category.id
                ? 'bg-blue-700'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Building List */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {availableBuildings.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            No buildings available in this category yet.
            <div className="mt-2 text-sm">
              Complete more challenges to unlock buildings!
            </div>
          </div>
        ) : (
          availableBuildings.map(([id, template]) => (
            <motion.div
              key={id}
              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                selectedTemplateId === id
                  ? 'bg-blue-600'
                  : 'bg-gray-800 hover:bg-gray-700'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBuildingSelect(id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{template.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-300">{template.description}</p>
                </div>
              </div>

              {/* Resource Costs */}
              <div className="mt-2 flex flex-wrap gap-2">
                {template.costs.map((cost, index) => (
                  <span 
                    key={`${cost.resourceId}-${index}`} 
                    className="px-2 py-1 bg-gray-700 rounded-md text-sm flex items-center gap-1"
                    title={`${cost.resourceId.charAt(0).toUpperCase() + cost.resourceId.slice(1)}`}
                  >
                    {getResourceIcon(cost.resourceId)} {cost.amount}
                  </span>
                ))}
              </div>
              
              {/* Building Effects */}
              {template.effects?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {template.effects.map((effect, index) => (
                    <span 
                      key={`${effect.type}-${effect.target}-${index}`} 
                      className="px-2 py-1 bg-gray-700 rounded-md text-sm flex items-center gap-1"
                      title={`${effect.type === 'resource' ? 'Produces' : effect.type}`}
                    >
                      {effect.type === 'resource' && effect.value > 0 && '+'}
                      {effect.value}
                      {effect.type === 'efficiency' && 'x'} {getResourceIcon(effect.target)}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
      
      {/* Build Mode Indicator */}
      {isBuildModeActive && selectedTemplateId && (
        <div className="mt-4 bg-blue-800 p-2 rounded text-center">
          <div className="font-semibold">Build Mode Active</div>
          <div className="text-sm">Click on the ground to place building</div>
          <div className="text-xs mt-1">Press [R] to rotate • [ESC] to cancel</div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </motion.div>
  );
}

// Helper function to get resource icon
function getResourceIcon(resourceId: string): string {
  switch (resourceId) {
    case 'energy': return '⚡';
    case 'minerals': return '💎';
    case 'water': return '💧';
    case 'oxygen': return '🫧';
    case 'food': return '🌾';
    case 'colonists': return '👤';
    case 'research': return '🔬';
    default: return '📦';
  }
} 