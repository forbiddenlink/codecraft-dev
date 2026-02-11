export interface ChallengeReward {
  type: 'building' | 'resource' | 'villager' | 'ability';
  id: string;
  amount?: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'structure' | 'layout' | 'resources' | 'optimization';
  difficulty: 1 | 2 | 3;  // 1: Beginner, 2: Intermediate, 3: Advanced
  requiredChallenges: string[];  // IDs of challenges that must be completed first
  htmlTemplate?: string;  // Starting template for the challenge
  cssTemplate?: string;   // Starting CSS template
  validate: (code: string) => boolean;
  rewards: ChallengeReward[];
  objectives: string[];   // List of specific things to accomplish
  hints: string[];       // Progressive hints for the player

  // Spaced repetition support - concepts for tracking mastery
  conceptsTaught?: string[];     // New concepts introduced in this challenge
  conceptsReinforced?: string[]; // Existing concepts practiced in this challenge
  estimatedMinutes?: number;     // Estimated time to complete
}

/**
 * Core web development concepts for spaced repetition tracking
 */
export type WebDevConcept =
  // HTML Structure
  | 'html-header' | 'html-section' | 'html-div' | 'html-span'
  | 'html-lists' | 'html-links' | 'html-images' | 'html-forms'
  | 'html-nav' | 'html-semantic' | 'html-nesting' | 'html-attributes'
  // CSS Styling
  | 'css-colors' | 'css-fonts' | 'css-spacing' | 'css-borders'
  | 'css-sizing' | 'css-classes' | 'css-selectors' | 'css-hover'
  // CSS Layout
  | 'css-flexbox' | 'css-grid' | 'css-flex-direction' | 'css-justify-content'
  | 'css-align-items' | 'css-responsive'
  // JavaScript
  | 'js-variables' | 'js-functions' | 'js-loops' | 'js-conditionals'
  | 'js-dom' | 'js-events' | 'js-async';

export type ChallengeCategory = Challenge['category'];
export type ChallengeDifficulty = Challenge['difficulty']; 