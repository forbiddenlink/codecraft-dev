import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface PlayerState {
  position: Position;
  isMoving: boolean;
  targetPosition: Position | null;
}

const initialState: PlayerState = {
  position: { x: 0, y: 0.5, z: 0 },
  isMoving: false,
  targetPosition: null,
};

export const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setPlayerPosition: (state, action: PayloadAction<Position>) => {
      state.position = action.payload;
    },
    setTargetPosition: (state, action: PayloadAction<Position | null>) => {
      state.targetPosition = action.payload;
    },
    updatePlayerPosition: (state, action: PayloadAction<Partial<Position>>) => {
      state.position = {
        ...state.position,
        ...action.payload
      };
    },
    setIsMoving: (state, action: PayloadAction<boolean>) => {
      state.isMoving = action.payload;
    },
  },
});

export const { setPlayerPosition, setTargetPosition, updatePlayerPosition, setIsMoving } = playerSlice.actions;

export default playerSlice.reducer; 