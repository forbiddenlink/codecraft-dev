/**
 * Skill Tree & Progression System
 * Unlock new abilities and specializations as you level up
 */

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'html' | 'css' | 'javascript' | 'general' | 'social' | 'resource';
  
  requirements: {
    level: number;
    prerequisiteSkills?: string[];
    completedChallenges?: string[];
    xp?: number;
  };
  
  cost: {
    skillPoints: number;
    resources?: Record<string, number>;
  };
  
  benefits: {
    xpBonus?: number; // Percentage bonus
    resourceBonus?: Record<string, number>; // Percentage bonus
    unlocks?: string[]; // Features/buildings/challenges
    special?: string; // Special ability description
  };
  
  tier: 1 | 2 | 3 | 4 | 5; // Progression tier
  position: { x: number; y: number }; // For visual tree layout
}

export const SKILL_TREE: SkillNode[] = [
  // ===== HTML PATH =====
  {
    id: 'html-basics',
    name: 'HTML Fundamentals',
    description: 'Master the basics of HTML structure',
    icon: '📝',
    category: 'html',
    requirements: {
      level: 1,
      xp: 0
    },
    cost: {
      skillPoints: 1
    },
    benefits: {
      xpBonus: 5,
      unlocks: ['html-hints'],
      special: 'Unlock HTML autocomplete hints'
    },
    tier: 1,
    position: { x: 0, y: 0 }
  },

  {
    id: 'semantic-html',
    name: 'Semantic Structure',
    description: 'Use meaningful HTML elements',
    icon: '🏗️',
    category: 'html',
    requirements: {
      level: 3,
      prerequisiteSkills: ['html-basics'],
      completedChallenges: ['intro-2']
    },
    cost: {
      skillPoints: 2
    },
    benefits: {
      xpBonus: 10,
      unlocks: ['semantic-analyzer'],
      special: 'Code automatically suggests semantic elements'
    },
    tier: 2,
    position: { x: 0, y: 1 }
  },

  {
    id: 'forms-master',
    name: 'Form Master',
    description: 'Expert in creating user-friendly forms',
    icon: '📋',
    category: 'html',
    requirements: {
      level: 5,
      prerequisiteSkills: ['semantic-html'],
      completedChallenges: ['forms-1']
    },
    cost: {
      skillPoints: 3,
      resources: { energy: 200 }
    },
    benefits: {
      xpBonus: 15,
      unlocks: ['advanced-forms', 'form-validation'],
      special: 'Access to advanced form elements and validation'
    },
    tier: 3,
    position: { x: 0, y: 2 }
  },

  {
    id: 'html-architect',
    name: 'HTML Architect',
    description: 'Design complex, scalable structures',
    icon: '🏛️',
    category: 'html',
    requirements: {
      level: 8,
      prerequisiteSkills: ['forms-master'],
      xp: 2000
    },
    cost: {
      skillPoints: 4,
      resources: { energy: 500, minerals: 300 }
    },
    benefits: {
      xpBonus: 25,
      resourceBonus: { energy: 10 },
      unlocks: ['template-system', 'component-library'],
      special: 'Create reusable HTML templates'
    },
    tier: 4,
    position: { x: 0, y: 3 }
  },

  // ===== CSS PATH =====
  {
    id: 'css-basics',
    name: 'CSS Fundamentals',
    description: 'Learn the art of styling',
    icon: '🎨',
    category: 'css',
    requirements: {
      level: 2,
      xp: 100
    },
    cost: {
      skillPoints: 1
    },
    benefits: {
      xpBonus: 5,
      unlocks: ['css-hints', 'color-picker'],
      special: 'Unlock CSS autocomplete and color tools'
    },
    tier: 1,
    position: { x: 2, y: 0 }
  },

  {
    id: 'layout-master',
    name: 'Layout Master',
    description: 'Master Grid and Flexbox',
    icon: '📐',
    category: 'css',
    requirements: {
      level: 4,
      prerequisiteSkills: ['css-basics'],
      completedChallenges: ['discovery-2', 'mastery-1']
    },
    cost: {
      skillPoints: 2
    },
    benefits: {
      xpBonus: 10,
      unlocks: ['layout-templates', 'grid-visualizer'],
      special: 'Visual grid and flexbox designer'
    },
    tier: 2,
    position: { x: 2, y: 1 }
  },

  {
    id: 'animation-wizard',
    name: 'Animation Wizard',
    description: 'Bring designs to life with animations',
    icon: '✨',
    category: 'css',
    requirements: {
      level: 6,
      prerequisiteSkills: ['layout-master'],
      completedChallenges: ['mastery-2']
    },
    cost: {
      skillPoints: 3,
      resources: { energy: 300 }
    },
    benefits: {
      xpBonus: 15,
      unlocks: ['animation-library', 'keyframe-generator'],
      special: 'Pre-built animation templates'
    },
    tier: 3,
    position: { x: 2, y: 2 }
  },

  {
    id: 'css-architect',
    name: 'CSS Architect',
    description: 'Design systems and methodologies',
    icon: '🏰',
    category: 'css',
    requirements: {
      level: 9,
      prerequisiteSkills: ['animation-wizard'],
      completedChallenges: ['variables-1', 'responsive-1'],
      xp: 3000
    },
    cost: {
      skillPoints: 4,
      resources: { energy: 600, minerals: 400 }
    },
    benefits: {
      xpBonus: 25,
      resourceBonus: { minerals: 10 },
      unlocks: ['design-system', 'theme-generator'],
      special: 'Create comprehensive design systems'
    },
    tier: 4,
    position: { x: 2, y: 3 }
  },

  // ===== JAVASCRIPT PATH =====
  {
    id: 'js-basics',
    name: 'JavaScript Fundamentals',
    description: 'Bring interactivity to your colony',
    icon: '⚡',
    category: 'javascript',
    requirements: {
      level: 4,
      completedChallenges: ['javascript-1']
    },
    cost: {
      skillPoints: 2
    },
    benefits: {
      xpBonus: 10,
      unlocks: ['js-hints', 'console-access'],
      special: 'JavaScript autocomplete and debugging tools'
    },
    tier: 1,
    position: { x: 4, y: 0 }
  },

  {
    id: 'dom-master',
    name: 'DOM Master',
    description: 'Manipulate the DOM with ease',
    icon: '🎭',
    category: 'javascript',
    requirements: {
      level: 6,
      prerequisiteSkills: ['js-basics'],
      completedChallenges: ['javascript-2', 'js-dom-advanced']
    },
    cost: {
      skillPoints: 3,
      resources: { energy: 400 }
    },
    benefits: {
      xpBonus: 15,
      unlocks: ['dom-visualizer', 'element-inspector'],
      special: 'Visual DOM manipulation tools'
    },
    tier: 2,
    position: { x: 4, y: 1 }
  },

  {
    id: 'event-specialist',
    name: 'Event Specialist',
    description: 'Handle complex user interactions',
    icon: '🎯',
    category: 'javascript',
    requirements: {
      level: 8,
      prerequisiteSkills: ['dom-master'],
      completedChallenges: ['js-events-advanced']
    },
    cost: {
      skillPoints: 3,
      resources: { energy: 500 }
    },
    benefits: {
      xpBonus: 20,
      unlocks: ['event-system', 'custom-events'],
      special: 'Advanced event handling capabilities'
    },
    tier: 3,
    position: { x: 4, y: 2 }
  },

  {
    id: 'js-architect',
    name: 'JavaScript Architect',
    description: 'Build complex, scalable applications',
    icon: '🏗️',
    category: 'javascript',
    requirements: {
      level: 10,
      prerequisiteSkills: ['event-specialist'],
      completedChallenges: ['js-async', 'js-objects', 'js-arrays'],
      xp: 5000
    },
    cost: {
      skillPoints: 5,
      resources: { energy: 1000, minerals: 500 }
    },
    benefits: {
      xpBonus: 30,
      resourceBonus: { energy: 15, minerals: 10 },
      unlocks: ['app-framework', 'state-management'],
      special: 'Create full-stack applications'
    },
    tier: 4,
    position: { x: 4, y: 3 }
  },

  // ===== GENERAL/UTILITY SKILLS =====
  {
    id: 'fast-learner',
    name: 'Fast Learner',
    description: 'Gain experience more quickly',
    icon: '🚀',
    category: 'general',
    requirements: {
      level: 2,
      xp: 200
    },
    cost: {
      skillPoints: 2
    },
    benefits: {
      xpBonus: 15,
      special: 'Permanent +15% XP gain'
    },
    tier: 1,
    position: { x: 1, y: 0 }
  },

  {
    id: 'efficiency-expert',
    name: 'Efficiency Expert',
    description: 'Optimize resource generation',
    icon: '⚙️',
    category: 'resource',
    requirements: {
      level: 5,
      prerequisiteSkills: ['fast-learner']
    },
    cost: {
      skillPoints: 3
    },
    benefits: {
      resourceBonus: {
        energy: 15,
        minerals: 15
      },
      special: 'All resources generate 15% faster'
    },
    tier: 2,
    position: { x: 1, y: 1 }
  },

  {
    id: 'multitasker',
    name: 'Multitasker',
    description: 'Work on multiple challenges simultaneously',
    icon: '🔄',
    category: 'general',
    requirements: {
      level: 7,
      prerequisiteSkills: ['efficiency-expert'],
      xp: 2500
    },
    cost: {
      skillPoints: 4,
      resources: { energy: 600 }
    },
    benefits: {
      xpBonus: 20,
      unlocks: ['parallel-challenges'],
      special: 'Work on 2 challenges at once'
    },
    tier: 3,
    position: { x: 1, y: 2 }
  },

  // ===== SOCIAL SKILLS =====
  {
    id: 'charismatic',
    name: 'Charismatic Leader',
    description: 'Improve colony morale',
    icon: '😊',
    category: 'social',
    requirements: {
      level: 3,
      xp: 500
    },
    cost: {
      skillPoints: 2
    },
    benefits: {
      unlocks: ['morale-boost'],
      special: '+20% morale from all sources'
    },
    tier: 1,
    position: { x: 3, y: 0 }
  },

  {
    id: 'mentor',
    name: 'Master Mentor',
    description: 'Teach others and learn faster',
    icon: '👨‍🏫',
    category: 'social',
    requirements: {
      level: 6,
      prerequisiteSkills: ['charismatic'],
      completedChallenges: ['mentor-mission']
    },
    cost: {
      skillPoints: 3
    },
    benefits: {
      xpBonus: 25,
      unlocks: ['teaching-mode', 'student-system'],
      special: 'Earn XP by helping NPC students'
    },
    tier: 2,
    position: { x: 3, y: 1 }
  },

  {
    id: 'diplomat',
    name: 'Galactic Diplomat',
    description: 'Master negotiations and relationships',
    icon: '🤝',
    category: 'social',
    requirements: {
      level: 9,
      prerequisiteSkills: ['mentor'],
      xp: 4000
    },
    cost: {
      skillPoints: 4,
      resources: { energy: 800 }
    },
    benefits: {
      unlocks: ['diplomacy-system', 'trade-network'],
      special: 'Unlock trading with other colonies'
    },
    tier: 3,
    position: { x: 3, y: 2 }
  },

  // ===== ULTIMATE SKILLS =====
  {
    id: 'code-master',
    name: 'Code Master',
    description: 'Master of all coding disciplines',
    icon: '👑',
    category: 'general',
    requirements: {
      level: 15,
      prerequisiteSkills: ['html-architect', 'css-architect', 'js-architect'],
      xp: 10000
    },
    cost: {
      skillPoints: 10,
      resources: { energy: 2000, minerals: 2000 }
    },
    benefits: {
      xpBonus: 50,
      resourceBonus: {
        energy: 25,
        minerals: 25
      },
      unlocks: ['ultimate-challenges', 'master-title'],
      special: 'Unlock legendary challenges and abilities'
    },
    tier: 5,
    position: { x: 2, y: 4 }
  }
];

