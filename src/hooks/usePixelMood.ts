// File: /src/hooks/usePixelMood.ts
import { useState, useEffect } from 'react';

export type PixelMood = 'neutral' | 'happy' | 'confused';

export default function usePixelMood(success: boolean) {
  const [mood, setMood] = useState<PixelMood>('neutral');

  useEffect(() => {
    setMood(success ? 'happy' : 'confused');

    const timeout = setTimeout(() => {
      setMood('neutral');
    }, 3000); // Reset mood after 3s

    return () => clearTimeout(timeout);
  }, [success]);

  return mood;
}