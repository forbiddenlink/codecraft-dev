// File: /src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import editorReducer from './slices/editorSlice';
import gameReducer from './slices/gameSlice';
import resourceReducer from './slices/resourceSlice';
import buildingReducer from './slices/buildingSlice';

const store = configureStore({
  reducer: {
    editor: editorReducer,
    game: gameReducer,
    resources: resourceReducer,
    buildings: buildingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
export { store };
