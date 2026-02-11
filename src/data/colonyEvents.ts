/**
 * Colony Events & Random Encounters
 * Dynamic events that keep the game fresh and unpredictable
 */

export type EventType = 'positive' | 'negative' | 'neutral' | 'choice' | 'mini-game';
export type EventCategory = 'resource' | 'social' | 'technical' | 'environmental' | 'story' | 'humorous';

export interface ColonyEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  category: EventCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  icon: string;
  
  trigger: {
    minLevel?: number;
    maxLevel?: number;
    requiredBuildings?: string[];
    timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'any';
    weatherConditions?: string[];
    probability: number; // 0-1
  };
  
  effects?: {
    resources?: Record<string, number>; // positive or negative
    xp?: number;
    morale?: number;
    buildingDamage?: string[]; // building IDs
  };
  
  choices?: Array<{
    id: string;
    text: string;
    description: string;
    requirements?: {
      skill?: string;
      resource?: Record<string, number>;
      building?: string;
    };
    outcome: {
      description: string;
      effects: {
        resources?: Record<string, number>;
        xp?: number;
        morale?: number;
        unlocks?: string[];
      };
    };
  }>;
  
  duration?: number; // seconds, if ongoing
  canDismiss: boolean;
}

export const COLONY_EVENTS: ColonyEvent[] = [
  // ===== POSITIVE EVENTS =====
  {
    id: 'resource-discovery',
    title: '💎 Resource Discovery!',
    description: 'Your colonists discovered a hidden cache of resources while exploring!',
    type: 'positive',
    category: 'resource',
    rarity: 'uncommon',
    icon: '💎',
    trigger: {
      minLevel: 1,
      probability: 0.15
    },
    effects: {
      resources: {
        energy: 200,
        minerals: 150
      },
      morale: 10
    },
    canDismiss: true
  },

  {
    id: 'code-inspiration',
    title: '💡 Coding Breakthrough!',
    description: 'You suddenly understand a complex concept! Everything clicks!',
    type: 'positive',
    category: 'technical',
    rarity: 'rare',
    icon: '💡',
    trigger: {
      minLevel: 3,
      probability: 0.08
    },
    effects: {
      xp: 500,
      morale: 15
    },
    canDismiss: true
  },

  {
    id: 'volunteer-arrival',
    title: '👥 New Volunteers!',
    description: 'A group of skilled volunteers wants to join your colony!',
    type: 'positive',
    category: 'social',
    rarity: 'uncommon',
    icon: '👥',
    trigger: {
      minLevel: 5,
      requiredBuildings: ['livingQuarters'],
      probability: 0.12
    },
    effects: {
      resources: {
        energy: 100,
        food: 100
      },
      morale: 20
    },
    canDismiss: true
  },

  // ===== NEGATIVE EVENTS =====
  {
    id: 'power-surge',
    title: '⚡ Power Surge!',
    description: 'A massive power surge hits your energy grid! Some systems are damaged.',
    type: 'negative',
    category: 'technical',
    rarity: 'uncommon',
    icon: '⚡',
    trigger: {
      minLevel: 2,
      requiredBuildings: ['powerGrid'],
      probability: 0.10
    },
    effects: {
      resources: {
        energy: -150
      },
      morale: -10
    },
    canDismiss: true
  },

  {
    id: 'solar-storm',
    title: '☀️ Solar Storm Warning!',
    description: 'A solar storm is approaching! You need to protect your systems.',
    type: 'choice',
    category: 'environmental',
    rarity: 'rare',
    icon: '☀️',
    trigger: {
      minLevel: 3,
      weatherConditions: ['clear'],
      probability: 0.07
    },
    choices: [
      {
        id: 'shield-up',
        text: 'Activate Shields',
        description: 'Use energy to protect all systems',
        requirements: {
          resource: { energy: 300 }
        },
        outcome: {
          description: 'Shields activated! All systems protected!',
          effects: {
            resources: { energy: -300 },
            morale: 10
          }
        }
      },
      {
        id: 'ride-out',
        text: 'Ride it Out',
        description: 'Save energy but risk damage',
        outcome: {
          description: 'You weathered the storm, but some systems took damage.',
          effects: {
            resources: { energy: -100, minerals: -50 },
            morale: -5
          }
        }
      },
      {
        id: 'emergency-code',
        text: 'Emergency Code Fix',
        description: 'Write protective code (requires skill)',
        requirements: {
          skill: 'javascript'
        },
        outcome: {
          description: 'Your quick coding saved the day! Minimal damage!',
          effects: {
            resources: { energy: -50 },
            xp: 300,
            morale: 15
          }
        }
      }
    ],
    canDismiss: false
  },

  {
    id: 'bug-infection',
    title: '🐛 Bug Outbreak!',
    description: 'A nasty bug has infected your codebase! Debug it quickly!',
    type: 'negative',
    category: 'technical',
    rarity: 'common',
    icon: '🐛',
    trigger: {
      minLevel: 2,
      probability: 0.20
    },
    effects: {
      morale: -15
    },
    canDismiss: true
  },

  // ===== NEUTRAL/SOCIAL EVENTS =====
  {
    id: 'celebration-day',
    title: '🎉 Colony Celebration!',
    description: 'The colonists want to throw a party to celebrate recent achievements!',
    type: 'choice',
    category: 'social',
    rarity: 'uncommon',
    icon: '🎉',
    trigger: {
      minLevel: 4,
      probability: 0.15
    },
    choices: [
      {
        id: 'big-party',
        text: 'Throw a Big Party',
        description: 'Spend resources for a major morale boost',
        requirements: {
          resource: { food: 200, energy: 150 }
        },
        outcome: {
          description: 'Best party ever! Everyone is super motivated!',
          effects: {
            resources: { food: -200, energy: -150 },
            morale: 30,
            xp: 200
          }
        }
      },
      {
        id: 'small-gathering',
        text: 'Small Gathering',
        description: 'Modest celebration',
        requirements: {
          resource: { food: 50 }
        },
        outcome: {
          description: 'A nice, simple celebration. Everyone had fun!',
          effects: {
            resources: { food: -50 },
            morale: 15,
            xp: 100
          }
        }
      },
      {
        id: 'rain-check',
        text: 'Maybe Later',
        description: 'Postpone the celebration',
        outcome: {
          description: 'People understand, but they\'re a bit disappointed.',
          effects: {
            morale: -5
          }
        }
      }
    ],
    canDismiss: false
  },

  {
    id: 'tech-debate',
    title: '💬 Great Debate',
    description: 'Colonists are debating: Tabs vs Spaces! This could get heated...',
    type: 'neutral',
    category: 'social',
    rarity: 'common',
    icon: '💬',
    trigger: {
      minLevel: 2,
      probability: 0.18
    },
    choices: [
      {
        id: 'tabs',
        text: 'Team Tabs',
        description: 'Efficiency over everything!',
        outcome: {
          description: 'Half the colony loves you. Half thinks you\'re wrong. Classic.',
          effects: {
            morale: 0,
            xp: 50
          }
        }
      },
      {
        id: 'spaces',
        text: 'Team Spaces',
        description: 'Consistency is key!',
        outcome: {
          description: 'Half the colony loves you. Half thinks you\'re wrong. Classic.',
          effects: {
            morale: 0,
            xp: 50
          }
        }
      },
      {
        id: 'both',
        text: 'Both are Fine',
        description: 'Let\'s all get along!',
        outcome: {
          description: 'Everyone is mildly satisfied with your diplomatic response.',
          effects: {
            morale: 5,
            xp: 100
          }
        }
      }
    ],
    canDismiss: false
  },

  // ===== STORY EVENTS =====
  {
    id: 'mysterious-signal',
    title: '📡 Mysterious Signal',
    description: 'You\'re receiving a strange coded message from deep space...',
    type: 'choice',
    category: 'story',
    rarity: 'rare',
    icon: '📡',
    trigger: {
      minLevel: 6,
      requiredBuildings: ['communicationBeacon'],
      probability: 0.06
    },
    choices: [
      {
        id: 'decode',
        text: 'Decode the Message',
        description: 'Spend time decrypting it',
        requirements: {
          skill: 'javascript'
        },
        outcome: {
          description: 'Message decoded! It\'s coordinates to an ancient artifact!',
          effects: {
            xp: 500,
            morale: 20,
            unlocks: ['ancient-artifact-quest']
          }
        }
      },
      {
        id: 'ignore',
        text: 'Ignore it',
        description: 'Could be dangerous',
        outcome: {
          description: 'You ignore the signal. It stops transmitting.',
          effects: {
            morale: 0
          }
        }
      },
      {
        id: 'reply',
        text: 'Reply to Signal',
        description: 'Send a response',
        outcome: {
          description: 'You sent a reply. Now we wait...',
          effects: {
            xp: 200,
            unlocks: ['first-contact']
          }
        }
      }
    ],
    canDismiss: false
  },

  // ===== HUMOROUS EVENTS =====
  {
    id: 'coffee-crisis',
    title: '☕ COFFEE EMERGENCY',
    description: 'THE COFFEE MACHINE IS BROKEN! This is NOT a drill!',
    type: 'choice',
    category: 'humorous',
    rarity: 'uncommon',
    icon: '☕',
    trigger: {
      minLevel: 1,
      timeOfDay: 'morning',
      probability: 0.12
    },
    choices: [
      {
        id: 'fix-it',
        text: 'Fix the Machine',
        description: 'Use your coding skills',
        requirements: {
          skill: 'javascript'
        },
        outcome: {
          description: 'You fixed it! You\'re a HERO! Everyone cheers!',
          effects: {
            morale: 25,
            xp: 150
          }
        }
      },
      {
        id: 'tea-instead',
        text: 'Suggest Tea',
        description: 'Offer an alternative',
        outcome: {
          description: 'People reluctantly accept tea. It\'s not the same...',
          effects: {
            morale: -10
          }
        }
      },
      {
        id: 'group-nap',
        text: 'Everyone Naps',
        description: 'Can\'t work without coffee anyway',
        outcome: {
          description: 'Everyone takes a nap. Productivity: 0. Happiness: High.',
          effects: {
            morale: 10,
            resources: { energy: -50 }
          }
        }
      }
    ],
    canDismiss: false
  },

  {
    id: 'pixel-prank',
    title: '🤖 Pixel\'s Prank',
    description: 'Pixel has hidden your semicolons. ALL of them. He thinks it\'s hilarious.',
    type: 'neutral',
    category: 'technical',
    rarity: 'rare',
    icon: '🤖',
    trigger: {
      minLevel: 3,
      probability: 0.05
    },
    effects: {
      morale: 5,
      xp: 100
    },
    canDismiss: true
  },

  // ===== RARE/LEGENDARY EVENTS =====
  {
    id: 'ancient-awakening',
    title: '✨ Ancient Awakening',
    description: 'The ruins are glowing intensely! Something incredible is happening!',
    type: 'choice',
    category: 'story',
    rarity: 'legendary',
    icon: '✨',
    trigger: {
      minLevel: 8,
      requiredBuildings: ['ancient-ruins-access'],
      probability: 0.02
    },
    choices: [
      {
        id: 'embrace',
        text: 'Embrace the Power',
        description: 'Accept the Ancient\'s gift',
        outcome: {
          description: 'Ancient knowledge floods your mind! You feel... different.',
          effects: {
            xp: 2000,
            morale: 30,
            unlocks: ['ancient-powers', 'ultimate-challenge']
          }
        }
      },
      {
        id: 'resist',
        text: 'Resist',
        description: 'Stay true to yourself',
        outcome: {
          description: 'You resist. The power fades, but you remain yourself.',
          effects: {
            xp: 1000,
            morale: 20,
            unlocks: ['human-path']
          }
        }
      }
    ],
    canDismiss: false
  },

  {
    id: 'perfect-code',
    title: '🏆 Perfect Code Day',
    description: 'Today, everything you write is PERFECT. Not a single bug. It\'s magical.',
    type: 'positive',
    category: 'technical',
    rarity: 'legendary',
    icon: '🏆',
    trigger: {
      minLevel: 7,
      probability: 0.01
    },
    effects: {
      xp: 1000,
      morale: 50
    },
    duration: 300, // 5 minutes of perfect coding
    canDismiss: false
  }
];

