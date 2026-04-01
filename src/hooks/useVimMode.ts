'use client';

import { useEffect, useRef, useCallback, useState, type RefObject } from 'react';
import type { editor } from 'monaco-editor';

interface VimModeState {
  isEnabled: boolean;
  mode: string;
}

interface UseVimModeReturn {
  isEnabled: boolean;
  mode: string;
  enable: () => void;
  disable: () => void;
  toggle: () => void;
  statusBarRef: RefObject<HTMLDivElement | null>;
}

/**
 * Hook to enable Vim keybindings in Monaco Editor.
 *
 * @example
 * ```tsx
 * function MyEditor() {
 *   const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>(null);
 *   const { isEnabled, toggle, statusBarRef } = useVimMode(editorRef.current);
 *
 *   return (
 *     <>
 *       <Editor onMount={(editor) => { editorRef.current = editor; }} />
 *       <div ref={statusBarRef} className="vim-status-bar" />
 *       <button onClick={toggle}>{isEnabled ? 'Disable' : 'Enable'} Vim Mode</button>
 *     </>
 *   );
 * }
 * ```
 */
export function useVimMode(
  editor: editor.IStandaloneCodeEditor | null
): UseVimModeReturn {
  const [state, setState] = useState<VimModeState>({
    isEnabled: false,
    mode: 'NORMAL',
  });
  const vimModeRef = useRef<{ dispose: () => void } | null>(null);
  const statusBarRef = useRef<HTMLDivElement>(null);

  const enable = useCallback(async () => {
    if (!editor || !statusBarRef.current || vimModeRef.current) return;

    try {
      const { initVimMode } = await import('monaco-vim');
      vimModeRef.current = initVimMode(editor, statusBarRef.current);
      setState({ isEnabled: true, mode: 'NORMAL' });
    } catch (error) {
      console.error('Failed to initialize Vim mode:', error);
    }
  }, [editor]);

  const disable = useCallback(() => {
    if (vimModeRef.current) {
      vimModeRef.current.dispose();
      vimModeRef.current = null;
      setState({ isEnabled: false, mode: 'NORMAL' });
    }
  }, []);

  const toggle = useCallback(() => {
    if (state.isEnabled) {
      disable();
    } else {
      enable();
    }
  }, [state.isEnabled, enable, disable]);

  // Cleanup on unmount or editor change
  useEffect(() => {
    return () => {
      if (vimModeRef.current) {
        vimModeRef.current.dispose();
        vimModeRef.current = null;
      }
    };
  }, [editor]);

  return {
    isEnabled: state.isEnabled,
    mode: state.mode,
    enable,
    disable,
    toggle,
    statusBarRef,
  };
}

export default useVimMode;
