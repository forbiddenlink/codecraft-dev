import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameStructureNode } from '@/utils/htmlParser';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface GameStructureStyle {
  color?: string;
  scale?: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  opacity?: number;
  emissive?: string;
  metalness?: number;
  roughness?: number;
  wireframe?: boolean;
  animation?: string;
  glow?: boolean;
  shadow?: boolean;
}

export interface ParsedCSSRule {
  selector: string;
  properties: GameStructureStyle;
}

export interface JSExecutionContext {
  success: boolean;
  output?: any;
  error?: string;
  variables?: Record<string, any>;
  console?: string[];
}

interface GameState {
  playerPosition: Position;
  pixelPosition: Position;
  isPlayerMoving: boolean;
  isPixelMoving: boolean;
  movementSpeed: number;
  pixelMood: 'happy' | 'curious' | 'excited' | 'concerned' | 'neutral' | 'thinking';
  pixelTarget?: Position; // Position Pixel is trying to reach
  playerInteractionRadius: number;
  isEditorVisible: boolean;
  editorErrors: Array<{ message: string }>;
  tutorialActive: boolean;
  tutorialStep?: {
    pixelDialogue?: string;
  };
  colonyResources: {
    energy: number;
    minerals: number;
    water: number;
    food: number;
  };
  htmlStructure: GameStructureNode[];
  cssRules: ParsedCSSRule[];
  jsExecutionContext: JSExecutionContext | null;
}

const initialState: GameState = {
  playerPosition: { x: 0, y: 1, z: 0 }, // Player starts at center
  pixelPosition: { x: -2.5, y: 1.2, z: 0 }, // Pixel's starting position
  isPlayerMoving: false,
  isPixelMoving: false,
  movementSpeed: 0.1,
  pixelMood: 'curious',
  playerInteractionRadius: 3,
  isEditorVisible: false,
  editorErrors: [],
  tutorialActive: false,
  colonyResources: {
    energy: 100,
    minerals: 50,
    water: 100,
    food: 50
  },
  htmlStructure: [],
  cssRules: [],
  jsExecutionContext: null
};

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setPlayerPosition: (state, action: PayloadAction<Position>) => {
      state.playerPosition = action.payload;
    },
    setPixelPosition: (state, action: PayloadAction<Position>) => {
      state.pixelPosition = action.payload;
    },
    setPixelTarget: (state, action: PayloadAction<Position | undefined>) => {
      state.pixelTarget = action.payload;
    },
    setIsPlayerMoving: (state, action: PayloadAction<boolean>) => {
      state.isPlayerMoving = action.payload;
    },
    setIsPixelMoving: (state, action: PayloadAction<boolean>) => {
      state.isPixelMoving = action.payload;
    },
    setPixelMood: (state, action: PayloadAction<GameState['pixelMood']>) => {
      state.pixelMood = action.payload;
    },
    updatePlayerPosition: (state, action: PayloadAction<Partial<Position>>) => {
      state.playerPosition = {
        ...state.playerPosition,
        ...action.payload
      };
    },
    updatePixelPosition: (state, action: PayloadAction<Partial<Position>>) => {
      state.pixelPosition = {
        ...state.pixelPosition,
        ...action.payload
      };
    },
    updateHtmlStructure: (state, action: PayloadAction<GameStructureNode[]>) => {
      state.htmlStructure = action.payload;
    },
    updateCssRules: (state, action: PayloadAction<ParsedCSSRule[]>) => {
      state.cssRules = action.payload;
    },
    updateJsExecution: (state, action: PayloadAction<JSExecutionContext | null>) => {
      state.jsExecutionContext = action.payload;
    }
  }
});

export const {
  setPlayerPosition,
  setPixelPosition,
  setPixelTarget,
  setIsPlayerMoving,
  setIsPixelMoving,
  setPixelMood,
  updatePlayerPosition,
  updatePixelPosition,
  updateHtmlStructure,
  updateCssRules,
  updateJsExecution
} = gameSlice.actions;

export default gameSlice.reducer; 