// Helper functions
export function getRandomEvent(
  playerLevel: number,
  availableBuildings: string[],
  timeOfDay: string = 'any'
): ColonyEvent | null {
  // Filter eligible events
  const eligible = COLONY_EVENTS.filter(event => {
    // Level check
    if (event.trigger.minLevel && playerLevel < event.trigger.minLevel) return false;
    if (event.trigger.maxLevel && playerLevel > event.trigger.maxLevel) return false;

    // Building check
    if (event.trigger.requiredBuildings) {
      if (!event.trigger.requiredBuildings.every(b => availableBuildings.includes(b))) {
        return false;
      }
    }

    // Time of day check
    if (event.trigger.timeOfDay && event.trigger.timeOfDay !== 'any' && event.trigger.timeOfDay !== timeOfDay) {
      return false;
    }

    return true;
  });

  if (eligible.length === 0) return null;

  // Weighted random selection based on probability and rarity
  const rarityWeights = {
    common: 1.0,
    uncommon: 0.6,
    rare: 0.3,
    epic: 0.1,
    legendary: 0.05
  };

  const weighted = eligible.map(event => ({
    event,
    weight: event.trigger.probability * rarityWeights[event.rarity]
  }));

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;

  for (const item of weighted) {
    random -= item.weight;
    if (random <= 0) {
      return item.event;
    }
  }

  return eligible[0]; // Fallback
}

export function getEventsByCategory(category: EventCategory): ColonyEvent[] {
  return COLONY_EVENTS.filter(e => e.category === category);
}

export function getEventsByRarity(rarity: ColonyEvent['rarity']): ColonyEvent[] {
  return COLONY_EVENTS.filter(e => e.rarity === rarity);
}

export function shouldTriggerEvent(baseProbability: number = 0.1): boolean {
  return Math.random() < baseProbability;
}

