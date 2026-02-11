/**
 * Spaced Repetition System (SRS) - Inspired by SuperMemo SM-2 algorithm
 * Helps learners retain knowledge through optimal review intervals
 */

export interface ReviewCard {
  challengeId: string;
  concept: string;
  easeFactor: number; // How easy the card is (1.3 - 2.5+)
  interval: number; // Days until next review
  repetitions: number; // Number of successful reviews
  dueDate: Date;
  lastReviewed: Date;
  quality: number; // Last quality rating (0-5)
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;
// 0 - Total blackout
// 1 - Incorrect, but recognized
// 2 - Incorrect, but seemed familiar
// 3 - Correct with serious difficulty
// 4 - Correct after hesitation
// 5 - Perfect response

class SpacedRepetitionSystem {
  private cards: Map<string, ReviewCard> = new Map();
  private storageKey = 'codecraft_srs';

  constructor() {
    this.loadCards();
  }

  private loadCards(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cards = new Map(
          parsed.map((card: any) => [
            card.challengeId,
            {
              ...card,
              dueDate: new Date(card.dueDate),
              lastReviewed: new Date(card.lastReviewed),
            },
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load SRS cards:', error);
    }
  }

  private saveCards(): void {
    if (typeof window === 'undefined') return;

    try {
      const cardsArray = Array.from(this.cards.values());
      localStorage.setItem(this.storageKey, JSON.stringify(cardsArray));
    } catch (error) {
      console.error('Failed to save SRS cards:', error);
    }
  }

  /**
   * Add a new card for spaced repetition
   */
  addCard(challengeId: string, concept: string): ReviewCard {
    const card: ReviewCard = {
      challengeId,
      concept,
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      lastReviewed: new Date(),
      quality: 0,
    };

    this.cards.set(challengeId, card);
    this.saveCards();
    return card;
  }

  /**
   * Review a card and update based on SM-2 algorithm
   */
  reviewCard(challengeId: string, quality: Quality): ReviewCard {
    const card = this.cards.get(challengeId);

    if (!card) {
      throw new Error(`Card not found: ${challengeId}`);
    }

    card.quality = quality;
    card.lastReviewed = new Date();

    // SM-2 Algorithm
    if (quality >= 3) {
      // Correct response
      if (card.repetitions === 0) {
        card.interval = 1;
      } else if (card.repetitions === 1) {
        card.interval = 6;
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }
      card.repetitions += 1;
    } else {
      // Incorrect response - reset repetitions
      card.repetitions = 0;
      card.interval = 1;
    }

    // Update ease factor
    card.easeFactor = Math.max(
      1.3,
      card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    );

    // Set next due date
    card.dueDate = new Date(Date.now() + card.interval * 24 * 60 * 60 * 1000);

    this.cards.set(challengeId, card);
    this.saveCards();

    return card;
  }

  /**
   * Get cards due for review
   */
  getDueCards(): ReviewCard[] {
    const now = new Date();
    return Array.from(this.cards.values()).filter((card) => card.dueDate <= now);
  }

  /**
   * Get cards by concept
   */
  getCardsByConcept(concept: string): ReviewCard[] {
    return Array.from(this.cards.values()).filter((card) => card.concept === concept);
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    totalCards: number;
    dueCards: number;
    masteredCards: number;
    averageEaseFactor: number;
  } {
    const cards = Array.from(this.cards.values());
    const dueCards = this.getDueCards().length;
    const masteredCards = cards.filter((card) => card.repetitions >= 5).length;
    const avgEaseFactor =
      cards.reduce((sum, card) => sum + card.easeFactor, 0) / cards.length || 0;

    return {
      totalCards: cards.length,
      dueCards,
      masteredCards,
      averageEaseFactor: avgEaseFactor,
    };
  }

  /**
   * Reset a card
   */
  resetCard(challengeId: string): void {
    const card = this.cards.get(challengeId);
    if (card) {
      card.repetitions = 0;
      card.interval = 1;
      card.easeFactor = 2.5;
      card.dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      this.saveCards();
    }
  }

  /**
   * Clear all cards
   */
  clearAll(): void {
    this.cards.clear();
    this.saveCards();
  }
}

/**
 * Adaptive Difficulty System
 * Adjusts challenge difficulty based on user performance
 */

export interface PerformanceMetrics {
  challengeId: string;
  attempts: number;
  timeSpent: number;
  hintsUsed: number;
  score: number;
  timestamp: Date;
}

export interface DifficultyRecommendation {
  suggestedDifficulty: number; // 1-5
  reason: string;
  confidence: number; // 0-1
}

class AdaptiveDifficultySystem {
  private performanceHistory: Map<string, PerformanceMetrics[]> = new Map();
  private storageKey = 'codecraft_adaptive_difficulty';
  private windowSize = 5; // Number of recent challenges to consider

  constructor() {
    this.loadPerformance();
  }

  private loadPerformance(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.performanceHistory = new Map(
          Object.entries(parsed).map(([concept, metrics]) => [
            concept,
            (metrics as any[]).map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
          ])
        );
      }
    } catch (error) {
      console.error('Failed to load performance history:', error);
    }
  }

