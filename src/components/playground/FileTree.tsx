// File: /src/components/playground/FileTree.tsx
'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileNode[];
  content?: string;
  language?: string;
}

interface FileTreeProps {
  files: FileNode[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  onCreateFile?: (parentPath: string, name: string, type: 'file' | 'directory') => void;
  onDeleteFile?: (path: string) => void;
  onRenameFile?: (path: string, newName: string) => void;
  className?: string;
}

// Icon components
function FolderIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={`w-4 h-4 ${isOpen ? 'text-yellow-400' : 'text-yellow-500'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      {isOpen ? (
        <path
          fillRule="evenodd"
          d="M2 6a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1H2V6z"
          clipRule="evenodd"
        />
      ) : (
        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
      )}
      {isOpen && (
        <path d="M2 9h14v5a2 2 0 01-2 2H4a2 2 0 01-2-2V9z" />
      )}
    </svg>
  );
}

function FileIcon({ language }: { language?: string }) {
  const getColor = () => {
    switch (language) {
      case 'javascript':
      case 'js':
        return 'text-yellow-400';
      case 'typescript':
      case 'ts':
      case 'tsx':
        return 'text-blue-400';
      case 'python':
      case 'py':
        return 'text-green-400';
      case 'json':
        return 'text-orange-400';
      case 'html':
        return 'text-red-400';
      case 'css':
        return 'text-purple-400';
      case 'go':
        return 'text-cyan-400';
      case 'rust':
      case 'rs':
        return 'text-orange-500';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <svg className={`w-4 h-4 ${getColor()}`} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.svg
      className="w-3 h-3 text-gray-500"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      initial={false}
      animate={{ rotate: isOpen ? 90 : 0 }}
      transition={{ duration: 0.15 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </motion.svg>
  );
}

interface FileTreeItemProps {
  node: FileNode;
  depth: number;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  onCreateFile?: (parentPath: string, name: string, type: 'file' | 'directory') => void;
  onDeleteFile?: (path: string) => void;
  onRenameFile?: (path: string, newName: string) => void;
}

function FileTreeItem({
  node,
  depth,
  selectedFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
}: FileTreeItemProps) {
  const [isOpen, setIsOpen] = useState(depth === 0);
  const [isHovered, setIsHovered] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(node.name);

  const isSelected = selectedFile === node.path;
  const isDirectory = node.type === 'directory';

  const handleClick = useCallback(() => {
    if (isDirectory) {
      setIsOpen(!isOpen);
    } else {
      onSelectFile(node.path);
    }
  }, [isDirectory, isOpen, node.path, onSelectFile]);

  const handleRename = useCallback(() => {
    if (newName && newName !== node.name && onRenameFile) {
      onRenameFile(node.path, newName);
    }
    setIsRenaming(false);
  }, [newName, node.name, node.path, onRenameFile]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleRename();
      } else if (e.key === 'Escape') {
        setNewName(node.name);
        setIsRenaming(false);
      }
    },
    [handleRename, node.name]
  );

  const getLanguageFromName = (name: string): string | undefined => {
    const ext = name.split('.').pop()?.toLowerCase();
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
      go: 'go',
      rs: 'rust',
      c: 'c',
      cpp: 'cpp',
      java: 'java',
    };
    return ext ? extToLang[ext] : undefined;
  };

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer rounded-sm transition-colors ${
          isSelected
            ? 'bg-blue-600 text-white'
            : isHovered
              ? 'bg-gray-700 text-white'
              : 'text-gray-300 hover:bg-gray-700'
        }`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={() => setIsRenaming(true)}
      >
        {isDirectory && <ChevronIcon isOpen={isOpen} />}
        {!isDirectory && <span className="w-3" />}

        {isDirectory ? (
          <FolderIcon isOpen={isOpen} />
        ) : (
          <FileIcon language={node.language || getLanguageFromName(node.name)} />
        )}

        {isRenaming ? (
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-gray-800 text-white text-sm px-1 py-0.5 rounded border border-blue-500 focus:outline-none"
            autoFocus
          />
        ) : (
          <span className="text-sm truncate flex-1">{node.name}</span>
        )}

        {/* Context menu buttons */}
        {isHovered && !isRenaming && (
          <div className="flex items-center gap-1 ml-auto">
            {isDirectory && onCreateFile && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const name = prompt('Enter file name:');
                    if (name) onCreateFile(node.path, name, 'file');
                  }}
                  className="p-0.5 hover:bg-gray-600 rounded"
                  title="New file"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const name = prompt('Enter folder name:');
                    if (name) onCreateFile(node.path, name, 'directory');
                  }}
                  className="p-0.5 hover:bg-gray-600 rounded"
                  title="New folder"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                </button>
              </>
            )}
            {onDeleteFile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete ${node.name}?`)) {
                    onDeleteFile(node.path);
                  }
                }}
                className="p-0.5 hover:bg-red-600 rounded"
                title="Delete"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      <AnimatePresence>
        {isDirectory && isOpen && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {node.children.map((child) => (
              <FileTreeItem
                key={child.path}
                node={child}
                depth={depth + 1}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
                onCreateFile={onCreateFile}
                onDeleteFile={onDeleteFile}
                onRenameFile={onRenameFile}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FileTree({
  files,
  selectedFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  className = '',
}: FileTreeProps) {
  return (
    <div className={`bg-gray-800 rounded-lg border border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700">
        <span className="text-sm font-medium text-gray-300">Files</span>
        {onCreateFile && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const name = prompt('Enter file name:');
                if (name) onCreateFile('', name, 'file');
              }}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              title="New file"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                const name = prompt('Enter folder name:');
                if (name) onCreateFile('', name, 'directory');
              }}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              title="New folder"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* File tree content */}
      <div className="py-2 overflow-y-auto max-h-[400px]">
        {files.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No files yet. Create one to get started.
          </div>
        ) : (
          files.map((file) => (
            <FileTreeItem
              key={file.path}
              node={file}
              depth={0}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              onCreateFile={onCreateFile}
              onDeleteFile={onDeleteFile}
              onRenameFile={onRenameFile}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Helper function to create a file tree from a flat list of paths
export function buildFileTree(
  files: Array<{ path: string; content?: string }>
): FileNode[] {
  const root: FileNode[] = [];

  for (const file of files) {
    const parts = file.path.split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/');

      let node = current.find((n) => n.name === part);

      if (!node) {
        node = {
          name: part,
          type: isLast ? 'file' : 'directory',
          path: currentPath,
          children: isLast ? undefined : [],
          content: isLast ? file.content : undefined,
        };
        current.push(node);
      }

      if (!isLast && node.children) {
        current = node.children;
      }
    }
  }

  // Sort: directories first, then files, alphabetically
  const sortNodes = (nodes: FileNode[]): FileNode[] => {
    return nodes
      .sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
      .map((node) => ({
        ...node,
        children: node.children ? sortNodes(node.children) : undefined,
      }));
  };

  return sortNodes(root);
}

export default FileTree;
