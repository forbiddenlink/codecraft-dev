// File: /src/hooks/useChallengeProgress.ts
import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { getChallengeById } from '@/data/challenges';
import { addResources } from '@/store/slices/resourceSlice';
import { unlockBuilding } from '@/store/slices/buildingSlice';
import { unlockVillager } from '@/store/slices/villagerSlice';

export function useChallengeProgress() {
  const dispatch = useAppDispatch();
  const [completed, setCompleted] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('completed-challenges');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('completed-challenges', JSON.stringify(completed));
    }
  }, [completed]);

  const completeChallenge = (challengeId: string) => {
    if (completed.includes(challengeId)) return;

    const challenge = getChallengeById(challengeId);
    if (!challenge) return;

    // Check if all required challenges are completed
    if (!challenge.requiredChallenges.every(req => completed.includes(req))) {
      console.warn('Cannot complete challenge - prerequisites not met');
      return;
    }

    // Grant rewards
    challenge.rewards.forEach(reward => {
      switch (reward.type) {
        case 'resource':
          if (reward.amount) {
            dispatch(addResources({ type: reward.id, amount: reward.amount }));
          }
          break;
        case 'building':
          dispatch(unlockBuilding(reward.id));
          break;
        case 'villager':
          dispatch(unlockVillager(reward.id));
          break;
        case 'ability':
          // TODO: Implement ability unlocking
          break;
      }
    });

    setCompleted(prev => [...prev, challengeId]);
  };

  return {
    completed,
    completeChallenge,
  };
}
