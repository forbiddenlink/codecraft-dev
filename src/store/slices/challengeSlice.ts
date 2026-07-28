import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Challenge progress only — challenge definitions live in src/data/challenges.ts
 * (validate functions are not Redux-serializable).
 */
interface ChallengeState {
  currentIndex: number;
  completed: string[];
  inProgress: string | null;
  lastCompletedAt: number | null;
}

const initialState: ChallengeState = {
  currentIndex: 0,
  completed: [],
  inProgress: null,
  lastCompletedAt: null,
};

export const challengeSlice = createSlice({
  name: 'challenges',
  initialState,
  reducers: {
    setCurrentChallenge: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0) {
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

    hydrateCompletedChallenges: (state, action: PayloadAction<string[]>) => {
      for (const id of action.payload) {
        if (!state.completed.includes(id)) {
          state.completed.push(id);
        }
      }
    },

    resetChallenges: (state) => {
      state.completed = [];
      state.inProgress = null;
      state.currentIndex = 0;
      state.lastCompletedAt = null;
    },
  },
});

export const {
  setCurrentChallenge,
  startChallenge,
  completeChallenge,
  hydrateCompletedChallenges,
  resetChallenges,
} = challengeSlice.actions;

export default challengeSlice.reducer;
