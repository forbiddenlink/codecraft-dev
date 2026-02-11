/**
 * Social Features - Leaderboards, Code Sharing, and Community
 */

export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  level: number;
  challengesCompleted: number;
  perfectScores: number;
  streak: number;
  timestamp: Date;
  rank?: number;
}

export interface SharedCode {
  id: string;
  userId: string;
  username: string;
  challengeId: string;
  challengeTitle: string;
  code: {
    html: string;
    css: string;
    javascript: string;
  };
  score: number;
  likes: number;
  views: number;
  createdAt: Date;
  tags: string[];
  description?: string;
}

export interface CodeComment {
  id: string;
  codeId: string;
  userId: string;
  username: string;
  text: string;
  createdAt: Date;
  likes: number;
}

class LeaderboardSystem {
  private storageKey = 'codecraft_leaderboard';
  private entries: LeaderboardEntry[] = [];

  constructor() {
    this.loadLeaderboard();
  }

  private loadLeaderboard(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.entries = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  }

  private saveLeaderboard(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
    } catch (error) {
      console.error('Failed to save leaderboard:', error);
    }
  }

  /**
   * Submit score to leaderboard
   */
  submitScore(entry: Omit<LeaderboardEntry, 'rank'>): void {
    // Remove old entry for this user if exists
    this.entries = this.entries.filter((e) => e.userId !== entry.userId);

    // Add new entry
    this.entries.push({ ...entry, timestamp: new Date() });

    // Sort and rank
    this.updateRanks();
    this.saveLeaderboard();
  }

  private updateRanks(): void {
    // Sort by score descending
    this.entries.sort((a, b) => b.score - a.score);

    // Assign ranks
    this.entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
  }

  /**
   * Get top N entries
   */
  getTopEntries(limit: number = 10): LeaderboardEntry[] {
    return this.entries.slice(0, limit);
  }

  /**
   * Get user's rank
   */
  getUserRank(userId: string): LeaderboardEntry | null {
    return this.entries.find((e) => e.userId === userId) || null;
  }

  /**
   * Get entries around user's rank
   */
  getEntriesAroundUser(userId: string, range: number = 5): LeaderboardEntry[] {
    const userEntry = this.getUserRank(userId);
    if (!userEntry || !userEntry.rank) return [];

    const startIndex = Math.max(0, userEntry.rank - range - 1);
    const endIndex = Math.min(this.entries.length, userEntry.rank + range);

    return this.entries.slice(startIndex, endIndex);
  }

  /**
   * Filter leaderboard by criteria
   */
  filterBy(criteria: {
    minLevel?: number;
    minChallenges?: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'allTime';
  }): LeaderboardEntry[] {
    let filtered = [...this.entries];

    if (criteria.minLevel) {
      filtered = filtered.filter((e) => e.level >= criteria.minLevel!);
    }

    if (criteria.minChallenges) {
      filtered = filtered.filter((e) => e.challengesCompleted >= criteria.minChallenges!);
    }

    if (criteria.timeframe && criteria.timeframe !== 'allTime') {
      const now = Date.now();
      const cutoff =
        criteria.timeframe === 'daily'
          ? 24 * 60 * 60 * 1000
          : criteria.timeframe === 'weekly'
          ? 7 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;

      filtered = filtered.filter((e) => now - e.timestamp.getTime() < cutoff);
    }

    return filtered;
  }

  /**
   * Clear leaderboard
   */
  clear(): void {
    this.entries = [];
    this.saveLeaderboard();
  }
}

class CodeSharingSystem {
  private storageKey = 'codecraft_shared_code';
  private sharedCodes: SharedCode[] = [];
  private commentsKey = 'codecraft_code_comments';
  private comments: CodeComment[] = [];

  constructor() {
    this.loadSharedCodes();
    this.loadComments();
  }

  private loadSharedCodes(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.sharedCodes = parsed.map((code: any) => ({
          ...code,
          createdAt: new Date(code.createdAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load shared codes:', error);
    }
  }

  private saveSharedCodes(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.sharedCodes));
    } catch (error) {
      console.error('Failed to save shared codes:', error);
    }
  }

  private loadComments(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.commentsKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.comments = parsed.map((comment: any) => ({
          ...comment,
          createdAt: new Date(comment.createdAt),
        }));
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }

