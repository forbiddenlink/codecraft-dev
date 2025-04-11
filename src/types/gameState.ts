export interface GameState {
  colonyResources: Record<string, number>;
  cssRules: string[];
  jsExecutionContext: Record<string, unknown>;
  tutorialActive: boolean;
  tutorialStep: number;
  tutorialState: {
    active: boolean;
    step: number;
    steps: Array<{
      focusArea: string;
      pixelDialogue?: string;
    }>;
  };
  buildMode: boolean;
  selectedTemplateId: string | null;
  generators: Array<{
    id: string;
    position: [number, number, number];
    isActive: boolean;
    resources: Array<{
      resourceId: string;
      amount: number;
    }>;
  }>;
  building: {
    buildMode: boolean;
    selectedTemplateId: string | null;
  };
  user: {
    progress: Record<string, unknown>;
  };
} 