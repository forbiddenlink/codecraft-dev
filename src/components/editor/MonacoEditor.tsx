// File: /src/components/editor/MonacoEditor.tsx
'use client';
import { useEffect, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { setCode, setEditorErrors } from '@/store/slices/editorSlice';
import { validateHtml, validateCss, validateJs, ValidationError } from '@/utils/codeValidation';
import { CodeExecutionEngine } from '@/utils/codeExecution';
import { editor } from 'monaco-editor';

export default function MonacoEditor() {
  const dispatch = useAppDispatch();
  const code = useAppSelector(state => state.editor.currentCode);
  const language = useAppSelector(state => state.editor.language);
  const executionEngine = useRef<CodeExecutionEngine | null>(null);

  useEffect(() => {
    executionEngine.current = new CodeExecutionEngine();
    return () => executionEngine.current?.destroy();
  }, []);

  const handleEditorMount: OnMount = (editor) => {
    // Set up validation markers
    const updateMarkers = (errors: ValidationError[]) => {
      const markers = errors.map(error => ({
        startLineNumber: error.line,
        startColumn: error.column,
        endLineNumber: error.line,
        endColumn: error.column + 1,
        message: error.message,
        severity: error.severity === 'error' 
          ? monaco.MarkerSeverity.Error 
          : monaco.MarkerSeverity.Warning
      }));

      monaco.editor.setModelMarkers(
        editor.getModel()!,
        'codecraft',
        markers
      );
    };

    // Set up validation on change
    editor.onDidChangeModelContent(async () => {
      const value = editor.getValue();
      dispatch(setCode(value));

      // Validate based on language
      let validationResult;
      switch (language) {
        case 'html':
          validationResult = validateHtml(value);
          break;
        case 'css':
          validationResult = validateCss(value);
          break;
        case 'javascript':
          validationResult = validateJs(value);
          break;
        default:
          return;
      }

      // Update markers and store errors
      const allErrors = [...validationResult.errors, ...validationResult.warnings];
      updateMarkers(allErrors);
      dispatch(setEditorErrors(allErrors));
    });
  };

  return (
    <Editor
      height="100%"
      defaultLanguage="html"
      language={language}
      value={code}
      theme="vs-dark"
      onChange={(value) => dispatch(setCode(value || ''))}
      onMount={handleEditorMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on'
      }}
    />
  );
}