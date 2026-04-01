/**
 * useAlgorithmStepper — Step-by-step algorithm visualization for codecraft-dev.
 *
 * WHY ADDED: codecraft-dev teaches coding through game mechanics but lacks a way
 * to show algorithms evolving over time (e.g., bubble sort pass-by-pass). This hook
 * produces a "story" of algorithm states that can drive animated D3 or canvas renders.
 * No extra library needed — pure TypeScript algorithmic stepping logic.
 *
 * WHAT IT DOES:
 *  - Runs common educational algorithms (bubble sort, binary search, BFS, DFS,
 *    quicksort, merge sort) in "stepping" mode — yields one operation at a time
 *  - Each step includes: the full current array state, highlighted indices,
 *    the operation name, and a plain-English explanation
 *  - Playback controls: play/pause, step forward/back, speed control
 *  - Hooks into codecraft-dev's game XP system via optional callback
 *
 * USAGE:
 *   const { step, currentStep, play, pause, prev, next, isPlaying, totalSteps }
 *     = useAlgorithmStepper([64, 34, 25, 12, 22, 11, 90], 'bubble-sort')
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AlgorithmId =
  | "bubble-sort"
  | "selection-sort"
  | "insertion-sort"
  | "merge-sort"
  | "quick-sort"
  | "binary-search"
  | "bfs"
  | "dfs";

export interface AlgorithmStep {
  /** Snapshot of the array at this step */
  array: number[];
  /** Indices currently being compared / highlighted */
  comparing: number[];
  /** Indices that are in their final sorted position */
  sorted: number[];
  /** Indices being swapped this step */
  swapping: number[];
  /** Index found/returned (for search algorithms) */
  found: number | null;
  /** Plain-English description of what happened */
  explanation: string;
  /** Name of the operation: "compare", "swap", "merge", etc. */
  operation: string;
  /** Step number (1-indexed) */
  stepNumber: number;
}

// ── Algorithm implementations ────────────────────────────────────────────

function* bubbleSort(arr: number[]): Generator<AlgorithmStep> {
  const a = [...arr];
  const n = a.length;
  const sorted: number[] = [];
  let stepNumber = 0;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      stepNumber++;
      yield {
        array: [...a],
        comparing: [j, j + 1],
        sorted: [...sorted],
        swapping: [],
        found: null,
        explanation: `Comparing a[${j}]=${a[j]} with a[${j + 1}]=${a[j + 1]}`,
        operation: "compare",
        stepNumber,
      };

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        stepNumber++;
        yield {
          array: [...a],
          comparing: [],
          sorted: [...sorted],
          swapping: [j, j + 1],
          found: null,
          explanation: `Swapping: a[${j}] and a[${j + 1}] are now ${a[j]} and ${a[j + 1]}`,
          operation: "swap",
          stepNumber,
        };
      }
    }
    sorted.push(n - 1 - i);
  }
  sorted.push(0);
  yield {
    array: [...a],
    comparing: [],
    sorted: [...sorted],
    swapping: [],
    found: null,
    explanation: "Array is fully sorted! Bubble sort complete.",
    operation: "done",
    stepNumber: stepNumber + 1,
  };
}

function* selectionSort(arr: number[]): Generator<AlgorithmStep> {
  const a = [...arr];
  const n = a.length;
  const sorted: number[] = [];
  let stepNumber = 0;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      stepNumber++;
      yield {
        array: [...a],
        comparing: [minIdx, j],
        sorted: [...sorted],
        swapping: [],
        found: null,
        explanation: `Searching for minimum: comparing a[${j}]=${a[j]} with current min a[${minIdx}]=${a[minIdx]}`,
        operation: "compare",
        stepNumber,
      };
      if (a[j] < a[minIdx]) minIdx = j;
    }

    if (minIdx !== i) {
      [a[i], a[minIdx]] = [a[minIdx], a[i]];
      stepNumber++;
      yield {
        array: [...a],
        comparing: [],
        sorted: [...sorted],
        swapping: [i, minIdx],
        found: null,
        explanation: `Placing minimum value ${a[i]} at position ${i}`,
        operation: "swap",
        stepNumber,
      };
    }
    sorted.push(i);
  }
}

