'use client';

import Link from 'next/link';
import { Volume2, RotateCcw, Scale, FileText, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSettings } from '@/store/slices/uiSlice';
import { Icon } from '@/components/ui/Icon';

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
  };

  const resetOnboarding = () => {
    localStorage.removeItem('codecraft_onboarding_complete');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close settings"
        onClick={() => dispatch(toggleSettings())}
      />
      <div
        role="dialog"
        aria-labelledby="settings-title"
        className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-[rgb(var(--bg-surface))] shadow-[var(--shadow-lg)]"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[rgb(var(--text-muted))]">
              Preferences
            </p>
            <h2 id="settings-title" className="text-lg font-semibold text-[rgb(var(--text-primary))]">
              Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={() => dispatch(toggleSettings())}
            className="btn-icon focus-ring"
            aria-label="Close"
          >
            <Icon icon={X} size={18} />
          </button>
        </div>

        <div className="space-y-1 p-3">
          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[var(--radius-md)] px-3 py-3 hover:bg-[rgb(var(--bg-elevated))]">
            <span className="inline-flex items-center gap-3 text-sm text-[rgb(var(--text-primary))]">
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[rgb(var(--accent)/0.15)] text-[rgb(var(--accent-subtle))]">
                <Icon icon={Volume2} size={16} />
              </span>
              Sound effects
            </span>
            <input
              type="checkbox"
              defaultChecked={soundEnabled}
              onChange={(e) => setSound(e.target.checked)}
              className="h-4 w-4 accent-[rgb(var(--accent-subtle))]"
            />
          </label>

          <button
            type="button"
            onClick={resetOnboarding}
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left text-sm text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-elevated))]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-[rgb(var(--accent)/0.15)] text-[rgb(var(--accent-subtle))]">
              <Icon icon={RotateCcw} size={16} />
            </span>
            Replay introduction
          </button>

          <Link
            href="/privacy"
            className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-sm text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))] hover:text-[rgb(var(--text-primary))]"
            onClick={() => dispatch(toggleSettings())}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-white/[0.04] text-[rgb(var(--text-muted))]">
              <Icon icon={Scale} size={16} />
            </span>
            Privacy Policy
          </Link>

          <Link
            href="/terms"
            className="flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-sm text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))] hover:text-[rgb(var(--text-primary))]"
            onClick={() => dispatch(toggleSettings())}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-white/[0.04] text-[rgb(var(--text-muted))]">
              <Icon icon={FileText} size={16} />
            </span>
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
