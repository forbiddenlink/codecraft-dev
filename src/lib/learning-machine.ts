/**
 * XState learning machine for CodeCraft Dev.
 * Models the user's coding challenge progression: idle → challenge → coding → reviewing → complete.
 */
import { createMachine, assign } from "xstate";

export interface ChallengeContext {
  challengeId: string | null;
  language: string | null;
  code: string;
  attempts: number;
  hints: string[];
  testResults: TestResult[];
  timeStarted: number | null;
}

export interface TestResult {
  passed: boolean;
  testName: string;
  expected: string;
  actual: string;
}

type ChallengeEvent =
  | { type: "START_CHALLENGE"; challengeId: string; language: string }
  | { type: "UPDATE_CODE"; code: string }
  | { type: "REQUEST_HINT"; hint: string }
  | { type: "RUN_TESTS"; results: TestResult[] }
  | { type: "SUBMIT" }
  | { type: "PASS" }
  | { type: "FAIL" }
  | { type: "RESET" };

export const learningMachine = createMachine({
  id: "codecraft",
  initial: "idle",
  types: {} as { context: ChallengeContext; events: ChallengeEvent },
  context: {
    challengeId: null,
    language: null,
    code: "",
    attempts: 0,
    hints: [],
    testResults: [],
    timeStarted: null,
  },
  states: {
    idle: {
      on: {
        START_CHALLENGE: {
          target: "coding",
          actions: assign(({ event }) => ({
            challengeId: event.challengeId,
            language: event.language,
            code: "",
            attempts: 0,
            hints: [],
            testResults: [],
            timeStarted: Date.now(),
          })),
        },
      },
    },
    coding: {
      on: {
        UPDATE_CODE: {
          actions: assign(({ event }) => ({ code: event.code })),
        },
        REQUEST_HINT: {
          actions: assign(({ context, event }) => ({
            hints: [...context.hints, event.hint],
          })),
        },
        RUN_TESTS: {
          target: "reviewing",
          actions: assign(({ context, event }) => ({
            testResults: event.results,
            attempts: context.attempts + 1,
          })),
        },
        RESET: "idle",
      },
    },
    reviewing: {
      on: {
        SUBMIT: [
          {
            guard: ({ context }) => context.testResults.every((r) => r.passed),
            target: "complete",
          },
          { target: "coding" },
        ],
        RESET: "idle",
      },
    },
    complete: {
      type: "final",
    },
  },
});

export function getElapsedSeconds(timeStarted: number | null): number {
  if (!timeStarted) return 0;
  return Math.floor((Date.now() - timeStarted) / 1000);
}
