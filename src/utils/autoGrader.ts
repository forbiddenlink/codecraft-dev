/**
 * Auto-Grading System for CodeCraft Challenges
 * Provides comprehensive code validation and feedback
 */

import { parseHtmlToStructure, getAllNodes } from './htmlParser';
import { parseCSSRule } from './cssParser';
import { validateHtml, validateCss, validateJs } from './codeValidation';

export interface GradingCriteria {
  type: 'html' | 'css' | 'javascript' | 'structure' | 'style' | 'behavior';
  description: string;
  test: (code: string, context?: any) => boolean;
  weight: number; // 0-1, importance of this criteria
  hint?: string;
}

export interface GradingResult {
  passed: boolean;
  score: number; // 0-100
  feedback: {
    passed: string[];
    failed: string[];
    suggestions: string[];
  };
  criteriaResults: {
    criteria: GradingCriteria;
    passed: boolean;
    message: string;
  }[];
}

export class AutoGrader {
  /**
   * Grade HTML code against criteria
   */
  gradeHtml(code: string, criteria: GradingCriteria[]): GradingResult {
    const validation = validateHtml(code);
    const structure = parseHtmlToStructure(code);
    
    const results = criteria.map(criterion => {
      const passed = criterion.test(code, { structure, validation });
      return {
        criteria: criterion,
        passed,
        message: passed 
          ? `✓ ${criterion.description}`
          : `✗ ${criterion.description}${criterion.hint ? ` - ${criterion.hint}` : ''}`
      };
    });

    const score = this.calculateScore(results);
    const feedback = this.generateFeedback(results, validation);

    return {
      passed: score >= 70, // 70% passing grade
      score,
      feedback,
      criteriaResults: results
    };
  }

  /**
   * Grade CSS code against criteria
   */
  gradeCss(code: string, criteria: GradingCriteria[]): GradingResult {
    const validation = validateCss(code);
    const parsedRules = parseCSSRule(code);
    
    const results = criteria.map(criterion => {
      const passed = criterion.test(code, { parsedRules, validation });
      return {
        criteria: criterion,
        passed,
        message: passed 
          ? `✓ ${criterion.description}`
          : `✗ ${criterion.description}${criterion.hint ? ` - ${criterion.hint}` : ''}`
      };
    });

    const score = this.calculateScore(results);
    const feedback = this.generateFeedback(results, validation);

    return {
      passed: score >= 70,
      score,
      feedback,
      criteriaResults: results
    };
  }

  /**
   * Grade JavaScript code against criteria
   */
  gradeJavaScript(code: string, criteria: GradingCriteria[]): GradingResult {
    const validation = validateJs(code);
    
    const results = criteria.map(criterion => {
      const passed = criterion.test(code, { validation });
      return {
        criteria: criterion,
        passed,
        message: passed 
          ? `✓ ${criterion.description}`
          : `✗ ${criterion.description}${criterion.hint ? ` - ${criterion.hint}` : ''}`
      };
    });

    const score = this.calculateScore(results);
    const feedback = this.generateFeedback(results, validation);

    return {
      passed: score >= 70,
      score,
      feedback,
      criteriaResults: results
    };
  }

  /**
   * Grade complete challenge (HTML + CSS + JS)
   */
  gradeChallenge(
    html: string,
    css: string,
    js: string,
    criteria: {
      html?: GradingCriteria[];
      css?: GradingCriteria[];
      javascript?: GradingCriteria[];
    }
  ): GradingResult {
    const htmlResult = criteria.html ? this.gradeHtml(html, criteria.html) : null;
    const cssResult = criteria.css ? this.gradeCss(css, criteria.css) : null;
    const jsResult = criteria.javascript ? this.gradeJavaScript(js, criteria.javascript) : null;

    // Combine results
    const allResults = [
      ...(htmlResult?.criteriaResults || []),
      ...(cssResult?.criteriaResults || []),
      ...(jsResult?.criteriaResults || [])
    ];

    const score = this.calculateScore(allResults);
    const feedback = this.combineFeedback([htmlResult, cssResult, jsResult]);

    return {
      passed: score >= 70,
      score,
      feedback,
      criteriaResults: allResults
    };
  }

  /**
   * Calculate weighted score
   */
  private calculateScore(results: { criteria: GradingCriteria; passed: boolean }[]): number {
    if (results.length === 0) return 0;

    const totalWeight = results.reduce((sum, r) => sum + r.criteria.weight, 0);
    const earnedWeight = results
      .filter(r => r.passed)
      .reduce((sum, r) => sum + r.criteria.weight, 0);

    return Math.round((earnedWeight / totalWeight) * 100);
  }

