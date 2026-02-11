/**
 * Progressive Hints System
 * Provides increasingly specific hints as user struggles
 */

export interface Hint {
  level: 1 | 2 | 3 | 4 | 5;  // 1 = vague, 5 = specific
  text: string;
  codeSnippet?: string;
  explanation?: string;
  link?: string;
}

export interface HintStrategy {
  challengeId: string;
  concept: string;
  hints: Hint[];
  currentLevel: number;
  attempts: number;
  timeStuck: number;  // milliseconds
}

class ProgressiveHintSystem {
  private strategies: Map<string, HintStrategy> = new Map();
  private storageKey = 'codecraft_hints';

  // Hint trigger thresholds
  private config = {
    attemptsForLevel2: 2,
    attemptsForLevel3: 4,
    attemptsForLevel4: 6,
    attemptsForLevel5: 8,
    timeForAutoHint: 180000,  // 3 minutes
  };

  constructor() {
    this.loadStrategies();
  }

  private loadStrategies(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.strategies = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Failed to load hint strategies:', error);
    }
  }

  private saveStrategies(): void {
    if (typeof window === 'undefined') return;

    try {
      const obj = Object.fromEntries(this.strategies);
      localStorage.setItem(this.storageKey, JSON.stringify(obj));
    } catch (error) {
      console.error('Failed to save hint strategies:', error);
    }
  }

  /**
   * Initialize hint strategy for a challenge
   */
  initializeStrategy(challengeId: string, concept: string, hints: Hint[]): void {
    this.strategies.set(challengeId, {
      challengeId,
      concept,
      hints: hints.sort((a, b) => a.level - b.level),
      currentLevel: 0,
      attempts: 0,
      timeStuck: 0,
    });
    this.saveStrategies();
  }

  /**
   * Record an attempt
   */
  recordAttempt(challengeId: string): void {
    const strategy = this.strategies.get(challengeId);
    if (!strategy) return;

    strategy.attempts++;
    this.saveStrategies();
  }

  /**
   * Update time stuck
   */
  updateTimeStuck(challengeId: string, timeMs: number): void {
    const strategy = this.strategies.get(challengeId);
    if (!strategy) return;

    strategy.timeStuck = timeMs;
    this.saveStrategies();
  }

  /**
   * Get next hint based on progressive difficulty
   */
  getNextHint(challengeId: string): Hint | null {
    const strategy = this.strategies.get(challengeId);
    if (!strategy) return null;

    // Determine hint level based on attempts and time
    let targetLevel = 1;

    if (strategy.attempts >= this.config.attemptsForLevel5) {
      targetLevel = 5;
    } else if (strategy.attempts >= this.config.attemptsForLevel4) {
      targetLevel = 4;
    } else if (strategy.attempts >= this.config.attemptsForLevel3) {
      targetLevel = 3;
    } else if (strategy.attempts >= this.config.attemptsForLevel2) {
      targetLevel = 2;
    }

    // Also check time stuck
    if (strategy.timeStuck >= this.config.timeForAutoHint) {
      targetLevel = Math.max(targetLevel, 3);
    }

    // Find hint at or below target level that hasn't been shown
    const availableHints = strategy.hints.filter(
      (h) => h.level <= targetLevel && h.level > strategy.currentLevel
    );

    if (availableHints.length === 0) {
      // No new hints available
      return null;
    }

    // Get the most specific hint available
    const hint = availableHints[availableHints.length - 1];
    strategy.currentLevel = hint.level;
    this.saveStrategies();

    return hint;
  }

  /**
   * Get all available hints up to current level
   */
  getAllHints(challengeId: string): Hint[] {
    const strategy = this.strategies.get(challengeId);
    if (!strategy) return [];

    return strategy.hints.filter((h) => h.level <= strategy.currentLevel);
  }

  /**
   * Check if auto-hint should be shown
   */
  shouldShowAutoHint(challengeId: string): boolean {
    const strategy = this.strategies.get(challengeId);
    if (!strategy) return false;

    return (
      strategy.timeStuck >= this.config.timeForAutoHint &&
      strategy.currentLevel < 3
    );
  }

  /**
   * Reset hint strategy for challenge
   */
  resetStrategy(challengeId: string): void {
    const strategy = this.strategies.get(challengeId);
    if (!strategy) return;

    strategy.currentLevel = 0;
    strategy.attempts = 0;
    strategy.timeStuck = 0;
    this.saveStrategies();
  }

  /**
   * Get hint statistics
   */
  getStatistics(challengeId: string): {
    hintsAvailable: number;
    hintsUsed: number;
    currentLevel: number;
    maxLevel: number;
  } | null {
    const strategy = this.strategies.get(challengeId);
    if (!strategy) return null;

    return {
      hintsAvailable: strategy.hints.length,
      hintsUsed: strategy.hints.filter((h) => h.level <= strategy.currentLevel).length,
      currentLevel: strategy.currentLevel,
      maxLevel: Math.max(...strategy.hints.map((h) => h.level)),
    };
  }
}

