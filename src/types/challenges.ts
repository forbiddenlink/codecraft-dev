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
}

export type ChallengeCategory = Challenge['category'];
export type ChallengeDifficulty = Challenge['difficulty']; 