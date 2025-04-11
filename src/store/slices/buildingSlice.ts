import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import { BuildingEffect, PlacedBuilding } from '@/data/buildingTemplates';

// State interface for the building slice
interface BuildingState {
  // Buildings placed in the world
  placedBuildings: PlacedBuilding[];
  
  // Building placement mode
  buildMode: boolean;
  
  // Currently selected building template
  selectedTemplateId: string | null;
  
  // Currently selected placed building
  selectedBuildingId: string | null;
  
  // Preview position for building placement
  previewPosition: { x: number, y: number, z: number } | null;
  
  // Preview rotation for building placement
  previewRotation: number;
  
  // Available templates for building placement
  availableTemplates: string[];
  
  // Unlocked templates
  unlockedTemplates: string[];
}

// Initial state
const initialState: BuildingState = {
  placedBuildings: [],
  buildMode: false,
  selectedTemplateId: null,
  selectedBuildingId: null,
  previewPosition: null,
  previewRotation: 0,
  availableTemplates: [],
  unlockedTemplates: []
};

// Create the building slice
export const buildingSlice = createSlice({
  name: 'building',
  initialState,
  reducers: {
    // Place a new building
    placeBuilding: (state, action: PayloadAction<{
      templateId: string;
      position: { x: number, y: number, z: number };
      rotation: number;
      effects?: BuildingEffect[];
    }>) => {
      const { templateId, position, rotation, effects } = action.payload;
      
      // Create new building
      const newBuilding: PlacedBuilding = {
        id: uuidv4(),
        templateId,
        position,
        rotation,
        status: 'construction',
        constructionProgress: 0,
        health: 100,
        efficiency: 1,
        effects: effects || []
      };
      
      // Add to placed buildings
      state.placedBuildings.push(newBuilding);
      
      // Exit build mode after placement
      state.buildMode = false;
      state.selectedTemplateId = null;
      state.previewPosition = null;
    },
    
    // Remove a building
    demolishBuilding: (state, action: PayloadAction<string>) => {
      state.placedBuildings = state.placedBuildings.filter(
        building => building.id !== action.payload
      );
      
      // Clear selection if the demolished building was selected
      if (state.selectedBuildingId === action.payload) {
        state.selectedBuildingId = null;
      }
    },
    
    // Update building construction progress
    updateConstructionProgress: (state, action: PayloadAction<{
      buildingId: string;
      progress: number;
    }>) => {
      const { buildingId, progress } = action.payload;
      const building = state.placedBuildings.find(b => b.id === buildingId);
      
      if (building) {
        building.constructionProgress = Math.min(1, Math.max(0, progress));
        
        // Complete construction if progress is 100%
        if (building.constructionProgress >= 1) {
          building.status = 'active';
        }
      }
    },
    
    // Update building status
    setBuildingStatus: (state, action: PayloadAction<{
      buildingId: string;
      status: 'construction' | 'active' | 'inactive' | 'damaged';
    }>) => {
      const { buildingId, status } = action.payload;
      const building = state.placedBuildings.find(b => b.id === buildingId);
      
      if (building) {
        building.status = status;
      }
    },
    
    // Update building health
    updateBuildingHealth: (state, action: PayloadAction<{
      buildingId: string;
      health: number;
    }>) => {
      const { buildingId, health } = action.payload;
      const building = state.placedBuildings.find(b => b.id === buildingId);
      
      if (building) {
        building.health = Math.min(100, Math.max(0, health));
        
        // Set damaged status if health is low
        if (building.health < 25 && building.status !== 'damaged') {
          building.status = 'damaged';
        }
      }
    },
    
    // Update building efficiency
    updateBuildingEfficiency: (state, action: PayloadAction<{
      buildingId: string;
      efficiency: number;
    }>) => {
      const { buildingId, efficiency } = action.payload;
      const building = state.placedBuildings.find(b => b.id === buildingId);
      
      if (building) {
        building.efficiency = Math.min(1, Math.max(0, efficiency));
      }
    },
    
    // Update building position (for moving buildings)
    updateBuildingPosition: (state, action: PayloadAction<{
      buildingId: string;
      position: { x: number, y: number, z: number };
    }>) => {
      const { buildingId, position } = action.payload;
      const building = state.placedBuildings.find(b => b.id === buildingId);
      
      if (building) {
        building.position = position;
      }
    },
    
    // Update building rotation
    updateBuildingRotation: (state, action: PayloadAction<{
      buildingId: string;
      rotation: number;
    }>) => {
      const { buildingId, rotation } = action.payload;
      const building = state.placedBuildings.find(b => b.id === buildingId);
      
      if (building) {
        building.rotation = rotation;
      }
    },
    
    // Select a placed building
    selectBuilding: (state, action: PayloadAction<string | null>) => {
      state.selectedBuildingId = action.payload;
      
      // Exit build mode when selecting a building
      if (action.payload) {
        state.buildMode = false;
        state.selectedTemplateId = null;
      }
    },
    
    // Toggle build mode
    toggleBuildMode: (state, action: PayloadAction<boolean | undefined>) => {
      // If a value is provided, set it directly, otherwise toggle
      state.buildMode = action.payload !== undefined ? action.payload : !state.buildMode;
      
      // Clear selection when entering build mode
      if (state.buildMode) {
        state.selectedBuildingId = null;
      } else {
        state.selectedTemplateId = null;
        state.previewPosition = null;
      }
    },
    
    // Select a building template for placement
    setSelectedTemplateId: (state, action: PayloadAction<string | null>) => {
      state.selectedTemplateId = action.payload;
      
      // Enter build mode when selecting a template
      if (action.payload) {
        state.buildMode = true;
        state.selectedBuildingId = null;
      }
    },
    
    // Update preview position for building placement
    updatePreviewPosition: (state, action: PayloadAction<{ x: number, y: number, z: number } | null>) => {
      state.previewPosition = action.payload;
    },
    
    // Rotate building preview
    rotatePreview: (state) => {
      // Rotate in 90-degree increments (Math.PI/2 radians)
      state.previewRotation = (state.previewRotation + Math.PI/2) % (Math.PI * 2);
    },
    
    // Cancel building placement
    cancelPlacement: (state) => {
      state.buildMode = false;
      state.selectedTemplateId = null;
      state.previewPosition = null;
    },
    
    // Connect a building to HTML node (for code-to-building mapping)
    connectBuildingToHtml: (state, action: PayloadAction<{
      buildingId: string;
      htmlNodeRef: string;
      cssRef?: string;
    }>) => {
      const { buildingId, htmlNodeRef, cssRef } = action.payload;
      const building = state.placedBuildings.find(b => b.id === buildingId);
      
      if (building) {
        building.htmlNodeRef = htmlNodeRef;
        if (cssRef) building.cssRef = cssRef;
      }
    },
    
    // Set available templates for building placement
    setAvailableTemplates: (state, action: PayloadAction<string[]>) => {
      state.availableTemplates = action.payload;
    },
    
    // Unlock a new building template
    unlockBuilding: (state, action: PayloadAction<string>) => {
      if (!state.unlockedTemplates.includes(action.payload)) {
        state.unlockedTemplates.push(action.payload);
      }
    }
  }
});

// Export actions
export const {
  placeBuilding,
  demolishBuilding,
  updateConstructionProgress,
  setBuildingStatus,
  updateBuildingHealth,
  updateBuildingEfficiency,
  updateBuildingPosition,
  updateBuildingRotation,
  selectBuilding,
  toggleBuildMode,
  setSelectedTemplateId,
  updatePreviewPosition,
  rotatePreview,
  cancelPlacement,
  connectBuildingToHtml,
  setAvailableTemplates,
  unlockBuilding
} = buildingSlice.actions;

// Export reducer
export default buildingSlice.reducer; 