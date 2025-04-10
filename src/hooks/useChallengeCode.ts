// File: /src/hooks/useChallengeCode.ts
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/reduxHooks';
import { setCode } from '@/store/slices/editorSlice';

export default function useChallengeCode(challengeId: string) {
  const dispatch = useAppDispatch();
  const code = useAppSelector((state) => state.editor.currentCode);

  // Load code from localStorage on challenge change
  useEffect(() => {
    const saved = localStorage.getItem(`challenge-code:${challengeId}`);
    if (saved) {
      dispatch(setCode(saved));
    }
  }, [challengeId, dispatch]);

  // Save code to localStorage on code change
  useEffect(() => {
    localStorage.setItem(`challenge-code:${challengeId}`, code);
  }, [challengeId, code]);
}
