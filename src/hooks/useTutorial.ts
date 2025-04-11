import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  startTutorial as startTutorialAction, 
  endTutorial,
  nextStep,
  previousStep,
  TutorialStep
} from '@/store/slices/tutorialSlice';
import { getTutorialById } from '@/data/tutorialData';

interface TutorialHookReturn {
  isActive: boolean;
  currentTutorialId: string | null;
  currentStepIndex: number;
  completedTutorials: string[];
  currentStep: TutorialStep | null;
  startTutorial: (tutorialId: string) => void;
  stopTutorial: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  isTutorialCompleted: (tutorialId: string) => boolean;
}

export const useTutorial = (): TutorialHookReturn => {
  const dispatch = useAppDispatch();
  const tutorialState = useAppSelector((state) => state.tutorial);
  const completedTutorials = useAppSelector((state) => state.tutorial.completedTutorials);
  
  const startTutorial = (tutorialId: string) => {
    const tutorial = getTutorialById(tutorialId);
    if (!tutorial) {
      console.error(`Tutorial with ID ${tutorialId} not found`);
      return;
    }
    
    dispatch(startTutorialAction({
      tutorialId: tutorial.id,
      steps: tutorial.steps
    }));
  };
  
  const stopTutorial = () => {
    dispatch(endTutorial());
  };
  
  const goToNextStep = () => {
    dispatch(nextStep());
  };
  
  const goToPreviousStep = () => {
    dispatch(previousStep());
  };
  
  const isTutorialCompleted = (tutorialId: string): boolean => {
    return completedTutorials.includes(tutorialId);
  };
  
  const getCurrentStep = (): TutorialStep | null => {
    if (!tutorialState.isActive || tutorialState.steps.length === 0) {
      return null;
    }
    
    return tutorialState.steps[tutorialState.currentStepIndex];
  };
  
  return {
    isActive: tutorialState.isActive,
    currentTutorialId: tutorialState.currentTutorialId,
    currentStepIndex: tutorialState.currentStepIndex,
    completedTutorials,
    currentStep: getCurrentStep(),
    startTutorial,
    stopTutorial,
    goToNextStep,
    goToPreviousStep,
    isTutorialCompleted,
  };
}; 