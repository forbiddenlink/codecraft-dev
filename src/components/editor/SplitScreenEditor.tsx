'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MonacoEditor from './MonacoEditor';
import { CodePreview } from './CodePreview';
import { useAppSelector } from '@/store/hooks';

interface SplitScreenEditorProps {
  onClose?: () => void;
}

export function SplitScreenEditor({ onClose }: SplitScreenEditorProps) {
  const [layout, setLayout] = useState<'split' | 'code' | 'preview'>('split');
  const [splitRatio, setSplitRatio] = useState(50); // Percentage for left panel

  const editorState = useAppSelector((state) => state.editor);
  const { html, css, javascript } = editorState.code;

  const handleDrag = (e: React.MouseEvent) => {
    const container = e.currentTarget.parentElement;
    if (!container) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const containerRect = container.getBoundingClientRect();
      const newRatio = ((moveEvent.clientX - containerRect.left) / containerRect.width) * 100;
      setSplitRatio(Math.max(20, Math.min(80, newRatio))); // Limit between 20-80%
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Code Editor</h2>

          {/* Layout Toggle */}
          <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setLayout('code')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                layout === 'code' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
              aria-label="Code only view"
            >
              Code
            </button>
            <button
              onClick={() => setLayout('split')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                layout === 'split' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
              aria-label="Split view"
            >
              Split
            </button>
            <button
              onClick={() => setLayout('preview')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                layout === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
              aria-label="Preview only view"
            >
              Preview
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
          aria-label="Close editor"
        >
          Close Editor
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="sync">
          {/* Code Editor Panel */}
          {(layout === 'code' || layout === 'split') && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              style={{ width: layout === 'split' ? `${splitRatio}%` : '100%' }}
              className="flex flex-col"
            >
              <MonacoEditor />
            </motion.div>
          )}

          {/* Resizable Divider */}
          {layout === 'split' && (
            <div
              className="w-1 bg-gray-700 hover:bg-blue-600 cursor-col-resize transition-colors relative group"
              onMouseDown={handleDrag}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize panels"
            >
              <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
                <div className="w-1 h-12 bg-gray-500 rounded-full group-hover:bg-blue-500 transition-colors" />
              </div>
            </div>
          )}

          {/* Preview Panel */}
          {(layout === 'preview' || layout === 'split') && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ width: layout === 'split' ? `${100 - splitRatio}%` : '100%' }}
              className="flex flex-col"
            >
              <CodePreview
                html={html}
                css={css}
                javascript={javascript}
                isVisible={true}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer with Keyboard Shortcuts */}
      <div className="bg-gray-800 text-gray-400 px-4 py-2 text-xs border-t border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+S</kbd> Save
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+Enter</kbd> Run
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Ctrl+/</kbd> Comment
          </span>
          <span>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Esc</kbd> Close
          </span>
        </div>
        <div>
          Ready to code
        </div>
      </div>
    </div>
  );
}
