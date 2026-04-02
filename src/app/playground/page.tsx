// File: /src/app/playground/page.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor, { loader } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { FileTree, buildFileTree, type FileNode } from '@/components/playground/FileTree';
import {
  PlaygroundTerminal,
  createTerminalLine,
  type TerminalLine,
} from '@/components/playground/PlaygroundTerminal';
import {
  bootWebContainer,
  teardownWebContainer,
  isWebContainerSupported,
} from '@/lib/webcontainer';
import type { WebContainer } from '@webcontainer/api';

// Configure Monaco Editor loader
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs',
  },
});

interface PlaygroundFile {
  path: string;
  content: string;
  language: string;
}

// Default starter files
const DEFAULT_FILES: PlaygroundFile[] = [
  {
    path: 'index.js',
    content: `// Welcome to the Playground!
// Write your JavaScript/TypeScript code here

console.log("Hello, World!");

// Try running this code with the Run button
// or press Ctrl/Cmd + Enter

const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Doubled:", doubled);
`,
    language: 'javascript',
  },
  {
    path: 'package.json',
    content: JSON.stringify(
      {
        name: 'playground',
        type: 'module',
        version: '1.0.0',
        scripts: {
          start: 'node index.js',
        },
        dependencies: {},
      },
      null,
      2
    ),
    language: 'json',
  },
];

function getLanguageFromPath(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const extToLang: Record<string, string> = {
    js: 'javascript',
    mjs: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    json: 'json',
    html: 'html',
    css: 'css',
    md: 'markdown',
    txt: 'plaintext',
  };
  return ext ? extToLang[ext] || 'plaintext' : 'plaintext';
}

