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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
