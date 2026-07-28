'use client';

import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSettings } from '@/store/slices/uiSlice';

export function SettingsModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.showSettings);
  const soundEnabled =
    typeof window !== 'undefined'
      ? localStorage.getItem('codecraft_sound') !== 'false'
      : true;

  if (!isOpen) return null;

  const setSound = (enabled: boolean) => {
    localStorage.setItem('codecraft_sound', enabled ? 'true' : 'false');
    localStorage.setItem('NEXT_PUBLIC_ENABLE_SOUND', enabled ? 'true' : 'false');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('codecraft_onboarding_complete');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Close settings"
        onClick={() => dispatch(toggleSettings())}
      />
      <div
        role="dialog"
        aria-labelledby="settings-title"
        className="relative w-full max-w-md rounded-lg bg-gray-900 p-6 text-white shadow-xl"
      >
        <h2 id="settings-title" className="text-xl font-bold mb-4">
          Settings
        </h2>

        <label className="flex items-center justify-between gap-4 py-3 border-b border-white/10">
          <span>Sound effects</span>
          <input
            type="checkbox"
            defaultChecked={soundEnabled}
            onChange={(e) => setSound(e.target.checked)}
            className="h-5 w-5"
          />
        </label>

        <div className="py-3 border-b border-white/10">
          <button
            type="button"
            onClick={resetOnboarding}
            className="text-left text-indigo-300 hover:text-indigo-200"
          >
            Replay introduction
          </button>
        </div>

        <div className="py-3 text-sm text-gray-400 space-y-2">
          <Link href="/privacy" className="block hover:text-white" onClick={() => dispatch(toggleSettings())}>
            Privacy Policy
          </Link>
          <Link href="/terms" className="block hover:text-white" onClick={() => dispatch(toggleSettings())}>
            Terms of Service
          </Link>
        </div>

        <button
          type="button"
          onClick={() => dispatch(toggleSettings())}
          className="mt-4 w-full rounded bg-indigo-600 px-4 py-2 hover:bg-indigo-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