  private savePerformance(): void {
    if (typeof window === 'undefined') return;

    try {
      const obj = Object.fromEntries(this.performanceHistory);
      localStorage.setItem(this.storageKey, JSON.stringify(obj));
    } catch (error) {
      console.error('Failed to save performance history:', error);
    }
  }

  /**
   * Record performance for a challenge
   */
  recordPerformance(concept: string, metrics: PerformanceMetrics): void {
    if (!this.performanceHistory.has(concept)) {
      this.performanceHistory.set(concept, []);
    }

    const history = this.performanceHistory.get(concept)!;
    history.push(metrics);

    // Keep only recent history
    if (history.length > this.windowSize * 2) {
      history.splice(0, history.length - this.windowSize * 2);
    }

    this.savePerformance();
  }

  /**
   * Get difficulty recommendation based on recent performance
   */
  getDifficultyRecommendation(concept: string): DifficultyRecommendation {
    const history = this.performanceHistory.get(concept);

    if (!history || history.length === 0) {
      return {
        suggestedDifficulty: 1,
        reason: 'No performance history - starting with easiest difficulty',
        confidence: 0.5,
      };
    }

    // Get recent performance
    const recentPerformance = history.slice(-this.windowSize);

    // Calculate average metrics
    const avgScore =
      recentPerformance.reduce((sum, p) => sum + p.score, 0) / recentPerformance.length;
    const avgAttempts =
      recentPerformance.reduce((sum, p) => sum + p.attempts, 0) / recentPerformance.length;
    const avgHints =
      recentPerformance.reduce((sum, p) => sum + p.hintsUsed, 0) / recentPerformance.length;
    const avgTime =
      recentPerformance.reduce((sum, p) => sum + p.timeSpent, 0) / recentPerformance.length;

    // Scoring factors
    let difficultyScore = 0;
    const reasons: string[] = [];

    // High scores indicate ready for harder challenges
    if (avgScore >= 95) {
      difficultyScore += 2;
      reasons.push('consistently high scores');
    } else if (avgScore >= 80) {
      difficultyScore += 1;
      reasons.push('good scores');
    } else if (avgScore < 70) {
      difficultyScore -= 1;
      reasons.push('struggling with accuracy');
    }

    // Few attempts indicate mastery
    if (avgAttempts === 1) {
      difficultyScore += 1;
      reasons.push('getting it right first time');
    } else if (avgAttempts > 3) {
      difficultyScore -= 1;
      reasons.push('requiring multiple attempts');
    }

    // Hint usage
    if (avgHints === 0) {
      difficultyScore += 1;
      reasons.push('solving independently');
    } else if (avgHints > 2) {
      difficultyScore -= 1;
      reasons.push('relying on hints');
    }

    // Time spent (relative to challenge type)
    // Assuming average time of 5 minutes per challenge
    const expectedTime = 5 * 60 * 1000;
    if (avgTime < expectedTime * 0.5) {
      difficultyScore += 1;
      reasons.push('completing quickly');
    } else if (avgTime > expectedTime * 2) {
      difficultyScore -= 1;
      reasons.push('taking longer than expected');
    }

    // Determine suggested difficulty (1-5)
    let suggestedDifficulty: number;
    if (difficultyScore >= 3) {
      suggestedDifficulty = 5;
    } else if (difficultyScore >= 1) {
      suggestedDifficulty = 4;
    } else if (difficultyScore >= -1) {
      suggestedDifficulty = 3;
    } else if (difficultyScore >= -3) {
      suggestedDifficulty = 2;
    } else {
      suggestedDifficulty = 1;
    }

    // Confidence based on sample size
    const confidence = Math.min(1, recentPerformance.length / this.windowSize);

    return {
      suggestedDifficulty,
      reason: reasons.join(', '),
      confidence,
    };
  }