// Helper functions
export function getSkillsByTier(tier: number): SkillNode[] {
  return SKILL_TREE.filter(skill => skill.tier === tier);
}

export function getSkillsByCategory(category: SkillNode['category']): SkillNode[] {
  return SKILL_TREE.filter(skill => skill.category === category);
}

export function canUnlockSkill(
  skill: SkillNode,
  playerLevel: number,
  playerXP: number,
  unlockedSkills: string[],
  completedChallenges: string[],
  availableSkillPoints: number,
  playerResources: Record<string, number>
): { canUnlock: boolean; reason?: string } {
  // Check skill points
  if (availableSkillPoints < skill.cost.skillPoints) {
    return { canUnlock: false, reason: `Need ${skill.cost.skillPoints} skill points` };
  }

  // Check level
  if (playerLevel < skill.requirements.level) {
    return { canUnlock: false, reason: `Need level ${skill.requirements.level}` };
  }

  // Check XP
  if (skill.requirements.xp && playerXP < skill.requirements.xp) {
    return { canUnlock: false, reason: `Need ${skill.requirements.xp} XP` };
  }

  // Check prerequisites
  if (skill.requirements.prerequisiteSkills) {
    const missingPrereqs = skill.requirements.prerequisiteSkills.filter(
      prereq => !unlockedSkills.includes(prereq)
    );
    if (missingPrereqs.length > 0) {
      const skillName = SKILL_TREE.find(s => s.id === missingPrereqs[0])?.name;
      return { canUnlock: false, reason: `Need "${skillName}" first` };
    }
  }

  // Check challenge requirements
  if (skill.requirements.completedChallenges) {
    const missingChallenges = skill.requirements.completedChallenges.filter(
      challenge => !completedChallenges.includes(challenge)
    );
    if (missingChallenges.length > 0) {
      return { canUnlock: false, reason: `Complete required challenges first` };
    }
  }

  // Check resources
  if (skill.cost.resources) {
    for (const [resource, amount] of Object.entries(skill.cost.resources)) {
      if ((playerResources[resource] || 0) < amount) {
        return { canUnlock: false, reason: `Need ${amount} ${resource}` };
      }
    }
  }

  return { canUnlock: true };
}

