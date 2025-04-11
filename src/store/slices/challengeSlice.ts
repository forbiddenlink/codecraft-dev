import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'building' | 'coding' | 'resource' | 'tutorial';
  requirements: {
    resources?: {
      energy?: number;
      minerals?: number;
      water?: number;
      food?: number;
    };
    buildings?: string[];
    code?: {
      language: 'html' | 'css' | 'javascript';
      template: string;
      tests: Array<{
        description: string;
        test: string;
      }>;
    };
  };
  rewards: {
    xp: number;
    resources?: {
      energy?: number;
      minerals?: number;
      water?: number;
      food?: number;
    };
    unlocks?: {
      buildings?: string[];
      features?: string[];
      villagers?: string[];
    };
  };
}

interface ChallengeState {
  availableChallenges: Challenge[];
  currentIndex: number;
  completed: string[];
  inProgress: string | null;
  lastCompletedAt: number | null;
}

const initialState: ChallengeState = {
  availableChallenges: [],
  currentIndex: 0,
  completed: [],
  inProgress: null,
  lastCompletedAt: null
};

export const challengeSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    setAvailableChallenges: (state, action: PayloadAction<Challenge[]>) => {
      state.availableChallenges = action.payload;
    },
    
    setCurrentChallenge: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.availableChallenges.length) {
        state.currentIndex = action.payload;
      }
    },
    
    startChallenge: (state, action: PayloadAction<string>) => {
      state.inProgress = action.payload;
    },
    
    completeChallenge: (state, action: PayloadAction<string>) => {
      if (!state.completed.includes(action.payload)) {
        state.completed.push(action.payload);
        state.lastCompletedAt = Date.now();
      }
      if (state.inProgress === action.payload) {
        state.inProgress = null;
      }
    },
    
    resetChallenges: (state) => {
      state.completed = [];
      state.inProgress = null;
      state.currentIndex = 0;
      state.lastCompletedAt = null;
    }
  }
});

export const {
  setAvailableChallenges,
  setCurrentChallenge,
  startChallenge,
  completeChallenge,
  resetChallenges
} = challengeSlice.actions;

export default challengeSlice.reducer; 