  /**
   * Get performance trend
   */
  getPerformanceTrend(concept: string): 'improving' | 'stable' | 'declining' | 'unknown' {
    const history = this.performanceHistory.get(concept);

    if (!history || history.length < 3) {
      return 'unknown';
    }

    const recent = history.slice(-this.windowSize);
    const older = history.slice(-this.windowSize * 2, -this.windowSize);

    if (older.length === 0) return 'unknown';

    const recentAvg = recent.reduce((sum, p) => sum + p.score, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.score, 0) / older.length;

    const diff = recentAvg - olderAvg;

    if (diff > 10) return 'improving';
    if (diff < -10) return 'declining';
    return 'stable';
  }

  /**
   * Clear performance history
   */
  clearHistory(): void {
    this.performanceHistory.clear();
    this.savePerformance();
  }
}

// Singleton instances
let srsInstance: SpacedRepetitionSystem | null = null;
let adaptiveDifficultyInstance: AdaptiveDifficultySystem | null = null;

export function getSRS(): SpacedRepetitionSystem {
  if (!srsInstance) {
    srsInstance = new SpacedRepetitionSystem();
  }
  return srsInstance;
}

export function getAdaptiveDifficulty(): AdaptiveDifficultySystem {
  if (!adaptiveDifficultyInstance) {
    adaptiveDifficultyInstance = new AdaptiveDifficultySystem();
  }
  return adaptiveDifficultyInstance;
}

// Convenience exports
export const addSRSCard = (challengeId: string, concept: string) =>
  getSRS().addCard(challengeId, concept);
export const reviewSRSCard = (challengeId: string, quality: Quality) =>
  getSRS().reviewCard(challengeId, quality);
export const getDueCards = () => getSRS().getDueCards();
export const getSRSStatistics = () => getSRS().getStatistics();

export const recordPerformance = (concept: string, metrics: PerformanceMetrics) =>
  getAdaptiveDifficulty().recordPerformance(concept, metrics);
export const getDifficultyRecommendation = (concept: string) =>
  getAdaptiveDifficulty().getDifficultyRecommendation(concept);
export const getPerformanceTrend = (concept: string) =>
  getAdaptiveDifficulty().getPerformanceTrend(concept);

// =====================================================
// Concept-based Learning Integration
// Works with WebDevConcept types from challenges
// =====================================================

import type { WebDevConcept, Challenge } from '@/types/challenges';

/**
 * Record practice for concepts taught/reinforced in a challenge
 * Call this when a challenge is completed
 */
export function recordChallengeCompletion(
  challenge: Challenge,
  wasSuccessful: boolean,
  metrics?: Partial<PerformanceMetrics>
): void {
  const quality: Quality = wasSuccessful ? 4 : 2;
  const reinforceQuality: Quality = wasSuccessful ? 5 : 3;

  // Record SRS cards for concepts taught (new concepts)
  challenge.conceptsTaught?.forEach(concept => {
    const srs = getSRS();
    try {
      srs.reviewCard(concept, quality);
    } catch {
      // Card doesn't exist, add it
      srs.addCard(concept, concept);
      srs.reviewCard(concept, quality);
    }
  });

  // Record SRS cards for reinforced concepts
  challenge.conceptsReinforced?.forEach(concept => {
    const srs = getSRS();
    try {
      srs.reviewCard(concept, reinforceQuality);
    } catch {
      // Card doesn't exist, add it
      srs.addCard(concept, concept);
      srs.reviewCard(concept, reinforceQuality);
    }
  });

  // Record performance metrics if provided
  if (metrics) {
    const fullMetrics: PerformanceMetrics = {
      challengeId: challenge.id,
      attempts: metrics.attempts || 1,
      timeSpent: metrics.timeSpent || 0,
      hintsUsed: metrics.hintsUsed || 0,
      score: wasSuccessful ? 100 : metrics.score || 50,
      timestamp: new Date(),
    };

    // Record for all concepts in this challenge
    [...(challenge.conceptsTaught || []), ...(challenge.conceptsReinforced || [])].forEach(
      concept => {
        getAdaptiveDifficulty().recordPerformance(concept, fullMetrics);
      }
    );
  }
}

/**
 * Get concepts that need review across all categories
 */
export function getConceptsNeedingReview(): {
  html: ReviewCard[];
  css: ReviewCard[];
  javascript: ReviewCard[];
} {
  const dueCards = getDueCards();

  return {
    html: dueCards.filter(card => card.concept.startsWith('html-')),
    css: dueCards.filter(card => card.concept.startsWith('css-')),
    javascript: dueCards.filter(card => card.concept.startsWith('js-')),
  };
}

/**
 * Get overall mastery percentage by category
 */
export function getMasteryByCategory(): {
  html: number;
  css: number;
  javascript: number;
  overall: number;
} {
  const stats = getSRSStatistics();
  const cards = Array.from(getSRS()['cards'].values());

  const calculateCategoryMastery = (prefix: string): number => {
    const categoryCards = cards.filter(c => c.concept.startsWith(prefix));
    if (categoryCards.length === 0) return 0;

    const mastered = categoryCards.filter(c => c.repetitions >= 3);
    return (mastered.length / categoryCards.length) * 100;
  };

  return {
    html: calculateCategoryMastery('html-'),
    css: calculateCategoryMastery('css-'),
    javascript: calculateCategoryMastery('js-'),
    overall: stats.totalCards > 0
      ? (stats.masteredCards / stats.totalCards) * 100
      : 0,
  };
}

/**
 * Get human-readable concept name
 */
export function getConceptDisplayName(concept: WebDevConcept | string): string {
  const names: Record<string, string> = {
    // HTML
    'html-header': 'HTML Headers',
    'html-section': 'HTML Sections',
    'html-div': 'Div Containers',
    'html-span': 'Inline Spans',
    'html-lists': 'Lists (ul/ol/li)',
    'html-links': 'Anchor Links',
    'html-images': 'Images',
    'html-forms': 'Forms & Inputs',
    'html-nav': 'Navigation',
    'html-semantic': 'Semantic HTML',
    'html-nesting': 'Element Nesting',
    'html-attributes': 'Attributes',
    // CSS
    'css-colors': 'Colors',
    'css-fonts': 'Typography',
    'css-spacing': 'Margin & Padding',
    'css-borders': 'Borders',
    'css-sizing': 'Width & Height',
    'css-classes': 'CSS Classes',
    'css-selectors': 'Selectors',
    'css-hover': 'Hover States',
    'css-flexbox': 'Flexbox',
    'css-grid': 'CSS Grid',
    'css-flex-direction': 'Flex Direction',
    'css-justify-content': 'Justify Content',
    'css-align-items': 'Align Items',
    'css-responsive': 'Responsive Design',
    // JavaScript
    'js-variables': 'Variables',
    'js-functions': 'Functions',
    'js-loops': 'Loops',
    'js-conditionals': 'Conditionals',
    'js-dom': 'DOM Manipulation',
    'js-events': 'Event Handling',
    'js-async': 'Async/Await',
  };

  return names[concept] || concept;
}
