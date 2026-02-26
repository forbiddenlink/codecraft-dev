'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { motion, AnimatePresence } from 'framer-motion';
import { setEditorVisible, setLanguage } from '@/store/slices/editorSlice';
import MonacoEditor from './MonacoEditor';
import { useCodeProcessor } from '@/hooks/useCodeProcessor';

type EditorLanguage = 'html' | 'css' | 'javascript';

export default function EditorOverlay() {
  const dispatch = useAppDispatch();
  const isVisible = useAppSelector(state => state.editor.isVisible);
  const language = useAppSelector(state => state.editor.language);
  const { processCode, isProcessing, lastResult } = useCodeProcessor();

  // Get the code for each language
  const htmlCode = useAppSelector(state => state.editor.code.html || '');
  const cssCode = useAppSelector(state => state.editor.code.css || '');
  const jsCode = useAppSelector(state => state.editor.code.javascript || '');

  // Process code changes after a delay
  useEffect(() => {
    if (!isVisible) return;
    
    const timer = setTimeout(() => {
      processCode(htmlCode, cssCode, jsCode);
    }, 1000); // 1 second debounce
    
    return () => clearTimeout(timer);
  }, [htmlCode, cssCode, jsCode, isVisible, processCode]);

  const handleClose = () => {
    dispatch(setEditorVisible(false));
  };

  const handleRunCode = () => {
    processCode(htmlCode, cssCode, jsCode);
  };

  const handleLanguageChange = (newLanguage: EditorLanguage) => {
    dispatch(setLanguage(newLanguage));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className="absolute inset-8 panel overflow-hidden"
          style={{ zIndex: 1000 }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-elevated border-b border-[rgb(var(--border-subtle))]">
              <h2 className="text-h4">Code Editor</h2>

              {/* Language tabs */}
              <div className="flex gap-1">
                {(['html', 'css', 'javascript'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleLanguageChange(lang)}
                    className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-body font-medium transition-colors focus-ring ${
                      language === lang
                        ? 'bg-accent text-white'
                        : 'text-text-muted hover:text-text-secondary hover:bg-surface'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleClose}
                className="btn-secondary text-body focus-ring"
                aria-label="Close editor"
              >
                Close
              </button>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden bg-base">
              <MonacoEditor />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-elevated border-t border-[rgb(var(--border-subtle))] flex justify-between items-center">
              {/* Status indicator */}
              <div className="text-body">
                {isProcessing ? (
                  <span className="text-warning">Processing...</span>
                ) : lastResult ? (
                  lastResult.success ? (
                    <span className="text-success">Code processed successfully</span>
                  ) : (
                    <span className="text-error">
                      {lastResult.errors.length} error(s)
                      {lastResult.warnings.length > 0 && `, ${lastResult.warnings.length} warning(s)`}
                    </span>
                  )
                ) : null}
              </div>

              {/* Action buttons */}
              <button
                onClick={handleRunCode}
                className="btn-primary focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                Run Code
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 