import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlockedAt: number | null;
}

export interface UserProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  unlockedBuildings: string[];
  unlockedFeatures: string[];
  completedChallenges: string[];
  achievements: Record<string, Achievement>;
  justUnlocked: string[]; // Recently unlocked items/features
  lastSave: number;
  tutorialProgress: {
    completed: string[];
    current: string | null;
  };
}

interface UserState {
  id: string | null;
  username: string | null;
  progress: UserProgress;
  preferences: {
    soundEnabled: boolean;
    musicVolume: number;
    sfxVolume: number;
    tutorialsEnabled: boolean;
    theme: 'light' | 'dark' | 'system';
  };
}

const initialState: UserState = {
  id: null,
  username: null,
  progress: {
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    unlockedBuildings: ['basicHabitat'],
    unlockedFeatures: ['building', 'coding'],
    completedChallenges: [],
    achievements: {},
    justUnlocked: [],
    lastSave: Date.now(),
    tutorialProgress: {
      completed: [],
      current: null
    }
  },
  preferences: {
    soundEnabled: true,
    musicVolume: 0.7,
    sfxVolume: 1.0,
    tutorialsEnabled: true,
    theme: 'system'
  }
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id: string; username: string }>) => {
      state.id = action.payload.id;
      state.username = action.payload.username;
    },

    gainXP: (state, action: PayloadAction<number>) => {
      state.progress.xp += action.payload;
      
      // Level up if enough XP
      while (state.progress.xp >= state.progress.xpToNextLevel) {
        state.progress.xp -= state.progress.xpToNextLevel;
        state.progress.level += 1;
        state.progress.xpToNextLevel = Math.floor(state.progress.xpToNextLevel * 1.5);
      }
    },

    unlockBuilding: (state, action: PayloadAction<string>) => {
      if (!state.progress.unlockedBuildings.includes(action.payload)) {
        state.progress.unlockedBuildings.push(action.payload);
        state.progress.justUnlocked.push(action.payload);
      }
    },

    unlockFeature: (state, action: PayloadAction<string>) => {
      if (!state.progress.unlockedFeatures.includes(action.payload)) {
        state.progress.unlockedFeatures.push(action.payload);
        state.progress.justUnlocked.push(action.payload);
      }
    },

    completeChallenge: (state, action: PayloadAction<string>) => {
      if (!state.progress.completedChallenges.includes(action.payload)) {
        state.progress.completedChallenges.push(action.payload);
      }
    },

    unlockAchievement: (state, action: PayloadAction<Achievement>) => {
      if (!state.progress.achievements[action.payload.id]) {
        state.progress.achievements[action.payload.id] = {
          ...action.payload,
          unlockedAt: Date.now()
        };
      }
    },

    clearJustUnlocked: (state) => {
      state.progress.justUnlocked = [];
    },

    updatePreferences: (state, action: PayloadAction<Partial<UserState['preferences']>>) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload
      };
    },

    completeTutorial: (state, action: PayloadAction<string>) => {
      if (!state.progress.tutorialProgress.completed.includes(action.payload)) {
        state.progress.tutorialProgress.completed.push(action.payload);
      }
      if (state.progress.tutorialProgress.current === action.payload) {
        state.progress.tutorialProgress.current = null;
      }
    },

    setCurrentTutorial: (state, action: PayloadAction<string | null>) => {
      state.progress.tutorialProgress.current = action.payload;
    },

    resetProgress: (state) => {
      state.progress = {
        ...initialState.progress,
        lastSave: Date.now()
      };
    }
  }
});

export const {
  setUser,
  gainXP,
  unlockBuilding,
  unlockFeature,
  completeChallenge,
  unlockAchievement,
  clearJustUnlocked,
  updatePreferences,
  completeTutorial,
  setCurrentTutorial,
  resetProgress
} = userSlice.actions;

export default userSlice.reducer; 