// File: /src/hooks/useProgressiveHints.ts
/**
 * Progressive Hint System
 *
 * Reveals hints gradually based on time spent on a challenge,
 * reducing frustration for stuck users while encouraging them to try first.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Challenge } from '@/types/challenges';

// Time intervals for revealing hints (in seconds)
const HINT_REVEAL_INTERVALS = [
  60,   // 1 minute - first hint
  120,  // 2 minutes - second hint
  180,  // 3 minutes - third hint (and subsequent hints)
];

// Default time between hints after all intervals are exhausted
const DEFAULT_HINT_INTERVAL = 60;

export interface ProgressiveHintState {
  /** Currently visible hints (subset of all hints) */
  visibleHints: string[];
  /** Number of hints revealed so far */
  hintsRevealed: number;
  /** Total hints available */
  totalHints: number;
  /** Time until next hint (seconds), null if all revealed */
  timeUntilNextHint: number | null;
  /** Percentage of time until next hint (0-100) */
  progressToNextHint: number;
  /** Whether all hints have been revealed */
  allHintsRevealed: boolean;
  /** Manually reveal the next hint */
  revealNextHint: () => void;
  /** Reset hint state (e.g., when switching challenges) */
  resetHints: () => void;
  /** Pause the timer */
  pauseTimer: () => void;
  /** Resume the timer */
  resumeTimer: () => void;
}

export interface UseProgressiveHintsOptions {
  /** Whether to start the timer immediately (default: true) */
  autoStart?: boolean;
  /** Custom intervals for revealing hints */
  intervals?: number[];
  /** Whether to persist state to localStorage */
  persist?: boolean;
}

/**
 * Hook for progressive hint revelation
 *
 * @param challenge - The current challenge with hints
 * @param options - Configuration options
 * @returns Progressive hint state and controls
 */
export function useProgressiveHints(
  challenge: Challenge | null | undefined,
  options: UseProgressiveHintsOptions = {}
): ProgressiveHintState {
  const {
    autoStart = true,
    intervals = HINT_REVEAL_INTERVALS,
    persist = true,
  } = options;

  // State
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(!autoStart);

  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const challengeIdRef = useRef<string | null>(null);

  // Get hints from challenge
  const hints = challenge?.hints || [];
  const totalHints = hints.length;
  const challengeId = challenge?.id || null;

  // Calculate time until next hint
  const getTimeUntilNextHint = useCallback((): number | null => {
    if (hintsRevealed >= totalHints) return null;

    const intervalIndex = Math.min(hintsRevealed, intervals.length - 1);
    const targetTime = hintsRevealed < intervals.length
      ? intervals.slice(0, hintsRevealed + 1).reduce((a, b) => a + b, 0)
      : intervals.reduce((a, b) => a + b, 0) +
        (hintsRevealed - intervals.length + 1) * DEFAULT_HINT_INTERVAL;

    return Math.max(0, targetTime - elapsedTime);
  }, [hintsRevealed, totalHints, intervals, elapsedTime]);

  // Calculate progress to next hint
  const getProgressToNextHint = useCallback((): number => {
    if (hintsRevealed >= totalHints) return 100;

    const intervalIndex = Math.min(hintsRevealed, intervals.length - 1);
    const interval = hintsRevealed < intervals.length
      ? intervals[hintsRevealed]
      : DEFAULT_HINT_INTERVAL;

    const startTime = hintsRevealed === 0
      ? 0
      : hintsRevealed < intervals.length
        ? intervals.slice(0, hintsRevealed).reduce((a, b) => a + b, 0)
        : intervals.reduce((a, b) => a + b, 0) +
          (hintsRevealed - intervals.length) * DEFAULT_HINT_INTERVAL;

    const elapsed = elapsedTime - startTime;
    return Math.min(100, Math.max(0, (elapsed / interval) * 100));
  }, [hintsRevealed, totalHints, intervals, elapsedTime]);

  // Load persisted state when challenge changes
  useEffect(() => {
    if (challengeId && persist) {
      const key = `hint-state-${challengeId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const { revealed, elapsed } = JSON.parse(saved);
          setHintsRevealed(revealed);
          setElapsedTime(elapsed);
        } catch {
          // Invalid saved state, start fresh
          setHintsRevealed(0);
          setElapsedTime(0);
        }
      } else {
        setHintsRevealed(0);
        setElapsedTime(0);
      }
    }

    // Track challenge changes
    if (challengeId !== challengeIdRef.current) {
      challengeIdRef.current = challengeId;
    }
  }, [challengeId, persist]);

  // Persist state changes
  useEffect(() => {
    if (challengeId && persist) {
      const key = `hint-state-${challengeId}`;
      localStorage.setItem(key, JSON.stringify({
        revealed: hintsRevealed,
        elapsed: elapsedTime,
      }));
    }
  }, [challengeId, hintsRevealed, elapsedTime, persist]);

  // Timer effect
  useEffect(() => {
    if (isPaused || !challenge || hintsRevealed >= totalHints) {
      return;
    }

    timerRef.current = setInterval(() => {
      setElapsedTime(prev => {
        const newTime = prev + 1;

        // Check if we should reveal the next hint
        const targetTime = hintsRevealed < intervals.length
          ? intervals.slice(0, hintsRevealed + 1).reduce((a, b) => a + b, 0)
          : intervals.reduce((a, b) => a + b, 0) +
            (hintsRevealed - intervals.length + 1) * DEFAULT_HINT_INTERVAL;

        if (newTime >= targetTime && hintsRevealed < totalHints) {
          setHintsRevealed(prev => prev + 1);
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPaused, challenge, hintsRevealed, totalHints, intervals]);

  // Controls
  const revealNextHint = useCallback(() => {
    if (hintsRevealed < totalHints) {
      setHintsRevealed(prev => prev + 1);
    }
  }, [hintsRevealed, totalHints]);

  const resetHints = useCallback(() => {
    setHintsRevealed(0);
    setElapsedTime(0);
    if (challengeId && persist) {
      localStorage.removeItem(`hint-state-${challengeId}`);
    }
  }, [challengeId, persist]);

  const pauseTimer = useCallback(() => setIsPaused(true), []);
  const resumeTimer = useCallback(() => setIsPaused(false), []);

  // Build visible hints array
  const visibleHints = hints.slice(0, hintsRevealed);

  return {
    visibleHints,
    hintsRevealed,
    totalHints,
    timeUntilNextHint: getTimeUntilNextHint(),
    progressToNextHint: getProgressToNextHint(),
    allHintsRevealed: hintsRevealed >= totalHints,
    revealNextHint,
    resetHints,
    pauseTimer,
    resumeTimer,
  };
}

/**
 * Format seconds into a human-readable string
 */
export function formatTimeUntilHint(seconds: number | null): string {
  if (seconds === null) return '';
  if (seconds <= 0) return 'Available now!';

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `${secs}s`;
}
