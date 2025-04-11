import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ResourceGenerator {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  outputRate: number;
  resourceType: 'energy' | 'minerals' | 'water' | 'food';
  status: 'active' | 'inactive' | 'damaged';
  efficiency: number;
  lastCollection: number;
  customizations?: {
    color?: string;
    scale?: number;
    model?: string;
  };
}

export interface ResourceFlow {
  id: string;
  from: {
    id: string;
    type: string;
    position: [number, number, number];
  };
  to: {
    id: string;
    type: string;
    position: [number, number, number];
  };
  resourceType: 'energy' | 'minerals' | 'water' | 'food';
  amount: number;
  active: boolean;
}

interface ResourceState {
  generators: ResourceGenerator[];
  flows: ResourceFlow[];
  storage: {
    energy: number;
    minerals: number;
    water: number;
    food: number;
  };
  capacity: {
    energy: number;
    minerals: number;
    water: number;
    food: number;
  };
  productionRates: {
    energy: number;
    minerals: number;
    water: number;
    food: number;
  };
  consumptionRates: {
    energy: number;
    minerals: number;
    water: number;
    food: number;
  };
}

const initialState: ResourceState = {
  generators: [],
  flows: [],
  storage: {
    energy: 100,
    minerals: 50,
    water: 100,
    food: 50
  },
  capacity: {
    energy: 1000,
    minerals: 500,
    water: 1000,
    food: 500
  },
  productionRates: {
    energy: 0,
    minerals: 0,
    water: 0,
    food: 0
  },
  consumptionRates: {
    energy: 0,
    minerals: 0,
    water: 0,
    food: 0
  }
};

export const resourceSlice = createSlice({
  name: 'resource',
  initialState,
  reducers: {
    addGenerator: (state, action: PayloadAction<ResourceGenerator>) => {
      state.generators.push(action.payload);
      // Update production rates
      state.productionRates[action.payload.resourceType] += 
        action.payload.outputRate * action.payload.efficiency;
    },

    removeGenerator: (state, action: PayloadAction<string>) => {
      const generator = state.generators.find(g => g.id === action.payload);
      if (generator) {
        // Update production rates before removing
        state.productionRates[generator.resourceType] -=
          generator.outputRate * generator.efficiency;
      }
      state.generators = state.generators.filter(g => g.id !== action.payload);
    },

    updateGenerator: (state, action: PayloadAction<{
      id: string;
      updates: Partial<ResourceGenerator>;
    }>) => {
      const generator = state.generators.find(g => g.id === action.payload.id);
      if (generator) {
        const oldRate = generator.outputRate * generator.efficiency;
        Object.assign(generator, action.payload.updates);
        const newRate = generator.outputRate * generator.efficiency;
        
        // Update production rates if output changed
        if (oldRate !== newRate) {
          state.productionRates[generator.resourceType] += (newRate - oldRate);
        }
      }
    },

    addResourceFlow: (state, action: PayloadAction<ResourceFlow>) => {
      state.flows.push(action.payload);
    },

    removeResourceFlow: (state, action: PayloadAction<string>) => {
      state.flows = state.flows.filter(f => f.id !== action.payload);
    },

    updateResourceFlow: (state, action: PayloadAction<{
      id: string;
      updates: Partial<ResourceFlow>;
    }>) => {
      const flow = state.flows.find(f => f.id === action.payload.id);
      if (flow) {
        Object.assign(flow, action.payload.updates);
      }
    },

    addResources: (state, action: PayloadAction<{
      type: keyof ResourceState['storage'];
      amount: number;
    }>) => {
      const { type, amount } = action.payload;
      state.storage[type] = Math.min(
        state.storage[type] + amount,
        state.capacity[type]
      );
    },

    consumeResources: (state, action: PayloadAction<{
      type: keyof ResourceState['storage'];
      amount: number;
    }>) => {
      const { type, amount } = action.payload;
      state.storage[type] = Math.max(
        state.storage[type] - amount,
        0
      );
    },

    updateCapacity: (state, action: PayloadAction<{
      type: keyof ResourceState['capacity'];
      amount: number;
    }>) => {
      const { type, amount } = action.payload;
      state.capacity[type] = Math.max(amount, 0);
      // Ensure storage doesn't exceed new capacity
      state.storage[type] = Math.min(state.storage[type], amount);
    },

    updateConsumptionRate: (state, action: PayloadAction<{
      type: keyof ResourceState['consumptionRates'];
      amount: number;
    }>) => {
      const { type, amount } = action.payload;
      state.consumptionRates[type] = Math.max(amount, 0);
    },

    resetResources: (state) => {
      Object.assign(state, initialState);
    },
    
    processTick: (state, action: PayloadAction<number>) => {
      const deltaTime = action.payload;
      
      // Process resource production from generators
      state.generators.forEach(generator => {
        if (generator.status === 'active') {
          const production = generator.outputRate * generator.efficiency * deltaTime;
          state.storage[generator.resourceType] = Math.min(
            state.storage[generator.resourceType] + production,
            state.capacity[generator.resourceType]
          );
        }
      });

      // Process resource consumption
      Object.entries(state.consumptionRates).forEach(([resource, rate]) => {
        const resourceType = resource as keyof ResourceState['storage'];
        const consumption = rate * deltaTime;
        state.storage[resourceType] = Math.max(
          state.storage[resourceType] - consumption,
          0
        );
      });
    }
  }
});

export const {
  addGenerator,
  removeGenerator,
  updateGenerator,
  addResourceFlow,
  removeResourceFlow,
  updateResourceFlow,
  addResources,
  consumeResources,
  updateCapacity,
  updateConsumptionRate,
  resetResources,
  processTick
} = resourceSlice.actions;

export default resourceSlice.reducer; 