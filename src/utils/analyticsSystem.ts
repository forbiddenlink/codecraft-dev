/**
 * Analytics System - Track user progress and learning patterns
 * Helps identify learning velocity, strong/weak concepts, and personalize experience
 */

export interface LearningAnalytics {
  // Time metrics
  timePerChallenge: Map<string, number>;
  totalPlayTime: number;
  sessionStartTime: number;
  averageChallengeTime: number;

  // Performance metrics
  errorsPerConcept: Map<string, number>;
  successRatePerConcept: Map<string, number>;
  attemptsPerChallenge: Map<string, number>;

  // Learning patterns
  strongConcepts: string[];
  weakConcepts: string[];
  learningVelocity: number; // challenges per hour
  streakDays: number;
  lastActiveDate: string;

  // Engagement metrics
  hintsUsedPerChallenge: Map<string, number>;
  achievementsEarned: number;
  challengesCompleted: number;
  perfectScores: number;

  // Code metrics
  linesOfCodeWritten: number;
  averageCodeLength: number;
  mostUsedHTMLTags: Map<string, number>;
  mostUsedCSSProperties: Map<string, number>;
}

class AnalyticsSystem {
  private analytics: LearningAnalytics;
  private storageKey = 'codecraft_analytics';

  constructor() {
    this.analytics = this.loadAnalytics();
  }

  private loadAnalytics(): LearningAnalytics {
    if (typeof window === 'undefined') {
      return this.getDefaultAnalytics();
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert plain objects back to Maps
        return {
          ...parsed,
          timePerChallenge: new Map(parsed.timePerChallenge || []),
          errorsPerConcept: new Map(parsed.errorsPerConcept || []),
          successRatePerConcept: new Map(parsed.successRatePerConcept || []),
          attemptsPerChallenge: new Map(parsed.attemptsPerChallenge || []),
          hintsUsedPerChallenge: new Map(parsed.hintsUsedPerChallenge || []),
          mostUsedHTMLTags: new Map(parsed.mostUsedHTMLTags || []),
          mostUsedCSSProperties: new Map(parsed.mostUsedCSSProperties || []),
        };
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }

    return this.getDefaultAnalytics();
  }

  private getDefaultAnalytics(): LearningAnalytics {
    return {
      timePerChallenge: new Map(),
      totalPlayTime: 0,
      sessionStartTime: Date.now(),
      averageChallengeTime: 0,
      errorsPerConcept: new Map(),
      successRatePerConcept: new Map(),
      attemptsPerChallenge: new Map(),
      strongConcepts: [],
      weakConcepts: [],
      learningVelocity: 0,
      streakDays: 0,
      lastActiveDate: new Date().toISOString(),
      hintsUsedPerChallenge: new Map(),
      achievementsEarned: 0,
      challengesCompleted: 0,
      perfectScores: 0,
      linesOfCodeWritten: 0,
      averageCodeLength: 0,
      mostUsedHTMLTags: new Map(),
      mostUsedCSSProperties: new Map(),
    };
  }