  /**
   * Generate feedback messages
   */
  private generateFeedback(
    results: { criteria: GradingCriteria; passed: boolean; message: string }[],
    validation: { isValid: boolean; errors: any[]; warnings: any[] }
  ): GradingResult['feedback'] {
    const passed = results.filter(r => r.passed).map(r => r.message);
    const failed = results.filter(r => !r.passed).map(r => r.message);
    const suggestions: string[] = [];

    // Add validation errors as suggestions
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        suggestions.push(`Line ${error.line}: ${error.message}`);
      });
    }

    // Add hints from failed criteria
    results
      .filter(r => !r.passed && r.criteria.hint)
      .forEach(r => {
        if (r.criteria.hint) {
          suggestions.push(r.criteria.hint);
        }
      });

    return { passed, failed, suggestions };
  }

  /**
   * Combine feedback from multiple grading results
   */
  private combineFeedback(results: (GradingResult | null)[]): GradingResult['feedback'] {
    const combined = {
      passed: [] as string[],
      failed: [] as string[],
      suggestions: [] as string[]
    };

    results.forEach(result => {
      if (result) {
        combined.passed.push(...result.feedback.passed);
        combined.failed.push(...result.feedback.failed);
        combined.suggestions.push(...result.feedback.suggestions);
      }
    });

    return combined;
  }
}

/**
 * Common grading criteria builders
 */
