/**
 * Multiplayer Redux Slice
 * Manages collaboration session state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MultiplayerState {
  isInSession: boolean;
  sessionId: string | null;
  isHost: boolean;
  canEdit: boolean;
  participants: Array<{
    id: string;
    username: string;
    color: string;
    level: number;
  }>;
  showSessionBrowser: boolean;
  showCreateModal: boolean;
  showCollaborationPanel: boolean;
}

const initialState: MultiplayerState = {
  isInSession: false,
  sessionId: null,
  isHost: false,
  canEdit: false,
  participants: [],
  showSessionBrowser: false,
  showCreateModal: false,
  showCollaborationPanel: false,
};

const multiplayerSlice = createSlice({
  name: 'multiplayer',
  initialState,
  reducers: {
    joinSession: (
      state,
      action: PayloadAction<{
        sessionId: string;
        isHost: boolean;
        canEdit: boolean;
      }>
    ) => {
      state.isInSession = true;
      state.sessionId = action.payload.sessionId;
      state.isHost = action.payload.isHost;
      state.canEdit = action.payload.canEdit;
      state.showSessionBrowser = false;
      state.showCreateModal = false;
      state.showCollaborationPanel = true;
    },
    leaveSession: (state) => {
      state.isInSession = false;
      state.sessionId = null;
      state.isHost = false;
      state.canEdit = false;
      state.participants = [];
      state.showCollaborationPanel = false;
    },
    updateParticipants: (state, action: PayloadAction<MultiplayerState['participants']>) => {
      state.participants = action.payload;
    },
    toggleSessionBrowser: (state) => {
      state.showSessionBrowser = !state.showSessionBrowser;
      if (state.showSessionBrowser) {
        state.showCreateModal = false;
      }
    },
    toggleCreateModal: (state) => {
      state.showCreateModal = !state.showCreateModal;
      if (state.showCreateModal) {
        state.showSessionBrowser = false;
      }
    },
    toggleCollaborationPanel: (state) => {
      state.showCollaborationPanel = !state.showCollaborationPanel;
    },
  },
});

export const {
  joinSession,
  leaveSession,
  updateParticipants,
  toggleSessionBrowser,
  toggleCreateModal,
  toggleCollaborationPanel,
} = multiplayerSlice.actions;
export default multiplayerSlice.reducer;
