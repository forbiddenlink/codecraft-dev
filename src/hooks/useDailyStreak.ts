// File: /src/hooks/useDailyStreak.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalDaysActive: number;
  streakStartDate: string | null;
}

interface StreakMilestone {
  day: number;
  reward: {
    type: 'xp_boost' | 'cosmetic' | 'unlock' | 'badge';
    value: string | number;
    label: string;
  };
  claimed: boolean;
}

const STREAK_MILESTONES: Omit<StreakMilestone, 'claimed'>[] = [
  { day: 3, reward: { type: 'badge', value: 'early_bird', label: 'Early Bird Badge' } },
  { day: 7, reward: { type: 'xp_boost', value: 1.5, label: '1.5x XP Boost' } },
  { day: 14, reward: { type: 'badge', value: 'dedicated', label: 'Dedicated Coder Badge' } },
  { day: 30, reward: { type: 'cosmetic', value: 'golden_building', label: 'Golden Building Skin' } },
  { day: 60, reward: { type: 'badge', value: 'master', label: 'Code Master Badge' } },
  { day: 100, reward: { type: 'cosmetic', value: 'legendary_aura', label: 'Legendary Aura Effect' } },
];

const STORAGE_KEY = 'codecraft-daily-streak';
const MILESTONES_KEY = 'codecraft-streak-milestones';

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function isConsecutiveDay(lastDate: string, currentDate: string): boolean {
  const last = new Date(lastDate);
  const current = new Date(currentDate);
  const diffTime = current.getTime() - last.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

function isSameDay(date1: string, date2: string): boolean {
  return date1 === date2;
}

export function useDailyStreak() {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: null,
    totalDaysActive: 0,
    streakStartDate: null,
  });
  const [milestones, setMilestones] = useState<StreakMilestone[]>([]);
  const [isStreakUpdatedToday, setIsStreakUpdatedToday] = useState(false);

  // Load streak data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedMilestones = localStorage.getItem(MILESTONES_KEY);

    if (savedData) {
      const parsed: StreakData = JSON.parse(savedData);
      const today = getDateString();

      // Check if streak is still valid
      if (parsed.lastActiveDate) {
        if (isSameDay(parsed.lastActiveDate, today)) {
          // Already logged in today
          setStreakData(parsed);
          setIsStreakUpdatedToday(true);
        } else if (isConsecutiveDay(parsed.lastActiveDate, today)) {
          // Consecutive day - streak continues but not updated yet
          setStreakData(parsed);
          setIsStreakUpdatedToday(false);
        } else {
          // Streak broken
          setStreakData({
            currentStreak: 0,
            longestStreak: parsed.longestStreak,
            lastActiveDate: null,
            totalDaysActive: parsed.totalDaysActive,
            streakStartDate: null,
          });
          setIsStreakUpdatedToday(false);
        }
      } else {
        setStreakData(parsed);
      }
    }

    if (savedMilestones) {
      setMilestones(JSON.parse(savedMilestones));
    } else {
      // Initialize milestones
      setMilestones(STREAK_MILESTONES.map(m => ({ ...m, claimed: false })));
    }
  }, []);

  // Save streak data to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (streakData.totalDaysActive === 0 && streakData.currentStreak === 0) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(streakData));
  }, [streakData]);

  // Save milestones to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (milestones.length === 0) return;

    localStorage.setItem(MILESTONES_KEY, JSON.stringify(milestones));
  }, [milestones]);

  // Record activity for today
  const recordActivity = useCallback(() => {
    const today = getDateString();

    setStreakData(prev => {
      if (prev.lastActiveDate && isSameDay(prev.lastActiveDate, today)) {
        // Already recorded today
        return prev;
      }

      let newStreak = 1;
      let newStartDate = today;

      if (prev.lastActiveDate && isConsecutiveDay(prev.lastActiveDate, today)) {
        // Continue streak
        newStreak = prev.currentStreak + 1;
        newStartDate = prev.streakStartDate || today;
      }

      const newLongestStreak = Math.max(prev.longestStreak, newStreak);

      return {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: today,
        totalDaysActive: prev.totalDaysActive + 1,
        streakStartDate: newStartDate,
      };
    });

    setIsStreakUpdatedToday(true);
  }, []);

  // Claim a milestone reward
  const claimMilestone = useCallback((day: number) => {
    setMilestones(prev =>
      prev.map(m => (m.day === day ? { ...m, claimed: true } : m))
    );
  }, []);

  // Get available (unclaimed) milestones
  const availableMilestones = milestones.filter(
    m => m.day <= streakData.currentStreak && !m.claimed
  );

  // Get next milestone
  const nextMilestone = milestones.find(m => m.day > streakData.currentStreak);

  // Days until next milestone
  const daysUntilNextMilestone = nextMilestone
    ? nextMilestone.day - streakData.currentStreak
    : null;

  return {
    ...streakData,
    isStreakUpdatedToday,
    recordActivity,
    milestones,
    availableMilestones,
    nextMilestone,
    daysUntilNextMilestone,
    claimMilestone,
  };
}

export type { StreakData, StreakMilestone };
export { STREAK_MILESTONES };
