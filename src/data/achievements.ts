/**
 * Achievement Definitions for CodeCraft
 * Rewards players for milestones and accomplishments
 */

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xp: number;
  category: 'learning' | 'building' | 'mastery' | 'exploration' | 'social';
  requirement: {
    type: 'challenges_completed' | 'xp_earned' | 'buildings_built' | 'code_lines' | 'perfect_score' | 'speed_run' | 'exploration';
    value: number;
    specific?: string[]; // Specific challenge IDs or building types
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  // Learning Achievements
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first challenge',
    icon: '🌟',
    rarity: 'common',
    xp: 50,
    category: 'learning',
    requirement: {
      type: 'challenges_completed',
      value: 1
    }
  },
  {
    id: 'html_novice',
    title: 'HTML Novice',
    description: 'Complete 3 HTML challenges',
    icon: '📝',
    rarity: 'common',
    xp: 100,
    category: 'learning',
    requirement: {
      type: 'challenges_completed',
      value: 3
    }
  },
  {
    id: 'css_artist',
    title: 'CSS Artist',
    description: 'Master the art of styling',
    icon: '🎨',
    rarity: 'rare',
    xp: 200,
    category: 'learning',
    requirement: {
      type: 'challenges_completed',
      value: 5
    }
  },
  {
    id: 'javascript_wizard',
    title: 'JavaScript Wizard',
    description: 'Unlock the power of interactivity',
    icon: '⚡',
    rarity: 'epic',
    xp: 300,
    category: 'learning',
    requirement: {
      type: 'challenges_completed',
      value: 8
    }
  },
  {
    id: 'code_master',
    title: 'Code Master',
    description: 'Complete all challenges',
    icon: '👑',
    rarity: 'legendary',
    xp: 1000,
    category: 'mastery',
    requirement: {
      type: 'challenges_completed',
      value: 15
    }
  },

  // Building Achievements
  {
    id: 'architect',
    title: 'Architect',
    description: 'Build your first structure',
    icon: '🏗️',
    rarity: 'common',
    xp: 75,
    category: 'building',
    requirement: {
      type: 'buildings_built',
      value: 1
    }
  },
  {
    id: 'city_planner',
    title: 'City Planner',
    description: 'Build 10 structures',
    icon: '🏙️',
    rarity: 'rare',
    xp: 250,
    category: 'building',
    requirement: {
      type: 'buildings_built',
      value: 10
    }
  },
  {
    id: 'metropolis',
    title: 'Metropolis',
    description: 'Build a thriving colony of 25 structures',
    icon: '🌆',
    rarity: 'epic',
    xp: 500,
    category: 'building',
    requirement: {
      type: 'buildings_built',
      value: 25
    }
  },

  // Mastery Achievements
  {
    id: 'perfectionist',
    title: 'Perfectionist',
    description: 'Complete a challenge with a perfect score',
    icon: '💯',
    rarity: 'rare',
    xp: 200,
    category: 'mastery',
    requirement: {
      type: 'perfect_score',
      value: 1
    }
  },
  {
    id: 'speed_coder',
    title: 'Speed Coder',
    description: 'Complete a challenge in under 2 minutes',
    icon: '⚡',
    rarity: 'epic',
    xp: 300,
    category: 'mastery',
    requirement: {
      type: 'speed_run',
      value: 120 // seconds
    }
  },
  {
    id: 'code_warrior',
    title: 'Code Warrior',
    description: 'Complete 5 challenges without errors',
    icon: '🛡️',
    rarity: 'epic',
    xp: 400,
    category: 'mastery',
    requirement: {
      type: 'perfect_score',
      value: 5
    }
  },

  // XP Milestones
  {
    id: 'rising_star',
    title: 'Rising Star',
    description: 'Earn 500 XP',
    icon: '⭐',
    rarity: 'common',
    xp: 100,
    category: 'learning',
    requirement: {
      type: 'xp_earned',
      value: 500
    }
  },
  {
    id: 'skilled_developer',
    title: 'Skilled Developer',
    description: 'Earn 2000 XP',
    icon: '💎',
    rarity: 'rare',
    xp: 200,
    category: 'learning',
    requirement: {
      type: 'xp_earned',
      value: 2000
    }
  },
  {
    id: 'elite_coder',
    title: 'Elite Coder',
    description: 'Earn 5000 XP',
    icon: '🏆',
    rarity: 'epic',
    xp: 500,
    category: 'mastery',
    requirement: {
      type: 'xp_earned',
      value: 5000
    }
  },
  {
    id: 'legendary_developer',
    title: 'Legendary Developer',
    description: 'Earn 10000 XP',
    icon: '👑',
    rarity: 'legendary',
    xp: 1000,
    category: 'mastery',
    requirement: {
      type: 'xp_earned',
      value: 10000
    }
  },

  // Exploration Achievements
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Discover all building types',
    icon: '🔍',
    rarity: 'rare',
    xp: 250,
    category: 'exploration',
    requirement: {
      type: 'exploration',
      value: 10
    }
  },
  {
    id: 'ancient_secrets',
    title: 'Ancient Secrets',
    description: 'Unlock all ancient ruins',
    icon: '🗿',
    rarity: 'legendary',
    xp: 1000,
    category: 'exploration',
    requirement: {
      type: 'exploration',
      value: 100
    }
  },

  // Special Achievements
  {
    id: 'pixel_friend',
    title: 'Pixel\'s Friend',
    description: 'Interact with Pixel 50 times',
    icon: '🤖',
    rarity: 'rare',
    xp: 200,
    category: 'social',
    requirement: {
      type: 'exploration',
      value: 50
    }
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Code between midnight and 4 AM',
    icon: '🦉',
    rarity: 'rare',
    xp: 150,
    category: 'exploration',
    requirement: {
      type: 'exploration',
      value: 1
    }
  },
  {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Code between 5 AM and 7 AM',
    icon: '🐦',
    rarity: 'rare',
    xp: 150,
    category: 'exploration',
    requirement: {
      type: 'exploration',
      value: 1
    }
  }
];

// Helper functions
export function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

export function getAchievementsByCategory(category: Achievement['category']): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

export function getAchievementsByRarity(rarity: Achievement['rarity']): Achievement[] {
  return ACHIEVEMENTS.filter(a => a.rarity === rarity);
}

export function checkAchievementUnlocked(
  achievement: Achievement,
  playerStats: {
    challengesCompleted: number;
    xpEarned: number;
    buildingsBuilt: number;
    perfectScores: number;
    fastestCompletion: number;
  }
): boolean {
  switch (achievement.requirement.type) {
    case 'challenges_completed':
      return playerStats.challengesCompleted >= achievement.requirement.value;
    case 'xp_earned':
      return playerStats.xpEarned >= achievement.requirement.value;
    case 'buildings_built':
      return playerStats.buildingsBuilt >= achievement.requirement.value;
    case 'perfect_score':
      return playerStats.perfectScores >= achievement.requirement.value;
    case 'speed_run':
      return playerStats.fastestCompletion <= achievement.requirement.value;
    default:
      return false;
  }
}