export function calculateSkillPoints(playerLevel: number, completedChallenges: number): number {
  // 1 skill point per level + bonus from challenges
  return playerLevel + Math.floor(completedChallenges / 5);
}

export function getTotalXPBonus(unlockedSkills: string[]): number {
  return unlockedSkills.reduce((total, skillId) => {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    return total + (skill?.benefits.xpBonus || 0);
  }, 0);
}

export function getTotalResourceBonus(
  unlockedSkills: string[],
  resourceType: string
): number {
  return unlockedSkills.reduce((total, skillId) => {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    const bonus = skill?.benefits.resourceBonus?.[resourceType] || 0;
    return total + bonus;
  }, 0);
}

export function getAllUnlocks(unlockedSkills: string[]): string[] {
  const unlocks: string[] = [];
  
  unlockedSkills.forEach(skillId => {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    if (skill?.benefits.unlocks) {
      unlocks.push(...skill.benefits.unlocks);
    }
  });

  return [...new Set(unlocks)];
}

export function getSkillPath(targetSkillId: string): SkillNode[] {
  const path: SkillNode[] = [];
  const skill = SKILL_TREE.find(s => s.id === targetSkillId);
  
  if (!skill) return path;
  
  path.push(skill);
  
  // Recursively get prerequisites
  if (skill.requirements.prerequisiteSkills) {
    skill.requirements.prerequisiteSkills.forEach(prereqId => {
      path.unshift(...getSkillPath(prereqId));
    });
  }
  
  return path;
}

