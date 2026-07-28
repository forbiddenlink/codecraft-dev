import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EventState {
  activeEventId: string | null;
  lastTriggeredAt: number | null;
  resolvedCount: number;
}

const initialState: EventState = {
  activeEventId: null,
  lastTriggeredAt: null,
  resolvedCount: 0,
};

export const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    triggerColonyEvent: (state, action: PayloadAction<string>) => {
      if (state.activeEventId) return;
      state.activeEventId = action.payload;
      state.lastTriggeredAt = Date.now();
    },
    forceColonyEvent: (state, action: PayloadAction<string>) => {
      state.activeEventId = action.payload;
      state.lastTriggeredAt = Date.now();
    },
    clearColonyEvent: (state) => {
      state.activeEventId = null;
    },
    markEventResolved: (state) => {
      state.activeEventId = null;
      state.resolvedCount += 1;
    },
  },
});

export const { triggerColonyEvent, forceColonyEvent, clearColonyEvent, markEventResolved } =
  eventSlice.actions;

export default eventSlice.reducer;
