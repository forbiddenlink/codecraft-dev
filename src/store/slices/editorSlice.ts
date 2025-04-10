// File: /src/store/slices/editorSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EditorState {
  currentCode: string;
  language: 'html' | 'css' | 'javascript';
  isVisible: boolean;
}

const initialState: EditorState = {
  currentCode: '<div>Hello CodeCraft</div>',
  language: 'html',
  isVisible: false,
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.currentCode = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'html' | 'css' | 'javascript'>) => {
      state.language = action.payload;
    },
    setEditorVisible: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },
  },
});

export const { setCode, setLanguage, setEditorVisible } = editorSlice.actions;
export default editorSlice.reducer;