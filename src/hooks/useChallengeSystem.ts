import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { challengeSystem, ValidationResult } from '@/game/systems/ChallengeSystem';
import { setCurrentChallenge } from '@/store/slices/challengeSlice';
import { setPixelMood } from '@/store/slices/gameSlice';

export function useChallengeSystem() {
  const dispatch = useAppDispatch();
  const currentIndex = useAppSelector(state => state.challenges.currentIndex);
  const availableChallenges = useAppSelector(state => state.challenges.availableChallenges);
  const completedChallengeIds = useAppSelector(state => state.challenges.completed);
  const editorCode = useAppSelector(state => state.editor.code.html);
  
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const currentChallenge = availableChallenges[currentIndex];
  
  // Start the current challenge
  useEffect(() => {
    if (currentChallenge) {
      challengeSystem.startChallenge(currentChallenge.id);
    }
  }, [currentChallenge]);
  
  // Check if challenge is already completed
  const isCompleted = currentChallenge 
    ? completedChallengeIds.includes(currentChallenge.id)
    : false;
  
  /**
   * Validate the current challenge
   */
  const validateCurrentChallenge = () => {
    if (!currentChallenge) return;
    
    setIsValidating(true);
    
    try {
      const result = challengeSystem.validateChallenge(
        currentChallenge.id,
        editorCode
      );
      
      setValidationResult(result);
      
      // Update Pixel's mood based on result
      dispatch(setPixelMood(result.success ? 'happy' : 'concerned'));
      
      return result;
    } finally {
      setIsValidating(false);
    }
  };
  
  /**
   * Navigate to a specific challenge
   */
  const navigateToChallenge = (index: number) => {
    if (index >= 0 && index < availableChallenges.length) {
      dispatch(setCurrentChallenge(index));
      setValidationResult(null);
    }
  };
  
  /**
   * Navigate to the next challenge
   */
  const navigateToNextChallenge = () => {
    navigateToChallenge(currentIndex + 1);
  };
  
  /**
   * Navigate to the previous challenge
   */
  const navigateToPreviousChallenge = () => {
    navigateToChallenge(currentIndex - 1);
  };
  
  return {
    currentChallenge,
    currentIndex,
    isCompleted,
    validateChallenge: validateCurrentChallenge,
    validationResult,
    isValidating,
    navigateToChallenge,
    navigateToNextChallenge,
    navigateToPreviousChallenge,
    availableChallenges,
    completedChallengeIds
  };
} 