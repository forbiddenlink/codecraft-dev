/**
 * Keyboard Shortcuts Hook
 * Global keyboard shortcuts for CodeCraft features
 */

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleMainMenu, toggleSettings, toggleHelp } from '@/store/slices/uiSlice';
import { openAnalytics } from '@/store/slices/analyticsSlice';
import { toggleSessionBrowser, toggleCreateModal } from '@/store/slices/multiplayerSlice';
import { toggleAchievementProgress } from '@/store/slices/achievementSlice';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable ||
    Boolean(target.closest('.monaco-editor'))
  );
}

export function useKeyboardShortcuts() {
  const dispatch = useAppDispatch();
  const buildMode = useAppSelector((state) => state.building.buildMode);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;

      // Esc: cancel build mode first; otherwise toggle main menu
      if (event.key === 'Escape') {
        if (buildMode) {
          // BuildingPreview owns cancelPlacement on Esc
          return;
        }
        event.preventDefault();
        dispatch(toggleMainMenu());
        return;
      }

      const isMod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (isMod) {
        switch (key) {
          case 'a':
            event.preventDefault();
            dispatch(openAnalytics());
            break;
          case 'h':
            event.preventDefault();
            dispatch(toggleAchievementProgress());
            break;
          case 'm':
            event.preventDefault();
            dispatch(toggleSessionBrowser());
            break;
          case 'c':
            if (event.shiftKey) {
              event.preventDefault();
              dispatch(toggleCreateModal());
            }
            break;
          case ',':
            event.preventDefault();
            dispatch(toggleSettings());
            break;
          case 'k':
            event.preventDefault();
            // Command palette reserved
            break;
          default:
            break;
        }
        return;
      }

      if (event.key === '?' || (event.shiftKey && key === '/')) {
        event.preventDefault();
        dispatch(toggleHelp());
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [dispatch, buildMode]);
}

/**
 * Get all keyboard shortcuts as documentation
 */
export function getKeyboardShortcuts() {
  return [
    {
      category: 'Navigation',
      shortcuts: [
        { key: 'Esc', description: 'Toggle main menu (cancels build mode first)' },
        { key: '?', description: 'Show help' },
        { key: 'Ctrl/Cmd + ,', description: 'Open settings' },
      ],
    },
    {
      category: 'Features',
      shortcuts: [
        { key: 'Ctrl/Cmd + A', description: 'Open analytics dashboard' },
        { key: 'Ctrl/Cmd + H', description: 'View achievements' },
        { key: 'Ctrl/Cmd + M', description: 'Open multiplayer browser' },
        { key: 'Ctrl/Cmd + Shift + C', description: 'Create collaboration session' },
      ],
    },
    {
      category: 'Building',
      shortcuts: [
        { key: 'R', description: 'Rotate building preview' },
        { key: 'Esc', description: 'Cancel build mode' },
      ],
    },
  ];
}
