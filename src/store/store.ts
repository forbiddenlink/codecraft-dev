// File: /src/store/store.ts
import { configureStore } from '@reduxjs/toolkit'
import { soundMiddleware } from './middleware/soundMiddleware'
import achievementReducer from './slices/achievementSlice'
import analyticsReducer from './slices/analyticsSlice'
import buildingReducer from './slices/buildingSlice'
import challengeReducer from './slices/challengeSlice'
import dialogueReducer from './slices/dialogueSlice'
import editorReducer from './slices/editorSlice'
import eventReducer from './slices/eventSlice'
import gameReducer from './slices/gameSlice'
import multiplayerReducer from './slices/multiplayerSlice'
import playerReducer from './slices/playerSlice'
import resourceReducer from './slices/resourceSlice'
import tutorialReducer from './slices/tutorialSlice'
import uiReducer from './slices/uiSlice'
import userReducer from './slices/userSlice'
import villagerReducer from './slices/villagerSlice'

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
    events: eventReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(soundMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
