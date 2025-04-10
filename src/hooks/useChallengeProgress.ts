// File: /src/hooks/useChallengeProgress.ts
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'codecraft:completedChallenges';

export default function useChallengeProgress() {
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCompleted(JSON.parse(stored));
    }
  }, []);

  const markComplete = (id: string) => {
    setCompleted((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const isComplete = (id: string) => completed.includes(id);

  return { completed, markComplete, isComplete };
}