export default function PlaygroundPage() {
  // State
  const [files, setFiles] = useState<PlaygroundFile[]>(DEFAULT_FILES);
  const [selectedFile, setSelectedFile] = useState<string>('index.js');
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isWebContainerReady, setIsWebContainerReady] = useState(false);
  const [webContainerError, setWebContainerError] = useState<string | null>(null);
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [editorHeight, setEditorHeight] = useState(60); // percentage

  // Refs
  const webContainerRef = useRef<WebContainer | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const runningProcessRef = useRef<{ kill: () => void } | null>(null);

  // Get current file
  const currentFile = files.find((f) => f.path === selectedFile);

  // Initialize WebContainer
  useEffect(() => {
    if (!isWebContainerSupported()) {
      setWebContainerError(
        'WebContainers are not supported in this browser. Please use a modern browser with SharedArrayBuffer support.'
      );
      return;
    }

    const initWebContainer = async () => {
      try {
        addTerminalLine('Booting WebContainer...', 'system');
        const wc = await bootWebContainer();
        webContainerRef.current = wc;
        setIsWebContainerReady(true);
        addTerminalLine('WebContainer ready!', 'system');

        // Mount initial files
        await mountFiles(wc, files);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to boot WebContainer';
        setWebContainerError(message);
        addTerminalLine(`Error: ${message}`, 'stderr');
      }
    };

    initWebContainer();

    // Cleanup on unmount
    return () => {
      if (runningProcessRef.current) {
        runningProcessRef.current.kill();
      }
      teardownWebContainer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mount files to WebContainer
  const mountFiles = async (wc: WebContainer, filesToMount: PlaygroundFile[]) => {
    const fileTree: Record<string, { file: { contents: string } }> = {};

    for (const file of filesToMount) {
      fileTree[file.path] = { file: { contents: file.content } };
    }

    await wc.mount(fileTree);
  };

  // Add terminal line helper
  const addTerminalLine = useCallback(
    (content: string, type: TerminalLine['type'] = 'stdout') => {
      setTerminalLines((prev) => [...prev, createTerminalLine(content, type)]);
    },
    []
  );

  // Clear terminal
  const clearTerminal = useCallback(() => {
    setTerminalLines([]);
  }, []);

  // Run code
  const runCode = useCallback(async () => {
    if (!webContainerRef.current || isRunning) return;

    const wc = webContainerRef.current;

    // Kill any running process
    if (runningProcessRef.current) {
      runningProcessRef.current.kill();
      runningProcessRef.current = null;
    }

    setIsRunning(true);
    addTerminalLine(`$ node ${selectedFile}`, 'command');

    try {
      // Update file content in WebContainer
      if (currentFile) {
        await wc.fs.writeFile(currentFile.path, currentFile.content);
      }

      // Run the file
      const process = await wc.spawn('node', [selectedFile]);

      runningProcessRef.current = process;

      // Read output stream
      const reader = process.output.getReader();

      const readOutput = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            // Split by newlines and add each line
            const lines = value.split('\n').filter((line) => line.trim());
            for (const line of lines) {
              addTerminalLine(line, 'stdout');
            }
          }
        } catch {
          // Process was killed
        }
      };

      readOutput();

      // Wait for process to exit
      const exitCode = await process.exit;
      addTerminalLine(`Process exited with code ${exitCode}`, 'system');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Execution failed';
      addTerminalLine(message, 'stderr');
    } finally {
      setIsRunning(false);
      runningProcessRef.current = null;
    }
  }, [selectedFile, currentFile, isRunning, addTerminalLine]);

  // Install npm packages
  const installPackages = useCallback(async () => {
    if (!webContainerRef.current || isInstalling) return;

    const wc = webContainerRef.current;
    setIsInstalling(true);
    addTerminalLine('$ npm install', 'command');

    try {
      // Update package.json first
      const packageJson = files.find((f) => f.path === 'package.json');
      if (packageJson) {
        await wc.fs.writeFile('package.json', packageJson.content);
      }

      const installProcess = await wc.spawn('npm', ['install']);

      // Read output
      const reader = installProcess.output.getReader();

      const readOutput = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const lines = value.split('\n').filter((line) => line.trim());
            for (const line of lines) {
              addTerminalLine(line, 'stdout');
            }
          }
        } catch {
          // Process ended
        }
      };

      readOutput();

      const exitCode = await installProcess.exit;

      if (exitCode === 0) {
        addTerminalLine('Dependencies installed successfully!', 'system');
      } else {
        addTerminalLine(`npm install failed with code ${exitCode}`, 'stderr');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Install failed';
      addTerminalLine(message, 'stderr');
    } finally {
      setIsInstalling(false);
    }
  }, [files, isInstalling, addTerminalLine]);

  // Handle file selection
  const handleSelectFile = useCallback((path: string) => {
    setSelectedFile(path);
  }, []);

  // Handle code change
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (!value || !selectedFile) return;

      setFiles((prev) =>
        prev.map((f) => (f.path === selectedFile ? { ...f, content: value } : f))
      );
    },
    [selectedFile]
  );

  // Handle file creation
  const handleCreateFile = useCallback(
    (parentPath: string, name: string, type: 'file' | 'directory') => {
      const newPath = parentPath ? `${parentPath}/${name}` : name;

      if (type === 'file') {
        const language = getLanguageFromPath(name);
        setFiles((prev) => [...prev, { path: newPath, content: '', language }]);
        setSelectedFile(newPath);

        // Also write to WebContainer
        if (webContainerRef.current) {
          webContainerRef.current.fs.writeFile(newPath, '');
        }
      } else {
        // Create directory (WebContainer handles this implicitly)
        if (webContainerRef.current) {
          webContainerRef.current.fs.mkdir(newPath, { recursive: true });
        }
      }
    },
    []
  );

  // Handle file deletion
  const handleDeleteFile = useCallback(
    (path: string) => {
      setFiles((prev) => prev.filter((f) => !f.path.startsWith(path)));

      if (selectedFile === path || selectedFile.startsWith(path + '/')) {
        const remaining = files.filter((f) => !f.path.startsWith(path));
        setSelectedFile(remaining[0]?.path || '');
      }

      // Remove from WebContainer
      if (webContainerRef.current) {
        webContainerRef.current.fs.rm(path, { recursive: true });
      }
    },
    [selectedFile, files]
  );

  // Handle file rename
  const handleRenameFile = useCallback(
    async (path: string, newName: string) => {
      const parts = path.split('/');
      parts[parts.length - 1] = newName;
      const newPath = parts.join('/');

      setFiles((prev) =>
        prev.map((f) => {
          if (f.path === path) {
            return { ...f, path: newPath, language: getLanguageFromPath(newName) };
          }
          if (f.path.startsWith(path + '/')) {
            return { ...f, path: f.path.replace(path, newPath) };
          }
          return f;
        })
      );

      if (selectedFile === path) {
        setSelectedFile(newPath);
      }

      // Rename in WebContainer
      if (webContainerRef.current) {
        const content = files.find((f) => f.path === path)?.content || '';
        await webContainerRef.current.fs.rm(path);
        await webContainerRef.current.fs.writeFile(newPath, content);
      }
    },
    [selectedFile, files]
  );

  // Editor mount handler
  const handleEditorMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor;

    // Add keyboard shortcut for running code
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
      ],
      run: () => {
        runCode();
      },
    });
  }, [runCode]);

  // Build file tree for display
  const fileTree: FileNode[] = buildFileTree(files);

  // WebContainer error state
  if (webContainerError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 max-w-lg text-center">
          <h2 className="text-xl font-bold text-red-400 mb-4">WebContainer Error</h2>
          <p className="text-gray-300 mb-4">{webContainerError}</p>
          <p className="text-sm text-gray-400">
            WebContainers require a browser with SharedArrayBuffer support. Make sure you are using
            a modern browser and the page has the correct security headers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-white">Playground</h1>
          <div className="h-4 w-px bg-gray-600" />
          <div className="flex items-center gap-2">
            {isWebContainerReady ? (
              <span className="flex items-center gap-2 text-sm text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Ready
              </span>
            ) : (
              <span className="flex items-center gap-2 text-sm text-yellow-400">
                <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Loading...
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout toggle */}
          <button
            onClick={() => setLayout(layout === 'horizontal' ? 'vertical' : 'horizontal')}
            className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title="Toggle layout"
          >
            {layout === 'horizontal' ? 'Horizontal' : 'Vertical'}
          </button>

          {/* Install button */}
          <button
            onClick={installPackages}
            disabled={!isWebContainerReady || isInstalling}
            className={`px-4 py-1.5 text-sm rounded font-medium transition-colors ${
              isInstalling
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isInstalling ? 'Installing...' : 'npm install'}
          </button>

          {/* Run button */}
          <button
            onClick={runCode}
            disabled={!isWebContainerReady || isRunning || !currentFile}
            className={`px-4 py-1.5 text-sm rounded font-medium transition-colors flex items-center gap-2 ${
              isRunning || !isWebContainerReady
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
                Run
              </>
            )}
          </button>

          {/* Stop button */}
          {isRunning && (
            <button
              onClick={() => {
                if (runningProcessRef.current) {
                  runningProcessRef.current.kill();
                  runningProcessRef.current = null;
                  setIsRunning(false);
                  addTerminalLine('Process killed', 'system');
                }
              }}
              className="px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors"
            >
              Stop
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - File tree */}
        <div
          className="bg-gray-800 border-r border-gray-700 overflow-hidden flex flex-col"
          style={{ width: `${sidebarWidth}px`, minWidth: '150px', maxWidth: '400px' }}
        >
          <FileTree
            files={fileTree}
            selectedFile={selectedFile}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
            className="flex-1 border-0 rounded-none"
          />
        </div>

        {/* Resize handle for sidebar */}
        <div
          className="w-1 bg-gray-700 hover:bg-blue-500 cursor-col-resize transition-colors"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startWidth = sidebarWidth;

            const onMouseMove = (moveEvent: MouseEvent) => {
              const delta = moveEvent.clientX - startX;
              setSidebarWidth(Math.max(150, Math.min(400, startWidth + delta)));
            };

            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        />

        {/* Editor and terminal */}
        <div className={`flex-1 flex ${layout === 'horizontal' ? 'flex-col' : 'flex-row'}`}>
          {/* Editor */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedFile || 'empty'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 min-h-0"
              style={
                layout === 'horizontal'
                  ? { height: `${editorHeight}%` }
                  : { width: `${editorHeight}%` }
              }
            >
              {currentFile ? (
                <Editor
                  height="100%"
                  language={currentFile.language}
                  value={currentFile.content}
                  onChange={handleCodeChange}
                  onMount={handleEditorMount}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    automaticLayout: true,
                    padding: { top: 16 },
                    renderLineHighlight: 'all',
                    cursorBlinking: 'smooth',
                    fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, monospace",
                    fontLigatures: true,
                  }}
                  loading={
                    <div className="w-full h-full flex items-center justify-center bg-gray-900">
                      <div className="text-gray-400">Loading editor...</div>
                    </div>
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
                  Select a file to edit
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Resize handle */}
          <div
            className={`${
              layout === 'horizontal' ? 'h-1 cursor-row-resize' : 'w-1 cursor-col-resize'
            } bg-gray-700 hover:bg-blue-500 transition-colors`}
            onMouseDown={(e) => {
              const startPos = layout === 'horizontal' ? e.clientY : e.clientX;
              const startHeight = editorHeight;
              const container = e.currentTarget.parentElement;
              if (!container) return;

              const containerSize =
                layout === 'horizontal' ? container.clientHeight : container.clientWidth;

              const onMouseMove = (moveEvent: MouseEvent) => {
                const currentPos = layout === 'horizontal' ? moveEvent.clientY : moveEvent.clientX;
                const delta = currentPos - startPos;
                const deltaPercent = (delta / containerSize) * 100;
                setEditorHeight(Math.max(20, Math.min(80, startHeight + deltaPercent)));
              };

              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };

              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          />

          {/* Terminal */}
          <div
            className="flex-1 min-h-0"
            style={
              layout === 'horizontal'
                ? { height: `${100 - editorHeight}%` }
                : { width: `${100 - editorHeight}%` }
            }
          >
            <PlaygroundTerminal
              lines={terminalLines}
              isRunning={isRunning || isInstalling}
              onClear={clearTerminal}
              className="h-full rounded-none border-0"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 px-4 py-2 text-xs text-gray-400 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Ctrl+Enter</kbd> Run
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">Ctrl+L</kbd> Clear terminal
          </span>
        </div>
        <div className="flex items-center gap-2">
          {selectedFile && <span className="text-gray-500">{selectedFile}</span>}
          <span className="text-gray-500">|</span>
          <span>Powered by WebContainers</span>
        </div>
      </footer>
    </div>
  );
}
