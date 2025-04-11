// File: /src/store/slices/editorSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ValidationError } from '@/utils/codeValidation';

interface EditorState {
  isVisible: boolean;
  currentCode: string;
  language: 'html' | 'css' | 'javascript';
  errors: ValidationError[];
  isExecuting: boolean;
  lastExecutionSuccess: boolean | null;
}

const initialState: EditorState = {
  isVisible: false,
  currentCode: '',
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
    setCode: (state, action: PayloadAction<string>) => {
      state.currentCode = action.payload;
    },
    setLanguage: (state, action: PayloadAction<EditorState['language']>) => {
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
      state.currentCode = '';
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