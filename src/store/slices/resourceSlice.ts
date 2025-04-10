import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Resource {
  id: string;
  name: string;
  amount: number;
  capacity: number;
  generationRate: number; // per second
  icon: string;
  color: string;
}

interface ResourceState {
  resources: {
    [key: string]: Resource;
  };
  lastTickTime: number;
}

const initialResources: { [key: string]: Resource } = {
  energy: {
    id: 'energy',
    name: 'Energy',
    amount: 100,
    capacity: 1000,
    generationRate: 1,
    icon: '⚡',
    color: '#FFD700'
  },
  code: {
    id: 'code',
    name: 'Code Fragments',
    amount: 50,
    capacity: 500,
    generationRate: 0.5,
    icon: '⌨️',
    color: '#4CAF50'
  },
  data: {
    id: 'data',
    name: 'Data Crystals',
    amount: 25,
    capacity: 200,
    generationRate: 0.2,
    icon: '💾',
    color: '#2196F3'
  }
};

const initialState: ResourceState = {
  resources: initialResources,
  lastTickTime: Date.now()
};

export const resourceSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    updateResource: (
      state,
      action: PayloadAction<{ id: string; amount: number }>
    ) => {
      const resource = state.resources[action.payload.id];
      if (resource) {
        resource.amount = Math.max(
          0,
          Math.min(resource.amount + action.payload.amount, resource.capacity)
        );
      }
    },
    setResourceCapacity: (
      state,
      action: PayloadAction<{ id: string; capacity: number }>
    ) => {
      const resource = state.resources[action.payload.id];
      if (resource) {
        resource.capacity = action.payload.capacity;
        resource.amount = Math.min(resource.amount, resource.capacity);
      }
    },
    setGenerationRate: (
      state,
      action: PayloadAction<{ id: string; rate: number }>
    ) => {
      const resource = state.resources[action.payload.id];
      if (resource) {
        resource.generationRate = action.payload.rate;
      }
    },
    processTick: (state) => {
      const currentTime = Date.now();
      const deltaTime = (currentTime - state.lastTickTime) / 1000; // Convert to seconds

      Object.values(state.resources).forEach(resource => {
        const generation = resource.generationRate * deltaTime;
        resource.amount = Math.min(
          resource.amount + generation,
          resource.capacity
        );
      });

      state.lastTickTime = currentTime;
    }
  }
});

export const {
  updateResource,
  setResourceCapacity,
  setGenerationRate,
  processTick
} = resourceSlice.actions;

export default resourceSlice.reducer; 