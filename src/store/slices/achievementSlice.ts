/**
 * Achievement Redux Slice
 * Manages achievement unlock state and notifications
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  unlockedAt?: Date;
  progress?: number;
  isUnlocked: boolean;
  requirement: string;
}

interface AchievementState {
  achievements: Achievement[];
  pendingUnlock: Achievement | null;
  showToast: Achievement | null;
  showProgress: boolean;
}

const initialState: AchievementState = {
  achievements: [],
  pendingUnlock: null,
  showToast: null,
  showProgress: false,
};

const achievementSlice = createSlice({
  name: 'achievement',
  initialState,
  reducers: {
    initializeAchievements: (state, action: PayloadAction<Achievement[]>) => {
      state.achievements = action.payload;
    },
    unlockAchievement: (state, action: PayloadAction<string>) => {
      const achievement = state.achievements.find((a) => a.id === action.payload);
      if (achievement && !achievement.isUnlocked) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
        achievement.progress = 100;
        state.pendingUnlock = achievement;
      }
    },
    updateAchievementProgress: (
      state,
      action: PayloadAction<{ id: string; progress: number }>
    ) => {
      const achievement = state.achievements.find((a) => a.id === action.payload.id);
      if (achievement && !achievement.isUnlocked) {
        achievement.progress = action.payload.progress;
      }
    },
    dismissUnlock: (state) => {
      if (state.pendingUnlock) {
        state.showToast = state.pendingUnlock;
      }
      state.pendingUnlock = null;
    },
    dismissToast: (state) => {
      state.showToast = null;
    },
    toggleAchievementProgress: (state) => {
      state.showProgress = !state.showProgress;
    },
  },
});

export const {
  initializeAchievements,
  unlockAchievement,
  updateAchievementProgress,
  dismissUnlock,
  dismissToast,
  toggleAchievementProgress,
} = achievementSlice.actions;
export default achievementSlice.reducer;