/**
 * Visual Goal System
 * Shows target vs current state for visual challenges
 */

export interface VisualGoal {
  challengeId: string;
  targetHTML: string;
  targetCSS: string;
  targetScreenshot?: string;  // Base64 or URL
  highlightDifferences: boolean;
}

export interface DiffResult {
  htmlDiff: {
    missing: string[];
    extra: string[];
    incorrect: string[];
  };
  cssDiff: {
    missing: string[];
    incorrect: string[];
  };
  similarity: number;  // 0-100%
}

class VisualGoalSystem {
  /**
   * Compare user's code to target
   */
  compareTocTarget(
    userHTML: string,
    userCSS: string,
    target: VisualGoal
  ): DiffResult {
    const result: DiffResult = {
      htmlDiff: {
        missing: [],
        extra: [],
        incorrect: [],
      },
      cssDiff: {
        missing: [],
        incorrect: [],
      },
      similarity: 0,
    };

    // Parse HTML
    const parser = new DOMParser();
    const userDoc = parser.parseFromString(userHTML, 'text/html');
    const targetDoc = parser.parseFromString(target.targetHTML, 'text/html');

    // Compare structure
    const userElements = this.extractElements(userDoc.body);
    const targetElements = this.extractElements(targetDoc.body);

    // Find missing elements
    targetElements.forEach((targetEl) => {
      const found = userElements.some((userEl) => this.elementsMatch(userEl, targetEl));
      if (!found) {
        result.htmlDiff.missing.push(this.elementToString(targetEl));
      }
    });

    // Find extra elements
    userElements.forEach((userEl) => {
      const found = targetElements.some((targetEl) => this.elementsMatch(userEl, targetEl));
      if (!found) {
        result.htmlDiff.extra.push(this.elementToString(userEl));
      }
    });

    // Compare CSS
    const userStyles = this.parseCSS(userCSS);
    const targetStyles = this.parseCSS(target.targetCSS);

    Object.keys(targetStyles).forEach((selector) => {
      if (!userStyles[selector]) {
        result.cssDiff.missing.push(`${selector} selector`);
      } else {
        const targetProps = targetStyles[selector];
        const userProps = userStyles[selector];

        Object.keys(targetProps).forEach((prop) => {
          if (userProps[prop] !== targetProps[prop]) {
            result.cssDiff.incorrect.push(
              `${selector} { ${prop}: expected ${targetProps[prop]}, got ${userProps[prop]} }`
            );
          }
        });
      }
    });

    // Calculate similarity
    const totalChecks =
      targetElements.length +
      Object.keys(targetStyles).length +
      Object.values(targetStyles).reduce(
        (sum, props) => sum + Object.keys(props).length,
        0
      );

    const totalIssues =
      result.htmlDiff.missing.length +
      result.htmlDiff.extra.length +
      result.htmlDiff.incorrect.length +
      result.cssDiff.missing.length +
      result.cssDiff.incorrect.length;

    result.similarity = Math.max(0, Math.round(((totalChecks - totalIssues) / totalChecks) * 100));

    return result;
  }

