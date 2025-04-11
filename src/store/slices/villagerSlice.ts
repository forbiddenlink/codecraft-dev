import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Villager {
  id: string;
  name: string;
  role: string;
  skills: Array<{
    type: string;
    level: number;
  }>;
  location: {
    buildingId: string | null;
    position: { x: number; y: number; z: number };
  };
  status: 'idle' | 'working' | 'resting';
  happiness: number;
}

interface VillagerState {
  villagers: Record<string, Villager>;
  unlockedVillagers: string[];
  selectedVillagerId: string | null;
}

const initialState: VillagerState = {
  villagers: {},
  unlockedVillagers: [],
  selectedVillagerId: null
};

const villagerSlice = createSlice({
  name: 'villagers',
  initialState,
  reducers: {
    unlockVillager: (state, action: PayloadAction<string>) => {
      if (!state.unlockedVillagers.includes(action.payload)) {
        state.unlockedVillagers.push(action.payload);
      }
    },
    addVillager: (state, action: PayloadAction<Villager>) => {
      state.villagers[action.payload.id] = action.payload;
    },
    selectVillager: (state, action: PayloadAction<string | null>) => {
      state.selectedVillagerId = action.payload;
    },
    updateVillagerLocation: (state, action: PayloadAction<{
      villagerId: string;
      buildingId: string | null;
      position: { x: number; y: number; z: number };
    }>) => {
      const villager = state.villagers[action.payload.villagerId];
      if (villager) {
        villager.location = {
          buildingId: action.payload.buildingId,
          position: action.payload.position
        };
      }
    },
    updateVillagerStatus: (state, action: PayloadAction<{
      villagerId: string;
      status: Villager['status'];
    }>) => {
      const villager = state.villagers[action.payload.villagerId];
      if (villager) {
        villager.status = action.payload.status;
      }
    },
    updateVillagerHappiness: (state, action: PayloadAction<{
      villagerId: string;
      happiness: number;
    }>) => {
      const villager = state.villagers[action.payload.villagerId];
      if (villager) {
        villager.happiness = Math.max(0, Math.min(100, action.payload.happiness));
      }
    },
    removeVillager: (state, action: PayloadAction<string>) => {
      delete state.villagers[action.payload];
      state.unlockedVillagers = state.unlockedVillagers.filter(id => id !== action.payload);
      if (state.selectedVillagerId === action.payload) {
        state.selectedVillagerId = null;
      }
    }
  }
});

export const {
  unlockVillager,
  addVillager,
  selectVillager,
  updateVillagerLocation,
  updateVillagerStatus,
  updateVillagerHappiness,
  removeVillager
} = villagerSlice.actions;

export default villagerSlice.reducer; 