  private saveComments(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.commentsKey, JSON.stringify(this.comments));
    } catch (error) {
      console.error('Failed to save comments:', error);
    }
  }

  /**
   * Share code solution
   */
  shareCode(code: Omit<SharedCode, 'id' | 'likes' | 'views' | 'createdAt'>): string {
    const id = `code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const sharedCode: SharedCode = {
      ...code,
      id,
      likes: 0,
      views: 0,
      createdAt: new Date(),
    };

    this.sharedCodes.push(sharedCode);
    this.saveSharedCodes();

    return id;
  }

  /**
   * Get shared code by ID
   */
  getSharedCode(id: string): SharedCode | null {
    const code = this.sharedCodes.find((c) => c.id === id);
    if (code) {
      code.views++;
      this.saveSharedCodes();
    }
    return code || null;
  }

  /**
   * Get all shared codes for a challenge
   */
  getCodesForChallenge(challengeId: string): SharedCode[] {
    return this.sharedCodes
      .filter((c) => c.challengeId === challengeId)
      .sort((a, b) => b.likes - a.likes);
  }

  /**
   * Get codes by user
   */
  getCodesByUser(userId: string): SharedCode[] {
    return this.sharedCodes
      .filter((c) => c.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Like/unlike code
   */
  toggleLike(codeId: string, userId: string): boolean {
    const code = this.sharedCodes.find((c) => c.id === codeId);
    if (!code) return false;

    // In a real app, track who liked what
    // For now, just increment/decrement
    code.likes++;
    this.saveSharedCodes();

    return true;
  }

  /**
   * Add comment to code
   */
  addComment(
    codeId: string,
    userId: string,
    username: string,
    text: string
  ): CodeComment {
    const comment: CodeComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      codeId,
      userId,
      username,
      text,
      createdAt: new Date(),
      likes: 0,
    };

    this.comments.push(comment);
    this.saveComments();

    return comment;
  }

  /**
   * Get comments for code
   */
  getComments(codeId: string): CodeComment[] {
    return this.comments
      .filter((c) => c.codeId === codeId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Search shared codes
   */
  searchCodes(query: {
    tags?: string[];
    minScore?: number;
    challengeId?: string;
    sortBy?: 'likes' | 'views' | 'recent';
  }): SharedCode[] {
    let results = [...this.sharedCodes];

    if (query.tags && query.tags.length > 0) {
      results = results.filter((code) =>
        query.tags!.some((tag) => code.tags.includes(tag))
      );
    }

    if (query.minScore) {
      results = results.filter((code) => code.score >= query.minScore!);
    }

    if (query.challengeId) {
      results = results.filter((code) => code.challengeId === query.challengeId);
    }

    // Sort
    switch (query.sortBy) {
      case 'likes':
        results.sort((a, b) => b.likes - a.likes);
        break;
      case 'views':
        results.sort((a, b) => b.views - a.views);
        break;
      case 'recent':
      default:
        results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    return results;
  }

  /**
   * Get trending codes
   */
  getTrendingCodes(limit: number = 10): SharedCode[] {
    // Simple trending: highest likes + views in last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    return this.sharedCodes
      .filter((code) => code.createdAt.getTime() > sevenDaysAgo)
      .sort((a, b) => {
        const scoreA = a.likes * 2 + a.views;
        const scoreB = b.likes * 2 + b.views;
        return scoreB - scoreA;
      })
      .slice(0, limit);
  }

  /**
   * Generate shareable link
   */
  generateShareableLink(codeId: string): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/share/${codeId}`;
  }

  /**
   * Export code as JSON
   */
  exportCode(codeId: string): string {
    const code = this.getSharedCode(codeId);
    if (!code) return '';

    return JSON.stringify(code, null, 2);
  }

  /**
   * Clear all shared codes
   */
  clear(): void {
    this.sharedCodes = [];
    this.comments = [];
    this.saveSharedCodes();
    this.saveComments();
  }
}

// Singleton instances
let leaderboardInstance: LeaderboardSystem | null = null;
let codeSharingInstance: CodeSharingSystem | null = null;

export function getLeaderboard(): LeaderboardSystem {
  if (!leaderboardInstance) {
    leaderboardInstance = new LeaderboardSystem();
  }
  return leaderboardInstance;
}

export function getCodeSharing(): CodeSharingSystem {
  if (!codeSharingInstance) {
    codeSharingInstance = new CodeSharingSystem();
  }
  return codeSharingInstance;
}

// Convenience exports
export const submitScore = (entry: Omit<LeaderboardEntry, 'rank'>) =>
  getLeaderboard().submitScore(entry);
export const getTopScores = (limit?: number) => getLeaderboard().getTopEntries(limit);
export const getUserRank = (userId: string) => getLeaderboard().getUserRank(userId);

export const shareCode = (code: Omit<SharedCode, 'id' | 'likes' | 'views' | 'createdAt'>) =>
  getCodeSharing().shareCode(code);
export const getSharedCode = (id: string) => getCodeSharing().getSharedCode(id);
export const getTrendingCodes = (limit?: number) => getCodeSharing().getTrendingCodes(limit);
export const searchCodes = (query: Parameters<CodeSharingSystem['searchCodes']>[0]) =>
  getCodeSharing().searchCodes(query);
