'use client';

import Link from 'next/link';
import {
  X,
  GraduationCap,
  Terminal,
  Scale,
  FileText,
  Code2,
  MousePointer2,
  Building2,
  Orbit,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleHelp } from '@/store/slices/uiSlice';
import { startTutorial } from '@/store/slices/tutorialSlice';
import { WELCOME_TUTORIAL } from '@/data/tutorialData';
import { Icon } from '@/components/ui/Icon';

const STEPS = [
  {
    icon: Code2,
    title: 'Read the challenge',
    body: 'Objectives and progressive hints live on the left HUD.',
  },
  {
    icon: Terminal,
    title: 'Start Coding',
    body: 'Opens Monaco with a starter template for the active challenge.',
  },
  {
    icon: GraduationCap,
    title: 'Check Solution',
    body: 'Validates your HTML/CSS/JS and unlocks colony rewards.',
  },
  {
    icon: Building2,
    title: 'Place buildings',
    body: 'Use the building menu, then click the ground to place unlocks.',
  },
  {
    icon: Orbit,
    title: 'Navigate the colony',
    body: 'Drag to orbit, scroll to zoom, right-drag to pan.',
  },
] as const;

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
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close help"
        onClick={() => dispatch(toggleHelp())}
      />
      <div
        role="dialog"
        aria-labelledby="help-title"
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-[var(--radius-lg)] border border-white/[0.08] bg-[rgb(var(--bg-surface))] shadow-[var(--shadow-lg)]"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-[rgb(var(--bg-surface)/0.95)] px-5 py-4 backdrop-blur">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[rgb(var(--text-muted))]">
              Field guide
            </p>
            <h2 id="help-title" className="text-lg font-semibold text-[rgb(var(--text-primary))]">
              Help & Tutorials
            </h2>
          </div>
          <button
            type="button"
            onClick={() => dispatch(toggleHelp())}
            className="btn-icon focus-ring"
            aria-label="Close"
          >
            <Icon icon={X} size={18} />
          </button>
        </div>

        <ol className="space-y-2 p-4">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-3 rounded-[var(--radius-md)] border border-white/[0.05] bg-[rgb(var(--bg-elevated)/0.4)] px-3 py-3"
            >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent)/0.2)] text-xs font-semibold text-[rgb(var(--accent-subtle))]">
                {index + 1}
              </span>
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2 text-sm font-medium text-[rgb(var(--text-primary))]">
                  <Icon icon={step.icon} size={15} className="text-[rgb(var(--accent-subtle))]" />
                  {step.title}
                </div>
                <p className="text-xs leading-relaxed text-[rgb(var(--text-muted))]">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="space-y-2 border-t border-white/[0.08] p-4">
          <button
            type="button"
            onClick={startWelcomeTutorial}
            className="btn-primary w-full gap-2 focus-ring"
          >
            <Icon icon={MousePointer2} size={16} />
            Start welcome tutorial
          </button>

          <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
            <Link
              href="/playground"
              className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-white/[0.08] px-2 py-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]"
              onClick={() => dispatch(toggleHelp())}
            >
              <Icon icon={Terminal} size={13} />
              Playground
            </Link>
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-white/[0.08] px-2 py-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]"
              onClick={() => dispatch(toggleHelp())}
            >
              <Icon icon={Scale} size={13} />
              Privacy
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-white/[0.08] px-2 py-2 text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-elevated))]"
              onClick={() => dispatch(toggleHelp())}
            >
              <Icon icon={FileText} size={13} />
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
