'use client';
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { motion, AnimatePresence } from 'framer-motion';
import { setEditorVisible, setLanguage } from '@/store/slices/editorSlice';
import MonacoEditor from './MonacoEditor';
import { useCodeProcessor } from '@/hooks/useCodeProcessor';
import { LiveblocksCursors } from '@/components/multiplayer/LiveblocksCursors';
import { useLiveblocksPresence, type ConnectionStatus } from '@/hooks/useLiveblocksPresence';

type EditorLanguage = 'html' | 'css' | 'javascript';

function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const config: Record<ConnectionStatus, { color: string; label: string }> = {
    connected: { color: 'bg-green-500', label: 'Connected' },
    connecting: { color: 'bg-yellow-500', label: 'Connecting...' },
    reconnecting: { color: 'bg-yellow-500', label: 'Reconnecting...' },
    disconnected: { color: 'bg-gray-500', label: 'Offline' },
  };
  const { color, label } = config[status];

  return (
    <div className="flex items-center gap-1.5 text-body text-text-muted">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
}

function DisconnectionBanner({ onReconnect }: { onReconnect: () => void }) {
  return (
    <div className="px-4 py-2 bg-warning/10 border-b border-warning/30 flex items-center justify-between">
      <div className="flex items-center gap-2 text-warning text-body">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>Connection lost. Your changes may not sync with collaborators.</span>
      </div>
      <button
        onClick={onReconnect}
        className="px-3 py-1 text-body font-medium text-warning hover:bg-warning/20 rounded transition-colors"
      >
        Reconnect
      </button>
    </div>
  );
}

export default function EditorOverlay() {
  const dispatch = useAppDispatch();
  const isVisible = useAppSelector(state => state.editor.isVisible);
  const language = useAppSelector(state => state.editor.language);
  const { isInSession } = useAppSelector(state => state.multiplayer);
  const { processCode, isProcessing, lastResult } = useCodeProcessor();
  const { connectionStatus, reconnect } = useLiveblocksPresence();
  const isDisconnected = isInSession && connectionStatus === 'disconnected';
  const editorContainerRef = useRef<HTMLDivElement>(null);

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

            {/* Disconnection banner */}
            {isDisconnected && <DisconnectionBanner onReconnect={reconnect} />}

            {/* Editor */}
            <div ref={editorContainerRef} className="flex-1 overflow-hidden bg-base relative">
              <MonacoEditor />
              <LiveblocksCursors editorRef={editorContainerRef} />
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-elevated border-t border-[rgb(var(--border-subtle))] flex justify-between items-center">
              {/* Status indicators */}
              <div className="flex items-center gap-4">
                {isInSession && <ConnectionIndicator status={connectionStatus} />}
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