// File: /src/store/slices/editorSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ValidationError } from '@/utils/codeValidation';

export type EditorLanguage = 'html' | 'css' | 'javascript';

interface CodeFiles {
  html: string;
  css: string;
  javascript: string;
}

interface EditorState {
  isVisible: boolean;
  code: CodeFiles;
  language: EditorLanguage;
  errors: ValidationError[];
  isExecuting: boolean;
  lastExecutionSuccess: boolean | null;
}

const initialState: EditorState = {
  isVisible: false,
  code: {
    html: '',
    css: '',
    javascript: ''
  },
  language: 'html',
  errors: [],
  isExecuting: false,
  lastExecutionSuccess: null
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setEditorVisible: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },
    setCode: (state, action: PayloadAction<{ language: EditorLanguage; code: string }>) => {
      state.code[action.payload.language] = action.payload.code;
    },
    setLanguage: (state, action: PayloadAction<EditorLanguage>) => {
      state.language = action.payload;
    },
    setEditorErrors: (state, action: PayloadAction<ValidationError[]>) => {
      state.errors = action.payload;
    },
    setIsExecuting: (state, action: PayloadAction<boolean>) => {
      state.isExecuting = action.payload;
    },
    setLastExecutionSuccess: (state, action: PayloadAction<boolean>) => {
      state.lastExecutionSuccess = action.payload;
    },
    clearEditorState: (state) => {
      state.code = {
        html: '',
        css: '',
        javascript: ''
      };
      state.errors = [];
      state.lastExecutionSuccess = null;
    }
  }
});

export const {
  setEditorVisible,
  setCode,
  setLanguage,
  setEditorErrors,
  setIsExecuting,
  setLastExecutionSuccess,
  clearEditorState
} = editorSlice.actions;

export default editorSlice.reducer;