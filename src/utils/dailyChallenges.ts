/**
 * Daily Challenges & Missions System
 * Provides fresh content and engagement through daily/weekly challenges
 */

import type { Challenge } from '@/types/challenges';

export interface DailyChallenge {
  id: string;
  date: string;  // YYYY-MM-DD
  challenge: Challenge;
  bonus: {
    xp: number;
    resources?: {
      energy?: number;
      minerals?: number;
      water?: number;
      food?: number;
    };
    specialReward?: string;
  };
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  expiresAt: Date;
  completedBy: string[];  // User IDs
}

export interface WeeklyMission {
  id: string;
  week: number;  // Week number of year
  year: number;
  title: string;
  description: string;
  objectives: {
    id: string;
    description: string;
    target: number;
    current: number;
    type: 'completeChallenges' | 'earnXP' | 'perfectScores' | 'useNoHints' | 'speedRun';
  }[];
  rewards: {
    xp: number;
    achievement?: string;
    unlockable?: string;
  };
  expiresAt: Date;
  isCompleted: boolean;
}

export interface Streak {
  current: number;
  longest: number;
  lastCompletedDate: string;  // YYYY-MM-DD
  milestones: {
    days: number;
    reward: string;
    claimed: boolean;
  }[];
}

class DailyChallengeSystem {
  private storageKey = 'codecraft_daily_challenges';
  private challenges: Map<string, DailyChallenge> = new Map();
  private currentChallenge: DailyChallenge | null = null;

  constructor() {
    this.loadChallenges();
    this.generateTodaysChallenge();
  }

