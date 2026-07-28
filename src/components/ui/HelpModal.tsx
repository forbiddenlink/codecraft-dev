'use client';

import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleHelp } from '@/store/slices/uiSlice';
import { startTutorial } from '@/store/slices/tutorialSlice';
import { WELCOME_TUTORIAL } from '@/data/tutorialData';

export function HelpModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.showHelp);

  if (!isOpen) return null;

  const startWelcomeTutorial = () => {
    dispatch(
      startTutorial({
        tutorialId: WELCOME_TUTORIAL.id,
        steps: WELCOME_TUTORIAL.steps,
      }),
    );
    dispatch(toggleHelp());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close help"
        onClick={() => dispatch(toggleHelp())}
      />
      <div
        role="dialog"
        aria-labelledby="help-title"
        className="relative w-full max-w-lg rounded-lg bg-gray-900 p-6 text-white shadow-xl max-h-[85vh] overflow-y-auto"
      >
        <h2 id="help-title" className="text-xl font-bold mb-4">
          Help & Tutorials
        </h2>

        <ol className="list-decimal list-inside space-y-3 text-sm text-gray-200 mb-6">
          <li>Read the challenge card on the left — objectives and hints are there.</li>
          <li>Click <strong>Start Coding</strong> to open the Monaco editor with a starter template.</li>
          <li>Write HTML/CSS/JS, then click <strong>Check Solution</strong> to unlock rewards.</li>
          <li>Use the building menu (bottom right) to place unlocked colony structures.</li>
          <li>Orbit the camera: drag to rotate, scroll to zoom.</li>
        </ol>

        <button
          type="button"
          onClick={startWelcomeTutorial}
          className="w-full rounded bg-green-600 px-4 py-2 hover:bg-green-700 mb-3"
        >
          Start welcome tutorial
        </button>

        <div className="text-sm text-gray-400 space-y-2 mb-4">
          <Link href="/playground" className="block hover:text-white" onClick={() => dispatch(toggleHelp())}>
            Open Playground
          </Link>
          <Link href="/privacy" className="block hover:text-white" onClick={() => dispatch(toggleHelp())}>
            Privacy Policy
          </Link>
          <Link href="/terms" className="block hover:text-white" onClick={() => dispatch(toggleHelp())}>
            Terms of Service
          </Link>
        </div>

        <button
          type="button"
          onClick={() => dispatch(toggleHelp())}
          className="w-full rounded bg-indigo-600 px-4 py-2 hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
