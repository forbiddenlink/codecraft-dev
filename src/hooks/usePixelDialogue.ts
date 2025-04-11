'use client';
import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import { Challenge } from '@/store/slices/challengeSlice';

interface TutorialStep {
  pixelDialogue?: string;
}

interface UnlockedItem {
  type: string;
  name: string;
}

interface PlayerProgress {
  recentlyUnlocked: UnlockedItem[];
  completedChallenges: string[];
}

interface ColonyResources {
  energy: number;
  oxygen: number;
}

interface EditorError {
  message: string;
}

interface UsePixelDialogueReturn {
  currentDialogue: string;
  isShowingDialogue: boolean;
  showDialogue: (dialogue: string, persistent?: boolean) => void;
  hideDialogue: () => void;
}

interface GameState {
  pixelMood: 'happy' | 'curious' | 'excited' | 'concerned' | 'neutral';
  editorErrors: EditorError[];
  tutorialActive: boolean;
  tutorialStep: TutorialStep | undefined;
  colonyResources: ColonyResources;
  playerProgress: PlayerProgress;
  isEditorVisible: boolean;
}

/**
 * Hook to manage Pixel's dialogue based on game context
 * @returns {UsePixelDialogueReturn} Dialogue state and control functions
 */
export default function usePixelDialogue(): UsePixelDialogueReturn {
  const [currentDialogue, setCurrentDialogue] = useState<string>('');
  const [dialogueQueue, setDialogueQueue] = useState<string[]>([]);
  const [isShowingDialogue, setIsShowingDialogue] = useState<boolean>(false);
  const lastContextUpdate = useRef<number>(Date.now());
  const dialogueTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Get relevant game state for contextual dialogue
  const {
    pixelMood,
    editorErrors,
    tutorialActive,
    tutorialStep,
    colonyResources,
    playerProgress,
    isEditorVisible
  } = useAppSelector<GameState>((state: RootState) => state.game);
  
  // Get current challenge
  const currentChallenge = useAppSelector<Challenge | undefined>((state: RootState) => 
    state.challenges.availableChallenges[state.challenges.currentIndex]
  );
  
  /**
   * Generate dialogue based on current context
   */
  const generateContextualDialogue = (): string => {
    // Prioritize different contexts
    
    // 1. Tutorial dialogue has highest priority
    if (tutorialActive && tutorialStep) {
      return tutorialStep.pixelDialogue || "Let me guide you through this tutorial!";
    }
    
    // 2. Error feedback
    if (editorErrors && editorErrors.length > 0) {
      const error = editorErrors[0] as EditorError;
      if (error.message.includes('unclosed tag')) {
        return "Looks like you have an unclosed HTML tag. Make sure each opening tag has a matching closing tag.";
      } else if (error.message.includes('unexpected token')) {
        return "I noticed a syntax error in your code. Check for missing brackets or semicolons.";
      } else {
        return `I spotted an issue with your code: ${error.message}. Let me know if you need help fixing it!`;
      }
    }
    
    // 3. Challenge guidance
    if (isEditorVisible && currentChallenge) {
      return `Let's work on ${currentChallenge.title}! ${currentChallenge.description}`;
    }
    
    // 4. Resource warnings
    if (colonyResources) {
      if (colonyResources.energy < 20) {
        return "Your colony's energy levels are getting low. We should build more collectors!";
      }
      if (colonyResources.oxygen < 30) {
        return "Oxygen levels are dropping. Consider building more life support systems.";
      }
    }
    
    // 5. Progression tips
    if (playerProgress) {
      if (playerProgress.recentlyUnlocked && playerProgress.recentlyUnlocked.length > 0) {
        const unlocked = playerProgress.recentlyUnlocked[0];
        return `You've unlocked a new ${unlocked.type}: ${unlocked.name}! Want to try it out?`;
      }
      
      // Suggest next steps based on progress
      if (playerProgress.completedChallenges.length === 0) {
        return "Ready to start your first challenge? Click on the Challenges panel to begin!";
      }
    }
    
    // 6. Mood-based casual dialogue
    switch (pixelMood) {
      case 'happy':
        return "Your colony is looking fantastic! I'm excited to see what you'll build next!";
      case 'curious':
        return "Have you explored all the building options yet? There are some interesting structures you could add!";
      case 'excited':
        return "I love seeing the colony grow! Let's keep building and see what we can create!";
      case 'concerned':
        return "I'm a bit concerned about our current situation. Let's address any issues before moving forward.";
      default:
        return "I'm Pixel, your AI companion. I'm here to help with anything you need!";
    }
  };
  
  /**
   * Update dialogue based on context
   */
  useEffect(() => {
    // Only update contextual dialogue periodically to avoid constant changes
    if (Date.now() - lastContextUpdate.current > 5000 && !isShowingDialogue) {
      const newDialogue = generateContextualDialogue();
      
      // Only queue if it's different from current dialogue
      if (newDialogue !== currentDialogue) {
        setDialogueQueue(prev => [...prev, newDialogue]);
      }
      
      lastContextUpdate.current = Date.now();
    }
  }, [
    pixelMood, 
    editorErrors, 
    tutorialActive, 
    tutorialStep, 
    colonyResources, 
    playerProgress, 
    currentChallenge,
    isEditorVisible,
    currentDialogue
  ]);
  
  /**
   * Process dialogue queue
   */
  useEffect(() => {
    if (dialogueQueue.length > 0 && !isShowingDialogue) {
      // Show next dialogue in queue
      const nextDialogue = dialogueQueue[0];
      setCurrentDialogue(nextDialogue);
      setIsShowingDialogue(true);
      
      // Remove from queue
      setDialogueQueue(prev => prev.slice(1));
      
      // Auto-hide dialogue after a while unless it's tutorial
      if (!tutorialActive) {
        dialogueTimeout.current = setTimeout(() => {
          setIsShowingDialogue(false);
        }, 8000);
      }
    }
    
    return () => {
      if (dialogueTimeout.current) {
        clearTimeout(dialogueTimeout.current);
      }
    };
  }, [dialogueQueue, isShowingDialogue, tutorialActive]);
  
  /**
   * Show specific dialogue immediately
   * @param {string} dialogue - Dialogue text to show
   * @param {boolean} persistent - Whether dialogue should persist until manually dismissed
   */
  const showDialogue = (dialogue: string, persistent: boolean = false): void => {
    // Clear any existing timeout
    if (dialogueTimeout.current) {
      clearTimeout(dialogueTimeout.current);
    }
    
    setCurrentDialogue(dialogue);
    setIsShowingDialogue(true);
    
    // Auto-hide unless persistent
    if (!persistent) {
      dialogueTimeout.current = setTimeout(() => {
        setIsShowingDialogue(false);
      }, 8000);
    }
  };
  
  /**
   * Hide current dialogue
   */
  const hideDialogue = (): void => {
    setIsShowingDialogue(false);
  };
  
  return {
    currentDialogue,
    isShowingDialogue,
    showDialogue,
    hideDialogue
  };
} 