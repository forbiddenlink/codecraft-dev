// File: /src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import editorReducer from './slices/editorSlice';

const store = configureStore({
  reducer: {
    editor: editorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
export { store };
