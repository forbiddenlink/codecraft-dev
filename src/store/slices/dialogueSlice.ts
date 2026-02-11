/**
 * Dialogue Redux Slice
 * Manages NPC dialogue state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DialogueState {
  isActive: boolean;
  currentNPCId: string | null;
  currentTreeId: string | null;
  currentNodeId: string | null;
}

const initialState: DialogueState = {
  isActive: false,
  currentNPCId: null,
  currentTreeId: null,
  currentNodeId: null,
};

const dialogueSlice = createSlice({
  name: 'dialogue',
  initialState,
  reducers: {
    startDialogue: (
      state,
      action: PayloadAction<{
        npcId: string;
        treeId: string;
        nodeId: string;
      }>
    ) => {
      state.isActive = true;
      state.currentNPCId = action.payload.npcId;
      state.currentTreeId = action.payload.treeId;
      state.currentNodeId = action.payload.nodeId;
    },
    advanceNode: (state, action: PayloadAction<string | null>) => {
      if (action.payload === null) {
        // End dialogue
        state.isActive = false;
        state.currentNPCId = null;
        state.currentTreeId = null;
        state.currentNodeId = null;
      } else {
        state.currentNodeId = action.payload;
      }
    },
    endDialogue: (state) => {
      state.isActive = false;
      state.currentNPCId = null;
      state.currentTreeId = null;
      state.currentNodeId = null;
    },
  },
});

export const { startDialogue, advanceNode, endDialogue } = dialogueSlice.actions;
export default dialogueSlice.reducer;