  private extractElements(node: HTMLElement): HTMLElement[] {
    const elements: HTMLElement[] = [];

    if (node.children.length > 0) {
      Array.from(node.children).forEach((child) => {
        elements.push(child as HTMLElement);
        elements.push(...this.extractElements(child as HTMLElement));
      });
    }

    return elements;
  }

  private elementsMatch(el1: HTMLElement, el2: HTMLElement): boolean {
    return (
      el1.tagName === el2.tagName &&
      el1.className === el2.className &&
      el1.id === el2.id
    );
  }

  private elementToString(el: HTMLElement): string {
    let str = `<${el.tagName.toLowerCase()}`;
    if (el.id) str += ` id="${el.id}"`;
    if (el.className) str += ` class="${el.className}"`;
    str += '>';
    return str;
  }

  private parseCSS(css: string): Record<string, Record<string, string>> {
    const styles: Record<string, Record<string, string>> = {};

    // Simple CSS parser (basic implementation)
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;

    while ((match = ruleRegex.exec(css)) !== null) {
      const selector = match[1].trim();
      const declarations = match[2].trim();

      styles[selector] = {};

      const propRegex = /([^:]+):([^;]+)/g;
      let propMatch;

      while ((propMatch = propRegex.exec(declarations)) !== null) {
        const property = propMatch[1].trim();
        const value = propMatch[2].trim();
        styles[selector][property] = value;
      }
    }

    return styles;
  }

  /**
   * Generate visual diff hints
   */
  generateHints(diff: DiffResult): string[] {
    const hints: string[] = [];

    if (diff.htmlDiff.missing.length > 0) {
      hints.push(`Missing elements: ${diff.htmlDiff.missing.join(', ')}`);
    }

    if (diff.htmlDiff.extra.length > 0) {
      hints.push(`Remove these elements: ${diff.htmlDiff.extra.join(', ')}`);
    }

    if (diff.cssDiff.missing.length > 0) {
      hints.push(`Add CSS for: ${diff.cssDiff.missing.join(', ')}`);
    }

    if (diff.cssDiff.incorrect.length > 0 && diff.cssDiff.incorrect.length <= 3) {
      hints.push(...diff.cssDiff.incorrect);
    } else if (diff.cssDiff.incorrect.length > 3) {
      hints.push(`${diff.cssDiff.incorrect.length} CSS properties need adjustment`);
    }

    return hints;
  }
}

// Singleton instances
let hintSystemInstance: ProgressiveHintSystem | null = null;
let visualGoalInstance: VisualGoalSystem | null = null;

export function getHintSystem(): ProgressiveHintSystem {
  if (!hintSystemInstance) {
    hintSystemInstance = new ProgressiveHintSystem();
  }
  return hintSystemInstance;
}

export function getVisualGoalSystem(): VisualGoalSystem {
  if (!visualGoalInstance) {
    visualGoalInstance = new VisualGoalSystem();
  }
  return visualGoalInstance;
}

// Convenience exports
export const initializeHints = (challengeId: string, concept: string, hints: Hint[]) =>
  getHintSystem().initializeStrategy(challengeId, concept, hints);
export const getNextHint = (challengeId: string) =>
  getHintSystem().getNextHint(challengeId);
export const recordAttempt = (challengeId: string) =>
  getHintSystem().recordAttempt(challengeId);
export const compareToTarget = (userHTML: string, userCSS: string, target: VisualGoal) =>
  getVisualGoalSystem().compareTocTarget(userHTML, userCSS, target);
export const generateVisualHints = (diff: DiffResult) =>
  getVisualGoalSystem().generateHints(diff);