  private loadChallenges(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.challenges = new Map(
          parsed.map((challenge: any) => [
            challenge.id,
            {
              ...challenge,
              expiresAt: new Date(challenge.expiresAt),
            },
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load daily challenges:', error);
    }
  }

  private saveChallenges(): void {
    if (typeof window === 'undefined') return;

    try {
      const challengesArray = Array.from(this.challenges.values());
      localStorage.setItem(this.storageKey, JSON.stringify(challengesArray));
    } catch (error) {
      console.error('Failed to save daily challenges:', error);
    }
  }

  private generateTodaysChallenge(): void {
    const today = new Date().toISOString().split('T')[0];
    const existing = Array.from(this.challenges.values()).find((c) => c.date === today);

    if (existing) {
      this.currentChallenge = existing;
      return;
    }

    // Generate new challenge based on day of week
    const dayOfWeek = new Date().getDay();
    const difficulty = this.getDifficultyForDay(dayOfWeek);

    // In a real implementation, you'd select from your challenge pool
    // For now, create a template
    const dailyChallenge: DailyChallenge = {
      id: `daily_${today}`,
      date: today,
      challenge: this.generateChallenge(difficulty),
      bonus: this.getBonusRewards(difficulty),
      difficulty,
      expiresAt: new Date(new Date().setHours(23, 59, 59, 999)),
      completedBy: [],
    };

    this.challenges.set(dailyChallenge.id, dailyChallenge);
    this.currentChallenge = dailyChallenge;
    this.saveChallenges();
  }

  private getDifficultyForDay(dayOfWeek: number): DailyChallenge['difficulty'] {
    // Monday-Wednesday: Easy-Medium
    // Thursday-Friday: Medium-Hard
    // Weekend: Hard-Expert
    const schedule: Record<number, DailyChallenge['difficulty']> = {
      0: 'hard',      // Sunday
      1: 'easy',      // Monday
      2: 'medium',    // Tuesday
      3: 'medium',    // Wednesday
      4: 'hard',      // Thursday
      5: 'hard',      // Friday
      6: 'expert',    // Saturday
    };

    return schedule[dayOfWeek] || 'medium';
  }

  private generateChallenge(difficulty: DailyChallenge['difficulty']): Challenge {
    // This would select from your actual challenge pool
    // Template for demonstration
    return {
      id: `daily_${Date.now()}`,
      title: `Daily ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Challenge`,
      description: 'Complete today\'s special challenge for bonus rewards!',
      category: 'structure',
      difficulty: difficulty === 'expert' ? 3 : difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1,
      requiredChallenges: [],
      htmlTemplate: '',
      cssTemplate: '',
      validate: (code: string) => code.length > 0,
      rewards: [],
      objectives: [],
      hints: [],
    };
  }

  private getBonusRewards(difficulty: DailyChallenge['difficulty']): DailyChallenge['bonus'] {
    const bonusMultipliers = {
      easy: 1,
      medium: 1.5,
      hard: 2,
      expert: 3,
    };

    const multiplier = bonusMultipliers[difficulty];

    return {
      xp: Math.round(100 * multiplier),
      resources: {
        energy: Math.round(50 * multiplier),
        minerals: Math.round(30 * multiplier),
        water: Math.round(20 * multiplier),
        food: Math.round(20 * multiplier),
      },
      specialReward: difficulty === 'expert' ? 'exclusive_badge' : undefined,
    };
  }

  /**
   * Get today's challenge
   */
  getTodaysChallenge(): DailyChallenge | null {
    return this.currentChallenge;
  }

  /**
   * Complete daily challenge
   */
  completeChallenge(userId: string): void {
    if (!this.currentChallenge) return;

    if (!this.currentChallenge.completedBy.includes(userId)) {
      this.currentChallenge.completedBy.push(userId);
      this.saveChallenges();
    }
  }

  /**
   * Check if user completed today's challenge
   */
  hasCompletedToday(userId: string): boolean {
    if (!this.currentChallenge) return false;
    return this.currentChallenge.completedBy.includes(userId);
  }

  /**
   * Get completion statistics
   */
  getStatistics(): {
    totalChallenges: number;
    completedToday: number;
    difficulty: DailyChallenge['difficulty'];
  } {
    return {
      totalChallenges: this.challenges.size,
      completedToday: this.currentChallenge?.completedBy.length || 0,
      difficulty: this.currentChallenge?.difficulty || 'medium',
    };
  }
}

class WeeklyMissionSystem {
  private storageKey = 'codecraft_weekly_missions';
  private missions: Map<string, WeeklyMission> = new Map();
  private currentMission: WeeklyMission | null = null;

  constructor() {
    this.loadMissions();
    this.generateWeeklyMission();
  }

  private loadMissions(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.missions = new Map(
          parsed.map((mission: any) => [
            mission.id,
            {
              ...mission,
              expiresAt: new Date(mission.expiresAt),
            },
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load weekly missions:', error);
    }
  }

  private saveMissions(): void {
    if (typeof window === 'undefined') return;

    try {
      const missionsArray = Array.from(this.missions.values());
      localStorage.setItem(this.storageKey, JSON.stringify(missionsArray));
    } catch (error) {
      console.error('Failed to save weekly missions:', error);
    }
  }

  private generateWeeklyMission(): void {
    const now = new Date();
    const week = this.getWeekNumber(now);
    const year = now.getFullYear();

    const existingId = `weekly_${year}_${week}`;
    const existing = this.missions.get(existingId);

    if (existing) {
      this.currentMission = existing;
      return;
    }

    // Generate new weekly mission
    const mission: WeeklyMission = {
      id: existingId,
      week,
      year,
      title: 'Weekly Master Challenge',
      description: 'Complete all objectives this week for exclusive rewards!',
      objectives: [
        {
          id: 'obj1',
          description: 'Complete 7 coding challenges',
          target: 7,
          current: 0,
          type: 'completeChallenges',
        },
        {
          id: 'obj2',
          description: 'Earn 1000 XP',
          target: 1000,
          current: 0,
          type: 'earnXP',
        },
        {
          id: 'obj3',
          description: 'Get 3 perfect scores',
          target: 3,
          current: 0,
          type: 'perfectScores',
        },
        {
          id: 'obj4',
          description: 'Complete 2 challenges without hints',
          target: 2,
          current: 0,
          type: 'useNoHints',
        },
      ],
      rewards: {
        xp: 500,
        achievement: 'weekly_champion',
        unlockable: 'special_theme',
      },
      expiresAt: this.getEndOfWeek(),
      isCompleted: false,
    };

    this.missions.set(mission.id, mission);
    this.currentMission = mission;
    this.saveMissions();
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getEndOfWeek(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = 7 - dayOfWeek;
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }

  /**
   * Get current weekly mission
   */
  getCurrentMission(): WeeklyMission | null {
    return this.currentMission;
  }

  /**
   * Update objective progress
   */
  updateProgress(objectiveType: WeeklyMission['objectives'][0]['type'], amount: number): void {
    if (!this.currentMission) return;

    const objective = this.currentMission.objectives.find((obj) => obj.type === objectiveType);
    if (objective) {
      objective.current = Math.min(objective.current + amount, objective.target);

      // Check if mission is completed
      const allCompleted = this.currentMission.objectives.every(
        (obj) => obj.current >= obj.target
      );
      if (allCompleted) {
        this.currentMission.isCompleted = true;
      }

      this.saveMissions();
    }
  }

  /**
   * Get mission progress percentage
   */
  getProgress(): number {
    if (!this.currentMission) return 0;

    const totalProgress = this.currentMission.objectives.reduce(
      (sum, obj) => sum + (obj.current / obj.target),
      0
    );

    return Math.round((totalProgress / this.currentMission.objectives.length) * 100);
  }
}

class StreakSystem {
  private storageKey = 'codecraft_streak';
  private streak: Streak;

  constructor() {
    this.streak = this.loadStreak();
  }

  private loadStreak(): Streak {
    if (typeof window === 'undefined') {
      return this.getDefaultStreak();
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load streak:', error);
    }

    return this.getDefaultStreak();
  }

  private getDefaultStreak(): Streak {
    return {
      current: 0,
      longest: 0,
      lastCompletedDate: '',
      milestones: [
        { days: 7, reward: '7_day_warrior', claimed: false },
        { days: 14, reward: '14_day_champion', claimed: false },
        { days: 30, reward: '30_day_legend', claimed: false },
        { days: 60, reward: '60_day_master', claimed: false },
        { days: 100, reward: '100_day_deity', claimed: false },
      ],
    };
  }

  private saveStreak(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.streak));
    } catch (error) {
      console.error('Failed to save streak:', error);
    }
  }

  /**
   * Record activity for today
   */
  recordActivity(): void {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = this.streak.lastCompletedDate;

    if (lastDate === today) {
      // Already recorded today
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      // Consecutive day - increment streak
      this.streak.current += 1;
    } else if (lastDate === '') {
      // First day
      this.streak.current = 1;
    } else {
      // Streak broken - reset
      this.streak.current = 1;
    }

    this.streak.lastCompletedDate = today;
    this.streak.longest = Math.max(this.streak.longest, this.streak.current);
    this.saveStreak();
  }

  /**
   * Get current streak
   */
  getStreak(): Streak {
    return { ...this.streak };
  }

  /**
   * Claim milestone reward
   */
  claimMilestone(days: number): boolean {
    const milestone = this.streak.milestones.find((m) => m.days === days);

    if (!milestone || milestone.claimed || this.streak.current < days) {
      return false;
    }

    milestone.claimed = true;
    this.saveStreak();
    return true;
  }

  /**
   * Get available milestones
   */
  getAvailableMilestones(): Streak['milestones'] {
    return this.streak.milestones.filter(
      (m) => !m.claimed && this.streak.current >= m.days
    );
  }
}

// Singleton instances
let dailyChallengeInstance: DailyChallengeSystem | null = null;
let weeklyMissionInstance: WeeklyMissionSystem | null = null;
let streakInstance: StreakSystem | null = null;

export function getDailyChallengeSystem(): DailyChallengeSystem {
  if (!dailyChallengeInstance) {
    dailyChallengeInstance = new DailyChallengeSystem();
  }
  return dailyChallengeInstance;
}

export function getWeeklyMissionSystem(): WeeklyMissionSystem {
  if (!weeklyMissionInstance) {
    weeklyMissionInstance = new WeeklyMissionSystem();
  }
  return weeklyMissionInstance;
}

export function getStreakSystem(): StreakSystem {
  if (!streakInstance) {
    streakInstance = new StreakSystem();
  }
  return streakInstance;
}

// Convenience exports
export const getTodaysChallenge = () => getDailyChallengeSystem().getTodaysChallenge();
export const completeDailyChallenge = (userId: string) =>
  getDailyChallengeSystem().completeChallenge(userId);
export const getCurrentMission = () => getWeeklyMissionSystem().getCurrentMission();
export const updateMissionProgress = (
  type: WeeklyMission['objectives'][0]['type'],
  amount: number
) => getWeeklyMissionSystem().updateProgress(type, amount);
export const recordDailyActivity = () => getStreakSystem().recordActivity();
export const getStreak = () => getStreakSystem().getStreak();
