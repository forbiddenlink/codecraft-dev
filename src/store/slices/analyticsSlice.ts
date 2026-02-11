/**
 * Analytics Redux Slice
 * Manages analytics dashboard state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AnalyticsState {
  isOpen: boolean;
  activeTab: 'overview' | 'concepts' | 'time' | 'code' | 'recommendations';
  lastRefresh: number;
}

const initialState: AnalyticsState = {
  isOpen: false,
  activeTab: 'overview',
  lastRefresh: Date.now(),
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    openAnalytics: (state) => {
      state.isOpen = true;
      state.lastRefresh = Date.now();
    },
    closeAnalytics: (state) => {
      state.isOpen = false;
    },
    setActiveTab: (
      state,
      action: PayloadAction<AnalyticsState['activeTab']>
    ) => {
      state.activeTab = action.payload;
    },
    refreshAnalytics: (state) => {
      state.lastRefresh = Date.now();
    },
  },
});

export const { openAnalytics, closeAnalytics, setActiveTab, refreshAnalytics } =
  analyticsSlice.actions;
export default analyticsSlice.reducer;
