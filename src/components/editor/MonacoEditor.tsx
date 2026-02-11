// File: /src/components/editor/MonacoEditor.tsx
'use client';
import { useCallback, useRef, useEffect } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { setCode, setEditorErrors } from '@/store/slices/editorSlice';
import { validateHtml, validateCss, validateJs, ValidationError } from '@/utils/codeValidation';
import { monacoEditorOptions } from '@/utils/monacoWorker';

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

  // Ref for debounce timer
  const validationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (validationTimerRef.current) {
        clearTimeout(validationTimerRef.current);
      }
    };
  }, []);

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