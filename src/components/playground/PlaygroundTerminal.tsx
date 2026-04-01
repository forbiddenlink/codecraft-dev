// File: /src/components/playground/PlaygroundTerminal.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TerminalLine {
  id: string;
  type: 'stdout' | 'stderr' | 'system' | 'input' | 'command';
  content: string;
  timestamp: Date;
}

interface PlaygroundTerminalProps {
  lines: TerminalLine[];
  isRunning?: boolean;
  onClear?: () => void;
  onInput?: (input: string) => void;
  className?: string;
}

export function PlaygroundTerminal({
  lines,
  isRunning = false,
  onClear,
  onInput,
  className = '',
}: PlaygroundTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const handleInputSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (inputValue.trim() && onInput) {
        onInput(inputValue);
        setInputValue('');
      }
    },
    [inputValue, onInput]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        onClear?.();
      }
    },
    [onClear]
  );

  const getLineColor = (type: TerminalLine['type']): string => {
    switch (type) {
      case 'stderr':
        return 'text-red-400';
      case 'system':
        return 'text-yellow-400';
      case 'input':
        return 'text-blue-400';
      case 'command':
        return 'text-green-400';
      default:
        return 'text-gray-200';
    }
  };

  const getLinePrefix = (type: TerminalLine['type']): string => {
    switch (type) {
      case 'stderr':
        return '[ERR]';
      case 'system':
        return '[SYS]';
      case 'input':
        return '>';
      case 'command':
        return '$';
      default:
        return '';
    }
  };

  const formatTimestamp = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      className={`flex flex-col bg-gray-900 rounded-lg border border-gray-700 overflow-hidden ${className}`}
    >
      {/* Terminal header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="text-sm text-gray-400 ml-2">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          {isRunning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400">Running</span>
            </motion.div>
          )}
          {onClear && (
            <button
              onClick={onClear}
              className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-gray-700"
              title="Clear terminal (Ctrl+L)"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 font-mono text-sm min-h-[200px] max-h-[400px]"
        onClick={() => inputRef.current?.focus()}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <AnimatePresence mode="popLayout">
          {lines.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-500"
            >
              Terminal ready. Run your code to see output here.
            </motion.div>
          ) : (
            lines.map((line) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex gap-2 ${getLineColor(line.type)}`}
              >
                <span className="text-gray-600 text-xs flex-shrink-0 w-20">
                  {formatTimestamp(line.timestamp)}
                </span>
                {getLinePrefix(line.type) && (
                  <span className="flex-shrink-0 w-12">{getLinePrefix(line.type)}</span>
                )}
                <pre className="whitespace-pre-wrap break-all flex-1">{line.content}</pre>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {/* Loading indicator */}
        {isRunning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-gray-400 mt-2"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                  animate={{
                    y: [0, -4, 0],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
            <span className="text-xs">Processing...</span>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      {onInput && (
        <form
          onSubmit={handleInputSubmit}
          className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-t border-gray-700"
        >
          <span className="text-green-400 font-mono">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Enter command..."
            className="flex-1 bg-transparent text-white font-mono text-sm focus:outline-none placeholder-gray-500"
            disabled={isRunning}
          />
          <motion.div
            className="w-2 h-4 bg-gray-400"
            animate={{ opacity: isInputFocused ? [1, 0] : 0 }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </form>
      )}
    </div>
  );
}

// Helper function to create terminal lines
export function createTerminalLine(
  content: string,
  type: TerminalLine['type'] = 'stdout'
): TerminalLine {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    content,
    timestamp: new Date(),
  };
}

export default PlaygroundTerminal;
