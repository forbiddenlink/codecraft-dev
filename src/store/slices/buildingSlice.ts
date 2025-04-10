import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PlacedBuilding } from '@/types/buildings';
import { buildingTemplates } from '@/data/buildingTemplates';

interface BuildingState {
  buildings: Record<string, PlacedBuilding>;
  selectedTemplateId: string | null;
  placementMode: boolean;
  previewPosition: { x: number; y: number; z: number } | null;
  previewRotation: number;
  constructionQueue: string[]; // Array of building IDs in construction
  lastUpdateTime: number;
}

const initialState: BuildingState = {
  buildings: {},
  selectedTemplateId: null,
  placementMode: false,
  previewPosition: null,
  previewRotation: 0,
  constructionQueue: [],
  lastUpdateTime: Date.now(),
};

export const buildingSlice = createSlice({
  name: 'buildings',
  initialState,
  reducers: {
    selectBuildingTemplate: (state, action: PayloadAction<string>) => {
      state.selectedTemplateId = action.payload;
      state.placementMode = true;
      state.previewPosition = null;
      state.previewRotation = 0;
    },

    updatePreviewPosition: (
      state,
      action: PayloadAction<{ x: number; y: number; z: number }>
    ) => {
      state.previewPosition = action.payload;
    },

    rotatePreview: (state) => {
      state.previewRotation = (state.previewRotation + Math.PI / 2) % (Math.PI * 2);
    },

    cancelPlacement: (state) => {
      state.selectedTemplateId = null;
      state.placementMode = false;
      state.previewPosition = null;
    },

    placeBuilding: (
      state,
      action: PayloadAction<{
        id: string;
        templateId: string;
        position: { x: number; y: number; z: number };
        rotation: number;
      }>
    ) => {
      const template = buildingTemplates[action.payload.templateId];
      if (!template) return;

      const newBuilding: PlacedBuilding = {
        id: action.payload.id,
        templateId: action.payload.templateId,
        position: action.payload.position,
        rotation: action.payload.rotation,
        html: template.htmlTemplate,
        css: template.cssTemplate,
        js: template.jsTemplate,
        status: 'construction',
        constructionProgress: 0,
        health: 100,
        effects: template.effects,
      };

      state.buildings[action.payload.id] = newBuilding;
      state.constructionQueue.push(action.payload.id);
      state.selectedTemplateId = null;
      state.placementMode = false;
      state.previewPosition = null;
    },

    updateBuildingCode: (
      state,
      action: PayloadAction<{
        buildingId: string;
        html?: string;
        css?: string;
        js?: string;
      }>
    ) => {
      const building = state.buildings[action.payload.buildingId];
      if (!building) return;

      if (action.payload.html !== undefined) {
        building.html = action.payload.html;
      }
      if (action.payload.css !== undefined) {
        building.css = action.payload.css;
      }
      if (action.payload.js !== undefined) {
        building.js = action.payload.js;
      }
    },

    processConstructionTick: (state) => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - state.lastUpdateTime) / 1000; // Convert to seconds

      state.constructionQueue = state.constructionQueue.filter(buildingId => {
        const building = state.buildings[buildingId];
        if (!building || building.status !== 'construction') return false;

        const template = buildingTemplates[building.templateId];
        if (!template) return false;

        building.constructionProgress += deltaTime / template.buildTime;

        if (building.constructionProgress >= 1) {
          building.constructionProgress = 1;
          building.status = 'active';
          return false;
        }

        return true;
      });

      state.lastUpdateTime = currentTime;
    },

    demolishBuilding: (state, action: PayloadAction<string>) => {
      delete state.buildings[action.payload];
      state.constructionQueue = state.constructionQueue.filter(
        id => id !== action.payload
      );
    },
  },
});

export const {
  selectBuildingTemplate,
  updatePreviewPosition,
  rotatePreview,
  cancelPlacement,
  placeBuilding,
  updateBuildingCode,
  processConstructionTick,
  demolishBuilding,
} = buildingSlice.actions;

export default buildingSlice.reducer; 