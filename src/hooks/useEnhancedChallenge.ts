'use client';

import { useCallback, useEffect, useState } from 'react';
import { useGameManager } from '@/contexts/GameContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { autoGrader, GradingResult } from '@/utils/autoGrader';
import { soundSystem } from '@/utils/soundSystem';
import type { Challenge } from '@/types/challenges';

interface ChallengeState {
  isChecking: boolean;
  lastResult: GradingResult | null;
  attempts: number;
  startTime: number;
  hintsUsed: number;
}

export function useEnhancedChallenge(challenge: Challenge | null) {
  const gameManager = useGameManager();
  const dispatch = useAppDispatch();
  const editorState = useAppSelector((state) => state.editor);

  const [state, setState] = useState<ChallengeState>({
    isChecking: false,
    lastResult: null,
    attempts: 0,
    startTime: Date.now(),
    hintsUsed: 0,
  });

  // Reset state when challenge changes
  useEffect(() => {
    if (challenge) {
      setState({
        isChecking: false,
        lastResult: null,
        attempts: 0,
        startTime: Date.now(),
        hintsUsed: 0,
      });
    }
  }, [challenge?.id]);

  const checkSolution = useCallback(async () => {
    if (!challenge || state.isChecking) return;

    setState((prev) => ({ ...prev, isChecking: true }));

    try {
      // TODO: Implement proper grading with autoGrader
      // For now, use the challenge's validate function
      const passed = challenge.validate(editorState.code.html);

      const result: GradingResult = {
        passed,
        score: passed ? 100 : 0,
        feedback: {
          passed: passed ? ['Challenge completed!'] : [],
          failed: passed ? [] : ['Code does not meet requirements'],
          suggestions: challenge.hints
        },
        criteriaResults: []
      };

      setState((prev) => ({
        ...prev,
        isChecking: false,
        lastResult: result,
        attempts: prev.attempts + 1,
      }));

      if (result.passed) {
        // Calculate time taken
        const timeSpent = Date.now() - state.startTime;

        // Play success sound
        soundSystem.playSFX('challenge_complete');

        // Award achievement for perfect score
        if (result.score === 100) {
          soundSystem.playSFX('achievement_unlock');
        }

        // TODO: Complete challenge in GameManager with proper parameters
        // gameManager.completeChallenge(challenge.id);

        // Show success notification
        return {
          success: true,
          result,
        };
      } else {
        // Play error sound
        soundSystem.playSFX('code_error');

        // Provide encouragement after multiple attempts
        if (state.attempts + 1 >= 3) {
          // Show hint suggestion
          console.log('Consider using a hint!');
        }

        return {
          success: false,
          result,
        };
      }
    } catch (error) {
      console.error('Error checking solution:', error);
      setState((prev) => ({ ...prev, isChecking: false }));
      soundSystem.playSFX('code_error');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }, [challenge, state, editorState.code]);

  const useHint = useCallback(() => {
    if (!challenge) return null;

    setState((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
    soundSystem.playSFX('notification');

    // Return progressive hints
    if (challenge.hints) {
      const hintIndex = Math.min(state.hintsUsed, challenge.hints.length - 1);
      return challenge.hints[hintIndex];
    }

    return null;
  }, [challenge, state.hintsUsed]);

  const skipChallenge = useCallback(() => {
    if (!challenge) return;

    soundSystem.playSFX('ui_click');
    // TODO: Mark as skipped in GameManager
    // gameManager.skipChallenge(challenge.id);
    console.log('Challenge skipped:', challenge.id);
  }, [challenge]);

  const resetChallenge = useCallback(() => {
    setState({
      isChecking: false,
      lastResult: null,
      attempts: 0,
      startTime: Date.now(),
      hintsUsed: 0,
    });
    soundSystem.playSFX('ui_click');
  }, []);

  return {
    // State
    isChecking: state.isChecking,
    lastResult: state.lastResult,
    attempts: state.attempts,
    hintsUsed: state.hintsUsed,
    timeSpent: Date.now() - state.startTime,

    // Actions
    checkSolution,
    useHint,
    skipChallenge,
    resetChallenge,
  };
}
