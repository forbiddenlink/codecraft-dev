// File: /src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import editorReducer from './slices/editorSlice';
import gameReducer from './slices/gameSlice';
import resourceReducer from './slices/resourceSlice';
import buildingReducer from './slices/buildingSlice';
import playerReducer from './slices/playerSlice';
import villagerReducer from './slices/villagerSlice';
import userReducer from './slices/userSlice';
import challengeReducer from './slices/challengeSlice';
import tutorialReducer from './slices/tutorialSlice';
import analyticsReducer from './slices/analyticsSlice';
import multiplayerReducer from './slices/multiplayerSlice';
import achievementReducer from './slices/achievementSlice';
import dialogueReducer from './slices/dialogueSlice';
import uiReducer from './slices/uiSlice';
import { soundMiddleware } from './middleware/soundMiddleware';

export const store = configureStore({
  reducer: {
    editor: editorReducer,
    game: gameReducer,
    resource: resourceReducer,
    building: buildingReducer,
    player: playerReducer,
    villagers: villagerReducer,
    user: userReducer,
    challenges: challengeReducer,
    tutorial: tutorialReducer,
    analytics: analyticsReducer,
    multiplayer: multiplayerReducer,
    achievement: achievementReducer,
    dialogue: dialogueReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(soundMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
