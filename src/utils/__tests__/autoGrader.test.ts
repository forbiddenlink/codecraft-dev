import { gradeHtml, gradeCss, gradeJavaScript, createCriteria } from '../autoGrader';
import type { Challenge } from '@/types/challenges';

describe('AutoGrader', () => {
  describe('HTML Grading', () => {
    it('should pass when HTML meets all criteria', () => {
      const challenge: Challenge = {
        id: 'test-1',
        title: 'Test Challenge',
        description: 'Create a heading',
        language: 'html',
        difficulty: 1,
        xpReward: 100,
        starterCode: '',
        solution: '<h1>Hello World</h1>',
        objectives: [],
        hints: [],
        gradingCriteria: [
          {
            id: 'has-h1',
            description: 'Has an h1 element',
            weight: 100,
            validator: (code) => code.includes('<h1>'),
          },
        ],
      };

      const userCode = { html: '<h1>Hello World</h1>', css: '', javascript: '' };
      const result = gradeHtml(challenge, userCode.html);

      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
    });

    it('should fail when HTML is missing required elements', () => {
      const challenge: Challenge = {
        id: 'test-2',
        title: 'Test Challenge',
        description: 'Create a heading',
        language: 'html',
        difficulty: 1,
        xpReward: 100,
        starterCode: '',
        solution: '<h1>Hello World</h1>',
        objectives: [],
        hints: [],
        gradingCriteria: [
          {
            id: 'has-h1',
            description: 'Has an h1 element',
            weight: 100,
            validator: (code) => code.includes('<h1>'),
          },
        ],
      };

      const userCode = { html: '<p>Just a paragraph</p>', css: '', javascript: '' };
      const result = gradeHtml(challenge, userCode.html);

      expect(result.passed).toBe(false);
      expect(result.score).toBe(0);
      expect(result.feedback.failed).toContain('Has an h1 element');
    });

    it('should calculate weighted scores correctly', () => {
      const challenge: Challenge = {
        id: 'test-3',
        title: 'Test Challenge',
        description: 'Create structure',
        language: 'html',
        difficulty: 2,
        xpReward: 200,
        starterCode: '',
        solution: '',
        objectives: [],
        hints: [],
        gradingCriteria: [
          {
            id: 'has-h1',
            description: 'Has an h1 element',
            weight: 50,
            validator: (code) => code.includes('<h1>'),
          },
          {
            id: 'has-p',
            description: 'Has a p element',
            weight: 50,
            validator: (code) => code.includes('<p>'),
          },
        ],
      };

      const userCode = { html: '<h1>Hello</h1>', css: '', javascript: '' };
      const result = gradeHtml(challenge, userCode.html);

      expect(result.passed).toBe(false); // Need 70% to pass
      expect(result.score).toBe(50); // Only met 50% of criteria
    });
  });

  describe('CSS Grading', () => {
    it('should validate CSS properties', () => {
      const challenge: Challenge = {
        id: 'test-4',
        title: 'Styling Challenge',
        description: 'Add color',
        language: 'css',
        difficulty: 1,
        xpReward: 100,
        starterCode: '',
        solution: 'h1 { color: blue; }',
        objectives: [],
        hints: [],
        gradingCriteria: [
          {
            id: 'has-color',
            description: 'Sets color property',
            weight: 100,
            validator: (code) => code.includes('color:') || code.includes('color :'),
          },
        ],
      };

      const userCode = { html: '', css: 'h1 { color: red; }', javascript: '' };
      const result = gradeCss(challenge, userCode.css);

      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
    });
  });

  describe('Criteria Builders', () => {
    it('should create element criteria', () => {
      const criteria = createCriteria.hasElement('h1', 'Has a heading');
      expect(criteria.validator('<h1>Test</h1>')).toBe(true);
      expect(criteria.validator('<p>Test</p>')).toBe(false);
    });

    it('should create attribute criteria', () => {
      const criteria = createCriteria.hasElementWithAttribute('img', 'alt', 'Has image with alt');
      expect(criteria.validator('<img alt="test" />')).toBe(true);
      expect(criteria.validator('<img />')).toBe(false);
    });

    it('should create minimum elements criteria', () => {
      const criteria = createCriteria.hasMinimumElements('li', 3, 'Has at least 3 list items');
      expect(criteria.validator('<ul><li>1</li><li>2</li><li>3</li></ul>')).toBe(true);
      expect(criteria.validator('<ul><li>1</li><li>2</li></ul>')).toBe(false);
    });
  });
});
