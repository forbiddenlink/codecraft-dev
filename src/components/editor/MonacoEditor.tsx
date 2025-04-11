// File: /src/components/editor/MonacoEditor.tsx
'use client';
import { useCallback } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { setCode, setEditorErrors } from '@/store/slices/editorSlice';
import { validateHtml, validateCss, validateJs } from '@/utils/codeValidation';
import { monacoEditorOptions } from '@/utils/monacoWorker';

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

  // Validation handler
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
      // Update editor state
      dispatch(setEditorErrors([...validationResult.errors, ...validationResult.warnings]));
    }
  }, [dispatch]);

  // Handle code changes
  const handleCodeChange = useCallback((value: string | undefined) => {
    if (!value) return;
    dispatch(setCode({ language, code: value }));
    validateCode(value, language);
  }, [dispatch, language, validateCode]);

  // Handle editor mount
  const handleEditorDidMount = useCallback(() => {
    // Editor is ready
  }, []);

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