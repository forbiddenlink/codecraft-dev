/**
 * UI Redux Slice
 * Manages global UI state (menus, modals, overlays)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  showMainMenu: boolean;
  showSettings: boolean;
  showHelp: boolean;
  activeModal: string | null;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: number;
  }>;
}

const initialState: UIState = {
  showMainMenu: false,
  showSettings: false,
  showHelp: false,
  activeModal: null,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleMainMenu: (state) => {
      state.showMainMenu = !state.showMainMenu;
    },
    openMainMenu: (state) => {
      state.showMainMenu = true;
    },
    closeMainMenu: (state) => {
      state.showMainMenu = false;
    },
    toggleSettings: (state) => {
      state.showSettings = !state.showSettings;
    },
    toggleHelp: (state) => {
      state.showHelp = !state.showHelp;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    addNotification: (
      state,
      action: PayloadAction<Omit<UIState['notifications'][0], 'id' | 'timestamp'>>
    ) => {
      state.notifications.push({
        ...action.payload,
        id: `notif_${Date.now()}_${Math.random()}`,
        timestamp: Date.now(),
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  toggleMainMenu,
  openMainMenu,
  closeMainMenu,
  toggleSettings,
  toggleHelp,
  openModal,
  closeModal,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;
export default uiSlice.reducer;