export const CriteriaBuilders = {
  /**
   * Check if HTML contains specific element
   */
  hasElement: (tagName: string, description?: string): GradingCriteria => ({
    type: 'html',
    description: description || `Contains <${tagName}> element`,
    test: (code, context) => {
      const structure = context?.structure || parseHtmlToStructure(code);
      return structure.some((node: any) => node.elementType === tagName);
    },
    weight: 1,
    hint: `Add a <${tagName}> element to your HTML`
  }),

  /**
   * Check if HTML has element with specific attribute
   */
  hasElementWithAttribute: (
    tagName: string,
    attrName: string,
    attrValue?: string,
    description?: string
  ): GradingCriteria => ({
    type: 'html',
    description: description || `<${tagName}> has ${attrName}${attrValue ? `="${attrValue}"` : ''}`,
    test: (code, context) => {
      const structure = context?.structure || parseHtmlToStructure(code);
      return structure.some((node: any) => {
        if (node.elementType !== tagName) return false;
        if (!node.attributes?.[attrName]) return false;
        if (attrValue && node.attributes[attrName] !== attrValue) return false;
        return true;
      });
    },
    weight: 1,
    hint: `Add ${attrName}${attrValue ? `="${attrValue}"` : ''} to your <${tagName}> element`
  }),

  /**
   * Check if CSS has specific property
   */
  hasStyleProperty: (property: string, value?: string, description?: string): GradingCriteria => ({
    type: 'css',
    description: description || `Uses ${property}${value ? `: ${value}` : ''}`,
    test: (code) => {
      const regex = value 
        ? new RegExp(`${property}\\s*:\\s*${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i')
        : new RegExp(`${property}\\s*:`, 'i');
      return regex.test(code);
    },
    weight: 1,
    hint: `Add ${property}${value ? `: ${value}` : ''} to your CSS`
  }),

  /**
   * Check if code matches regex pattern
   */
  matchesPattern: (pattern: RegExp, description: string, hint?: string): GradingCriteria => ({
    type: 'structure',
    description,
    test: (code) => pattern.test(code),
    weight: 1,
    hint
  }),

  /**
   * Check minimum number of elements (searches all nested elements)
   */
  hasMinimumElements: (tagName: string, count: number, description?: string): GradingCriteria => ({
    type: 'html',
    description: description || `Has at least ${count} <${tagName}> element(s)`,
    test: (code, context) => {
      const structure = context?.structure || parseHtmlToStructure(code);
      // Use getAllNodes to find all elements including nested ones
      const allNodes = getAllNodes(structure);
      const matches = allNodes.filter((node: any) => node.elementType === tagName);
      return matches.length >= count;
    },
    weight: 1,
    hint: `Add at least ${count} <${tagName}> element(s)`
  }),

  /**
   * Check for proper nesting
   */
  hasProperNesting: (parent: string, child: string, description?: string): GradingCriteria => ({
    type: 'structure',
    description: description || `<${child}> is nested inside <${parent}>`,
    test: (code, context) => {
      const structure = context?.structure || parseHtmlToStructure(code);
      return structure.some((node: any) => {
        if (node.elementType === parent) {
          return node.children?.some((c: any) => c.elementType === child);
        }
        return false;
      });
    },
    weight: 1,
    hint: `Place <${child}> inside <${parent}>`
  })
};

// Export singleton instance
export const autoGrader = new AutoGrader();

/**
 * Convenience functions for grading challenges
 * These wrap the AutoGrader class methods and adapt Challenge grading criteria
 */

interface ChallengeGradingCriteria {
  id: string;
  description: string;
  weight: number;
  validator: (code: string) => boolean;
}

interface ChallengeWithGrading {
  gradingCriteria: ChallengeGradingCriteria[];
}

interface SimplifiedGradingResult {
  passed: boolean;
  score: number;
  feedback: {
    passed: string[];
    failed: string[];
    suggestions: string[];
  };
}

function convertChallengeToGradingCriteria(criteria: ChallengeGradingCriteria[]): GradingCriteria[] {
  return criteria.map(c => ({
    type: 'html' as const,
    description: c.description,
    test: (code: string) => c.validator(code),
    weight: c.weight / 100, // Normalize weight
    hint: undefined
  }));
}

/**
 * Grade HTML code against a challenge's criteria
 */
export function gradeHtml(challenge: ChallengeWithGrading, code: string): SimplifiedGradingResult {
  const criteria = convertChallengeToGradingCriteria(challenge.gradingCriteria);
  return autoGrader.gradeHtml(code, criteria);
}

/**
 * Grade CSS code against a challenge's criteria
 */
export function gradeCss(challenge: ChallengeWithGrading, code: string): SimplifiedGradingResult {
  const criteria = convertChallengeToGradingCriteria(challenge.gradingCriteria);
  return autoGrader.gradeCss(code, criteria);
}

/**
 * Grade JavaScript code against a challenge's criteria
 */
export function gradeJavaScript(challenge: ChallengeWithGrading, code: string): SimplifiedGradingResult {
  const criteria = convertChallengeToGradingCriteria(challenge.gradingCriteria);
  return autoGrader.gradeJavaScript(code, criteria);
}

/**
 * Criteria builder helpers that return Challenge-compatible grading criteria
 * These return objects with `validator` instead of `test` for test compatibility
 */
export const createCriteria = {
  hasElement: (tagName: string, description?: string): ChallengeGradingCriteria => {
    const criteria = CriteriaBuilders.hasElement(tagName, description);
    return {
      id: `has-${tagName}`,
      description: criteria.description,
      weight: 100,
      validator: (code: string) => criteria.test(code, { structure: parseHtmlToStructure(code) })
    };
  },

  hasElementWithAttribute: (
    tagName: string,
    attrName: string,
    description?: string
  ): ChallengeGradingCriteria => {
    const criteria = CriteriaBuilders.hasElementWithAttribute(tagName, attrName, undefined, description);
    return {
      id: `has-${tagName}-${attrName}`,
      description: criteria.description,
      weight: 100,
      validator: (code: string) => criteria.test(code, { structure: parseHtmlToStructure(code) })
    };
  },

  hasMinimumElements: (tagName: string, count: number, description?: string): ChallengeGradingCriteria => {
    const criteria = CriteriaBuilders.hasMinimumElements(tagName, count, description);
    return {
      id: `min-${tagName}-${count}`,
      description: criteria.description,
      weight: 100,
      validator: (code: string) => criteria.test(code, { structure: parseHtmlToStructure(code) })
    };
  },

  hasStyleProperty: (property: string, value?: string, description?: string): ChallengeGradingCriteria => {
    const criteria = CriteriaBuilders.hasStyleProperty(property, value, description);
    return {
      id: `style-${property}`,
      description: criteria.description,
      weight: 100,
      validator: (code: string) => criteria.test(code, {})
    };
  },

  matchesPattern: (pattern: RegExp, description: string): ChallengeGradingCriteria => {
    const criteria = CriteriaBuilders.matchesPattern(pattern, description);
    return {
      id: `pattern-${description.toLowerCase().replace(/\s+/g, '-')}`,
      description: criteria.description,
      weight: 100,
      validator: (code: string) => criteria.test(code, {})
    };
  }
};

