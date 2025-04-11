import { EditorProps } from '@monaco-editor/react';

export function getWorkerUrl(label: string): string {
  switch (label) {
    case 'typescript':
    case 'javascript':
      return '/_next/static/ts.worker.js';
    case 'html':
      return '/_next/static/html.worker.js';
    case 'css':
      return '/_next/static/css.worker.js';
    case 'editorWorkerService':
      return '/_next/static/editor.worker.js';
    default:
      throw new Error(`Unknown worker ${label}`);
  }
}

export const monacoEditorOptions: EditorProps['options'] = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
  },
  automaticLayout: true,
  fontSize: 14,
  lineNumbers: 'on',
  wordWrap: 'on',
}; 