  private saveAnalytics(): void {
    if (typeof window === 'undefined') return;

    try {
      const toSave = {
        ...this.analytics,
        // Convert Maps to arrays for JSON serialization
        timePerChallenge: Array.from(this.analytics.timePerChallenge.entries()),
        errorsPerConcept: Array.from(this.analytics.errorsPerConcept.entries()),
        successRatePerConcept: Array.from(this.analytics.successRatePerConcept.entries()),
        attemptsPerChallenge: Array.from(this.analytics.attemptsPerChallenge.entries()),
        hintsUsedPerChallenge: Array.from(this.analytics.hintsUsedPerChallenge.entries()),
        mostUsedHTMLTags: Array.from(this.analytics.mostUsedHTMLTags.entries()),
        mostUsedCSSProperties: Array.from(this.analytics.mostUsedCSSProperties.entries()),
      };

      localStorage.setItem(this.storageKey, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  /**
   * Track challenge completion
   */
  trackChallengeComplete(
    challengeId: string,
    concept: string,
    timeSpent: number,
    attempts: number,
    hintsUsed: number,
    score: number,
    codeLength: number
  ): void {
    // Time tracking
    this.analytics.timePerChallenge.set(challengeId, timeSpent);
    this.updateAverageChallengeTime();

    // Attempts tracking
    this.analytics.attemptsPerChallenge.set(challengeId, attempts);

    // Hints tracking
    this.analytics.hintsUsedPerChallenge.set(challengeId, hintsUsed);

    // Success rate
    const currentRate = this.analytics.successRatePerConcept.get(concept) || 0;
    const successRate = score / 100;
    this.analytics.successRatePerConcept.set(
      concept,
      (currentRate + successRate) / 2 // Moving average
    );

    // Completion count
    this.analytics.challengesCompleted += 1;

    // Perfect scores
    if (score === 100) {
      this.analytics.perfectScores += 1;
    }

    // Code metrics
    this.analytics.linesOfCodeWritten += codeLength;
    this.updateAverageCodeLength();

    // Update learning velocity
    this.updateLearningVelocity();

    // Identify strong/weak concepts
    this.updateConceptStrength();

    this.saveAnalytics();
  }

  /**
   * Track errors by concept
   */
  trackError(concept: string): void {
    const currentErrors = this.analytics.errorsPerConcept.get(concept) || 0;
    this.analytics.errorsPerConcept.set(concept, currentErrors + 1);
    this.saveAnalytics();
  }

  /**
   * Track achievement unlock
   */
  trackAchievement(): void {
    this.analytics.achievementsEarned += 1;
    this.saveAnalytics();
  }

  /**
   * Track daily streak
   */
  updateStreak(): void {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = new Date(this.analytics.lastActiveDate).toISOString().split('T')[0];

    if (today !== lastActive) {
      const daysDiff = Math.floor(
        (new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 1) {
        // Consecutive day
        this.analytics.streakDays += 1;
      } else if (daysDiff > 1) {
        // Streak broken
        this.analytics.streakDays = 1;
      }

      this.analytics.lastActiveDate = new Date().toISOString();
      this.saveAnalytics();
    }
  }

  /**
   * Track HTML tag usage
   */
  trackHTMLTag(tag: string): void {
    const count = this.analytics.mostUsedHTMLTags.get(tag) || 0;
    this.analytics.mostUsedHTMLTags.set(tag, count + 1);
    this.saveAnalytics();
  }

  /**
   * Track CSS property usage
   */
  trackCSSProperty(property: string): void {
    const count = this.analytics.mostUsedCSSProperties.get(property) || 0;
    this.analytics.mostUsedCSSProperties.set(property, count + 1);
    this.saveAnalytics();
  }

  private updateAverageChallengeTime(): void {
    const times = Array.from(this.analytics.timePerChallenge.values());
    this.analytics.averageChallengeTime =
      times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  private updateAverageCodeLength(): void {
    this.analytics.averageCodeLength =
      this.analytics.linesOfCodeWritten / this.analytics.challengesCompleted;
  }

  private updateLearningVelocity(): void {
    const sessionDuration = (Date.now() - this.analytics.sessionStartTime) / (1000 * 60 * 60); // hours
    this.analytics.learningVelocity = this.analytics.challengesCompleted / sessionDuration;
  }

  private updateConceptStrength(): void {
    const concepts = Array.from(this.analytics.successRatePerConcept.entries());

    // Sort by success rate
    concepts.sort((a, b) => b[1] - a[1]);

    // Top 5 are strong concepts
    this.analytics.strongConcepts = concepts.slice(0, 5).map(([concept]) => concept);

    // Bottom 5 are weak concepts
    this.analytics.weakConcepts = concepts
      .slice(-5)
      .reverse()
      .map(([concept]) => concept);
  }

  /**
   * Get analytics summary
   */
  getAnalytics(): LearningAnalytics {
    return { ...this.analytics };
  }

  /**
   * Get personalized recommendations
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check weak concepts
    if (this.analytics.weakConcepts.length > 0) {
      recommendations.push(
        `Practice ${this.analytics.weakConcepts[0]} - you've struggled with this concept`
      );
    }

    // Check learning velocity
    if (this.analytics.learningVelocity < 0.5) {
      recommendations.push('Take your time! Quality over speed');
    } else if (this.analytics.learningVelocity > 2) {
      recommendations.push("You're on fire! Consider tackling expert challenges");
    }

    // Check streak
    if (this.analytics.streakDays >= 7) {
      recommendations.push('Amazing streak! Keep the momentum going');
    } else if (this.analytics.streakDays === 0) {
      recommendations.push('Start a learning streak by coding daily!');
    }

    // Check hint usage
    const avgHints =
      Array.from(this.analytics.hintsUsedPerChallenge.values()).reduce((a, b) => a + b, 0) /
      this.analytics.hintsUsedPerChallenge.size;

    if (avgHints > 3) {
      recommendations.push('Review fundamentals to reduce hint dependency');
    }

    return recommendations;
  }

  /**
   * Reset analytics
   */
  reset(): void {
    this.analytics = this.getDefaultAnalytics();
    this.saveAnalytics();
  }
}

// Singleton instance
let analyticsInstance: AnalyticsSystem | null = null;

export function getAnalyticsSystem(): AnalyticsSystem {
  if (!analyticsInstance) {
    analyticsInstance = new AnalyticsSystem();
  }
  return analyticsInstance;
}

export const trackChallengeComplete = (
  challengeId: string,
  concept: string,
  timeSpent: number,
  attempts: number,
  hintsUsed: number,
  score: number,
  codeLength: number
) => getAnalyticsSystem().trackChallengeComplete(challengeId, concept, timeSpent, attempts, hintsUsed, score, codeLength);

export const trackError = (concept: string) => getAnalyticsSystem().trackError(concept);
export const trackAchievement = () => getAnalyticsSystem().trackAchievement();
export const updateStreak = () => getAnalyticsSystem().updateStreak();
export const getAnalytics = () => getAnalyticsSystem().getAnalytics();
export const getRecommendations = () => getAnalyticsSystem().getRecommendations();