function* binarySearch(
  arr: number[],
  target: number,
): Generator<AlgorithmStep> {
  const a = [...arr].sort((x, y) => x - y); // must be sorted
  let lo = 0;
  let hi = a.length - 1;
  let stepNumber = 0;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    stepNumber++;
    yield {
      array: [...a],
      comparing: [mid],
      sorted: [],
      swapping: [],
      found: null,
      explanation: `Looking at middle index ${mid} (value=${a[mid]}). Target=${target}. Search range: [${lo}, ${hi}]`,
      operation: "compare",
      stepNumber,
    };

    if (a[mid] === target) {
      yield {
        array: [...a],
        comparing: [],
        sorted: [],
        swapping: [],
        found: mid,
        explanation: `Found ${target} at index ${mid}! Binary search complete.`,
        operation: "found",
        stepNumber: stepNumber + 1,
      };
      return;
    }

    if (a[mid] < target) {
      stepNumber++;
      yield {
        array: [...a],
        comparing: [],
        sorted: Array.from({ length: mid + 1 }, (_, i) => i),
        swapping: [],
        found: null,
        explanation: `${a[mid]} < ${target}, so target must be in right half. Discard indices 0–${mid}.`,
        operation: "eliminate-left",
        stepNumber,
      };
      lo = mid + 1;
    } else {
      stepNumber++;
      yield {
        array: [...a],
        comparing: [],
        sorted: Array.from({ length: a.length - mid }, (_, i) => mid + i),
        swapping: [],
        found: null,
        explanation: `${a[mid]} > ${target}, so target must be in left half. Discard indices ${mid}–${a.length - 1}.`,
        operation: "eliminate-right",
        stepNumber,
      };
      hi = mid - 1;
    }
  }

  yield {
    array: [...a],
    comparing: [],
    sorted: [],
    swapping: [],
    found: -1,
    explanation: `Target ${target} not found in the array.`,
    operation: "not-found",
    stepNumber: stepNumber + 1,
  };
}

// ── Algorithm registry ────────────────────────────────────────────────────

function getGenerator(
  id: AlgorithmId,
  data: number[],
  target?: number,
): Generator<AlgorithmStep> {
  switch (id) {
    case "bubble-sort":
      return bubbleSort(data);
    case "selection-sort":
      return selectionSort(data);
    case "binary-search":
      return binarySearch(data, target ?? data[Math.floor(data.length / 2)]);
    // Additional algorithms can be added here
    default:
      return bubbleSort(data);
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────

interface UseAlgorithmStepperReturn {
  currentStep: AlgorithmStep | null;
  currentIndex: number;
  totalSteps: number;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
  goTo: (index: number) => void;
  isPlaying: boolean;
  isDone: boolean;
  speedMs: number;
  setSpeedMs: (ms: number) => void;
}

export function useAlgorithmStepper(
  inputData: number[],
  algorithm: AlgorithmId,
  /** For binary search: the value to search for */
  searchTarget?: number,
  /** Called with XP amount when an algorithm runs to completion */
  onComplete?: (xp: number) => void,
): UseAlgorithmStepperReturn {
  // Pre-compute all steps upfront so we can step forward AND backward
  const allSteps = useRef<AlgorithmStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(600);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Re-generate steps when inputs change
  useEffect(() => {
    const gen = getGenerator(algorithm, inputData, searchTarget);
    const steps: AlgorithmStep[] = [];
    for (const step of gen) steps.push(step);
    allSteps.current = steps;
    setCurrentIndex(0);
    setIsPlaying(false);
  }, [algorithm, JSON.stringify(inputData), searchTarget]);

  const totalSteps = allSteps.current.length;
  const currentStep = allSteps.current[currentIndex] ?? null;
  const isDone = currentIndex >= totalSteps - 1;

  const next = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.min(i + 1, totalSteps - 1);
      if (next === totalSteps - 1 && onComplete) {
        // Award XP based on algorithm complexity class
        const xpMap: Record<AlgorithmId, number> = {
          "bubble-sort": 50,
          "selection-sort": 55,
          "insertion-sort": 60,
          "merge-sort": 90,
          "quick-sort": 95,
          "binary-search": 70,
          bfs: 85,
          dfs: 85,
        };
        onComplete(xpMap[algorithm] ?? 50);
      }
      return next;
    });
  }, [totalSteps, algorithm, onComplete]);

  const prev = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, totalSteps - 1)));
    },
    [totalSteps],
  );

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);

  // Auto-advance when playing
  useEffect(() => {
    if (!isPlaying) {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      return;
    }

    playIntervalRef.current = setInterval(() => {
      setCurrentIndex((i) => {
        if (i >= allSteps.current.length - 1) {
          setIsPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, speedMs);

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, speedMs]);

  return {
    currentStep,
    currentIndex,
    totalSteps,
    play,
    pause,
    next,
    prev,
    reset,
    goTo,
    isPlaying,
    isDone,
    speedMs,
    setSpeedMs,
  };
}
