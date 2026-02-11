/**
 * Keyboard Shortcuts Hook
 * Global keyboard shortcuts for CodeCraft features
 */

import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { toggleMainMenu } from '@/store/slices/uiSlice';
import { openAnalytics } from '@/store/slices/analyticsSlice';
import { toggleSessionBrowser } from '@/store/slices/multiplayerSlice';
import { toggleAchievementProgress } from '@/store/slices/achievementSlice';

export function useKeyboardShortcuts() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // ESC - Toggle main menu
      if (event.key === 'Escape') {
        event.preventDefault();
        dispatch(toggleMainMenu());
        return;
      }

      // Check for modifier keys (Ctrl/Cmd + key)
      const isMod = event.ctrlKey || event.metaKey;

      if (isMod) {
        switch (event.key.toLowerCase()) {
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

          case 'k':
            event.preventDefault();
            // Toggle command palette (future feature)
            break;

          case '/':
            event.preventDefault();
            // Toggle search (future feature)
            break;
        }
      }

      // Single key shortcuts (when not in editor)
      if (!isMod) {
        switch (event.key) {
          case '?':
            event.preventDefault();
            // Show help modal
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [dispatch]);
}

/**
 * Get all keyboard shortcuts as documentation
 */
export function getKeyboardShortcuts() {
  return [
    {
      category: 'Navigation',
      shortcuts: [
        { key: 'ESC', description: 'Toggle main menu' },
        { key: 'Ctrl/Cmd + K', description: 'Open command palette' },
        { key: '?', description: 'Show help' },
      ],
    },
    {
      category: 'Features',
      shortcuts: [
        { key: 'Ctrl/Cmd + A', description: 'Open analytics dashboard' },
        { key: 'Ctrl/Cmd + H', description: 'View achievements' },
        { key: 'Ctrl/Cmd + M', description: 'Open multiplayer browser' },
      ],
    },
    {
      category: 'Editor',
      shortcuts: [
        { key: 'Ctrl/Cmd + S', description: 'Save/format code' },
        { key: 'Ctrl/Cmd + /', description: 'Toggle comment' },
        { key: 'Ctrl/Cmd + D', description: 'Duplicate line' },
      ],
    },
  ];
}
