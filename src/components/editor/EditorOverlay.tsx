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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute inset-8 bg-opacity-95 bg-gray-900 rounded-lg shadow-2xl overflow-hidden"
          style={{ zIndex: 1000 }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
              <h2 className="text-white font-semibold">Code Editor</h2>
              
              {/* Language tabs */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleLanguageChange('html')}
                  className={`px-3 py-1 rounded text-white transition-colors ${
                    language === 'html' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  HTML
                </button>
                <button
                  onClick={() => handleLanguageChange('css')}
                  className={`px-3 py-1 rounded text-white transition-colors ${
                    language === 'css' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  CSS
                </button>
                <button
                  onClick={() => handleLanguageChange('javascript')}
                  className={`px-3 py-1 rounded text-white transition-colors ${
                    language === 'javascript' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  JavaScript
                </button>
              </div>
              
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close editor"
              >
                Close
              </button>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              <MonacoEditor />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-800 flex justify-between items-center">
              {/* Status indicator */}
              <div className="text-sm">
                {isProcessing ? (
                  <span className="text-yellow-400">Processing...</span>
                ) : lastResult ? (
                  lastResult.success ? (
                    <span className="text-green-400">Code processed successfully</span>
                  ) : (
                    <span className="text-red-400">
                      {lastResult.errors.length} error(s)
                      {lastResult.warnings.length > 0 && `, ${lastResult.warnings.length} warning(s)`}
                    </span>
                  )
                ) : null}
              </div>
              
              {/* Action buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleRunCode}
                  className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                  disabled={isProcessing}
                >
                  Run Code
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 