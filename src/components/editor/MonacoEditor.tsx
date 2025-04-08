// File: /src/components/editor/MonacoEditor.tsx
'use client';
import Editor from '@monaco-editor/react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { setCode } from '@/store/slices/editorSlice';

export default function MonacoEditor() {
  const dispatch = useAppDispatch();
  const code = useAppSelector(state => state.editor.currentCode);
  const language = useAppSelector(state => state.editor.language);

  return (
    <Editor
      height="100%"
      defaultLanguage="html"
      language={language}
      value={code}
      theme="vs-dark"
      onChange={(value) => dispatch(setCode(value || ''))}
    />
  );
}