'use client';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import MonacoEditor from './MonacoEditor';
import { motion, AnimatePresence } from 'framer-motion';
import { setEditorVisible } from '@/store/slices/editorSlice';

export default function EditorOverlay() {
  const dispatch = useAppDispatch();
  const isVisible = useAppSelector(state => state.editor.isVisible);

  const handleClose = () => {
    dispatch(setEditorVisible(false));
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
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              <MonacoEditor />
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-800 flex justify-end space-x-2">
              <button
                onClick={handleClose}
                className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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