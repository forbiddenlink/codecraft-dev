import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Type definitions for tutorial steps
 */
export const TutorialStepTypes = {
  ACTION: {
    CODE: 'code',
    CLICK: 'click',
    VIEW: 'view',
    WAIT: 'wait'
  },
  COMPLETION: {
    AUTO: 'auto',
    MANUAL: 'manual',
    VALIDATION: 'validation'
  },
  FOCUS_AREA: {
    EDITOR: 'editor',
    GAME: 'game',
    HEADER: 'header',
    CONTROLS: 'controls',
    BUILDING_MENU: 'buildingMenu',
    RESOURCE_HUD: 'resourceHUD'
  }
} as const;

type ActionType = typeof TutorialStepTypes.ACTION[keyof typeof TutorialStepTypes.ACTION];
type CompletionType = typeof TutorialStepTypes.COMPLETION[keyof typeof TutorialStepTypes.COMPLETION];
type FocusAreaType = typeof TutorialStepTypes.FOCUS_AREA[keyof typeof TutorialStepTypes.FOCUS_AREA];

interface TutorialAction {
  type: ActionType;
  target?: string;
  value?: string;
  duration?: number;
}

interface TutorialCompletion {
  type: CompletionType;
  criteria?: string;
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  pixelDialogue?: string;
  focusArea: FocusAreaType;
  action: TutorialAction;
  completion: TutorialCompletion;
  nextStepId: string | null;
}

interface TutorialState {
  isActive: boolean;
  currentTutorialId: string | null;
  steps: TutorialStep[];
  currentStepIndex: number;
  completedTutorials: string[];
  showTutorialUI: boolean;
}

const initialState: TutorialState = {
  isActive: false,
  currentTutorialId: null,
  steps: [],
  currentStepIndex: 0,
  completedTutorials: [],
  showTutorialUI: true
};

export const tutorialSlice = createSlice({
  name: 'tutorial',
  initialState,
  reducers: {
    startTutorial: (state, action: PayloadAction<{ tutorialId: string; steps: TutorialStep[] }>) => {
      state.isActive = true;
      state.currentTutorialId = action.payload.tutorialId;
      state.steps = action.payload.steps;
      state.currentStepIndex = 0;
      state.showTutorialUI = true;
    },
    
    endTutorial: (state) => {
      if (state.isActive && state.currentTutorialId) {
        state.completedTutorials.push(state.currentTutorialId);
      }
      
      state.isActive = false;
      state.currentTutorialId = null;
      state.steps = [];
      state.currentStepIndex = 0;
      state.showTutorialUI = false;
    },
    
    nextStep: (state) => {
      if (state.currentStepIndex < state.steps.length - 1) {
        state.currentStepIndex += 1;
      } else {
        if (state.currentTutorialId) {
          state.completedTutorials.push(state.currentTutorialId);
        }
        state.isActive = false;
      }
    },
    
    previousStep: (state) => {
      if (state.currentStepIndex > 0) {
        state.currentStepIndex -= 1;
      }
    },
    
    jumpToStep: (state, action: PayloadAction<number>) => {
      if (action.payload >= 0 && action.payload < state.steps.length) {
        state.currentStepIndex = action.payload;
      }
    },
    
    toggleTutorialUI: (state) => {
      state.showTutorialUI = !state.showTutorialUI;
    },
    
    markTutorialCompleted: (state, action: PayloadAction<string>) => {
      if (!state.completedTutorials.includes(action.payload)) {
        state.completedTutorials.push(action.payload);
      }
    }
  }
});

export const {
  startTutorial,
  endTutorial,
  nextStep,
  previousStep,
  jumpToStep,
  toggleTutorialUI,
  markTutorialCompleted
} = tutorialSlice.actions;

export default tutorialSlice.reducer; 