// File: /src/components/editor/MonacoEditor.tsx
'use client';
import { useCallback, useRef, useEffect } from 'react';
import Editor, { loader, type Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { useLiveblocksPresence } from '@/hooks/useLiveblocksPresence';
import { setCode, setEditorErrors } from '@/store/slices/editorSlice';
import { validateHtml, validateCss, validateJs, ValidationError } from '@/utils/codeValidation';
import { monacoEditorOptions } from '@/utils/monacoWorker';
import { getCollabRoom } from '@/utils/collaborationSystem';

// Debounce delay for validation (ms) - prevents distraction during typing
const VALIDATION_DEBOUNCE_MS = 300;

/**
 * Transform technical error messages into beginner-friendly explanations
 */
function makeFriendlyErrors(errors: ValidationError[]): ValidationError[] {
  return errors.map(error => {
    let friendlyMessage = error.message;
    let suggestion = '';

    // Common HTML errors
    if (error.message.includes('unclosed') || error.message.includes('Unclosed')) {
      const tagMatch = error.message.match(/<(\w+)/);
      const tag = tagMatch ? tagMatch[1] : 'element';
      friendlyMessage = `Looks like you forgot to close the <${tag}> tag!`;
      suggestion = `Add </${tag}> to close it.`;
    } else if (error.message.includes('Expected closing tag')) {
      friendlyMessage = 'There\'s a missing closing tag here.';
      suggestion = 'Every opening tag like <div> needs a matching </div>';
    } else if (error.message.includes('unexpected')) {
      friendlyMessage = 'Something unexpected appeared in your code.';
      suggestion = 'Check for typos or missing characters.';
    }

    // Common CSS errors
    if (error.message.includes('Expected') && error.message.includes(':')) {
      friendlyMessage = 'CSS property format issue detected.';
      suggestion = 'CSS properties look like: property: value;';
    } else if (error.message.includes('semicolon')) {
      friendlyMessage = 'Missing semicolon in your CSS.';
      suggestion = 'Each CSS rule should end with a semicolon (;)';
    }

    // Common JS errors
    if (error.message.includes('Unexpected token')) {
      friendlyMessage = 'JavaScript found something unexpected.';
      suggestion = 'Check for missing brackets, quotes, or semicolons.';
    } else if (error.message.includes('is not defined')) {
      const varMatch = error.message.match(/(\w+) is not defined/);
      const varName = varMatch ? varMatch[1] : 'variable';
      friendlyMessage = `The variable "${varName}" hasn't been created yet.`;
      suggestion = `Use "let ${varName} = ..." to create it first.`;
    }

    return {
      ...error,
      message: suggestion ? `${friendlyMessage} ${suggestion}` : friendlyMessage
    };
  });
}

// Configure Monaco Editor loader
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs'
  },
  'vs/nls': {
    availableLanguages: {}
  }
});

export default function MonacoEditor() {
  const dispatch = useAppDispatch();
  const language = useAppSelector(state => state.editor.language);
  const code = useAppSelector(state => state.editor.code[language]);
  const { isInSession, sessionId } = useAppSelector(state => state.multiplayer);
  const { updateCursor } = useLiveblocksPresence();

  // Ref for debounce timer
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Ref for editor instance (for collaborative editing)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  // Ref for collaborative editing cleanup
  const collabCleanupRef = useRef<(() => void) | null>(null);
  // Ref for cursor position listener cleanup
  const cursorListenerRef = useRef<{ dispose: () => void } | null>(null);

  // Cleanup timer, collaborative editing, and cursor listener on unmount
  useEffect(() => {
    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
      if (collabCleanupRef.current) {
        collabCleanupRef.current();
        collabCleanupRef.current = null;
      }
      if (cursorListenerRef.current) {
        cursorListenerRef.current.dispose();
        cursorListenerRef.current = null;
      }
    };
  }, []);

  // Set up collaborative editing when in a session
  useEffect(() => {
    const setupCollab = async () => {
      // Clean up previous collaborative session
      if (collabCleanupRef.current) {
        collabCleanupRef.current();
        collabCleanupRef.current = null;
      }

      // Set up new collaborative session if conditions are met
      if (isInSession && sessionId && editorRef.current) {
        const room = getCollabRoom(sessionId);
        if (room) {
          // Dynamic import to avoid SSR issues with y-monaco
          const { setupCollaborativeEditor } = await import('@/utils/multiplayer');
          const result = await setupCollaborativeEditor(room, editorRef.current);
          if (result) {
            collabCleanupRef.current = result.cleanup;
          }
        }
      }
    };

    setupCollab();
  }, [isInSession, sessionId]);

  // Validation handler with friendly error messages
  const validateCode = useCallback((newCode: string, lang: string) => {
    let validationResult;
    switch (lang) {
      case 'html':
        validationResult = validateHtml(newCode);
        break;
      case 'css':
        validationResult = validateCss(newCode);
        break;
      case 'javascript':
        validationResult = validateJs(newCode);
        break;
    }

    if (validationResult) {
      // Transform errors to be beginner-friendly
      const allErrors = [...validationResult.errors, ...validationResult.warnings];
      const friendlyErrors = makeFriendlyErrors(allErrors);
      dispatch(setEditorErrors(friendlyErrors));
    }
  }, [dispatch]);

  // Debounced validation - waits for user to pause typing
  const debouncedValidate = useCallback((newCode: string, lang: string) => {
    // Clear any pending validation
    if (validationTimerRef.current) {
      clearTimeout(validationTimerRef.current);
    }

    // Schedule new validation after debounce delay
    validationTimerRef.current = setTimeout(() => {
      validateCode(newCode, lang);
    }, VALIDATION_DEBOUNCE_MS);
  }, [validateCode]);

  // Handle code changes - update state immediately, validate with debounce
  const handleCodeChange = useCallback((value: string | undefined) => {
    if (!value) return;
    dispatch(setCode({ language, code: value }));
    debouncedValidate(value, language);
  }, [dispatch, language, debouncedValidate]);

  // Handle editor mount
  const handleEditorDidMount = useCallback(async (editor: editor.IStandaloneCodeEditor, _monaco: Monaco) => {
    editorRef.current = editor;

    // Set up cursor position tracking for multiplayer
    if (cursorListenerRef.current) {
      cursorListenerRef.current.dispose();
    }
    cursorListenerRef.current = editor.onDidChangeCursorPosition((e) => {
      if (!isInSession) return;

      const selection = editor.getSelection();
      const hasSelection = selection && !selection.isEmpty();

      updateCursor({
        language,
        line: e.position.lineNumber,
        column: e.position.column,
        selection: hasSelection && selection ? {
          startLine: selection.startLineNumber,
          startColumn: selection.startColumn,
          endLine: selection.endLineNumber,
          endColumn: selection.endColumn,
        } : undefined,
      });
    });

    // If already in a session, set up collaborative editing
    if (isInSession && sessionId) {
      const room = getCollabRoom(sessionId);
      if (room) {
        // Dynamic import to avoid SSR issues with y-monaco
        const { setupCollaborativeEditor } = await import('@/utils/multiplayer');
        const result = await setupCollaborativeEditor(room, editor);
        if (result) {
          collabCleanupRef.current = result.cleanup;
        }
      }
    }
  }, [isInSession, sessionId, language, updateCursor]);

  // Loading component
  const LoadingComponent = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="text-white">Loading editor...</div>
    </div>
  );

  return (
    <div className="w-full h-full" style={{ minHeight: '300px' }}>
      <Editor
        height="100%"
        defaultLanguage={language}
        language={language}
        value={code}
        onChange={handleCodeChange}
        onMount={handleEditorDidMount}
        loading={<LoadingComponent />}
        theme="vs-dark"
        options={{
          ...monacoEditorOptions,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
}