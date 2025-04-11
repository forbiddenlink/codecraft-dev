export type VillagerSpecialty = 'html' | 'css' | 'javascript' | 'git' | 'backend';

export interface Villager {
  id: string;
  name: string;
  role: string;
  specialty: VillagerSpecialty;
  color: string;
  model?: 'capsule' | 'sphere' | 'roundedBox'; // For backward compatibility
  dialog: string[];
  location: {
    area: string;
    position: [number, number, number];
  };
  unlockRequirement?: {
    type: 'challenge' | 'level' | 'resource';
    value: string | number;
  };
  offerings?: {
    challenges: string[];
    blueprints: string[];
    resources: string[];
  };
}

// Villager characters based on your documentation
export const VILLAGERS: Record<string, Villager> = {
  'html-harry': {
    id: 'html-harry',
    name: 'HTML Harry',
    role: 'Structure Specialist',
    specialty: 'html',
    color: '#E34F26', // HTML orange
    dialog: [
      "Welcome to the colony! I'm Harry, and I'm all about structure.",
      "Need help with your HTML? I'm your guy! Let's build something solid.",
      "Remember: a well-structured document is like a well-built colony - it can withstand anything!",
      "Think of HTML elements as the building blocks of your colony. Each one has a specific purpose.",
      "Need to create a new habitat module? Try using semantic HTML to give it proper structure.",
      "<section>, <article>, and <nav> elements help organize your colony just like they organize a webpage."
    ],
    location: {
      area: 'habitat-sector',
      position: [5, 0, 5]
    },
    offerings: {
      challenges: ['html-basics', 'semantic-structures', 'forms-foundation'],
      blueprints: ['basic-habitat', 'research-lab'],
      resources: ['structure-components']
    }
  },
  'css-cassie': {
    id: 'css-cassie',
    name: 'CSS Cassie',
    role: 'Environmental Designer',
    specialty: 'css',
    color: '#1572B6', // CSS blue
    dialog: [
      "Hey there! I'm Cassie, and I make everything look amazing!",
      "Colors, layouts, animations - that's my jam! Want to style your colony?",
      "Think of CSS as the environmental controls for your colony. It changes how everything looks and feels.",
      "Flexbox is perfect for organizing your habitat modules. Grid works great for colony-wide layouts.",
      "Use custom properties like --energy-level to control your colony's systems.",
      "With CSS animations, you can create dynamic environmental effects. Try adding some to your life support systems!"
    ],
    location: {
      area: 'design-district',
      position: [-5, 0, 8]
    },
    unlockRequirement: {
      type: 'challenge',
      value: 'html-basics'
    },
    offerings: {
      challenges: ['css-styling', 'flexbox-layouts', 'animations-atmosphere'],
      blueprints: ['garden-module', 'entertainment-center'],
      resources: ['design-components']
    }
  },
  'js-jordan': {
    id: 'js-jordan',
    name: 'JS Jordan',
    role: 'Automation Expert',
    specialty: 'javascript',
    color: '#F7DF1E', // JavaScript yellow
    dialog: [
      "Yo! Jordan here. Ready to add some interactivity to this place?",
      "With JavaScript, we can automate just about anything in the colony.",
      "Event listeners are like colony sensors - they detect when something happens and respond accordingly.",
      "Functions are like specialized robots that perform specific tasks when called upon.",
      "Need to manage colony resources? Arrays and objects are perfect for organizing your data.",
      "Let's create some automated resource collectors to make your colony self-sufficient!"
    ],
    location: {
      area: 'automation-alley',
      position: [8, 0, -4]
    },
    unlockRequirement: {
      type: 'challenge',
      value: 'css-styling'
    },
    offerings: {
      challenges: ['js-basics', 'dom-manipulation', 'colony-automation'],
      blueprints: ['auto-collector', 'resource-processor'],
      resources: ['automation-components']
    }
  },
  'git-gary': {
    id: 'git-gary',
    name: 'Git Gary',
    role: 'Timeline Expert',
    specialty: 'git',
    color: '#F05032', // Git orange
    dialog: [
      "Greetings, time traveler! I'm Gary, keeper of the Timeline Stream.",
      "With the Time Stream (that's Git to you Earthlings), we can manage multiple colony timelines.",
      "Create a branch to experiment with colony designs without risking your main timeline.",
      "Made a mistake? No problem! We can revert to a previous point in your colony's history.",
      "Merge successful experiments back into your main timeline to improve your colony.",
      "The Time Stream lets us collaborate with other colonies across the galaxy!"
    ],
    location: {
      area: 'timeline-nexus',
      position: [0, 0, -10]
    },
    unlockRequirement: {
      type: 'level',
      value: 3
    },
    offerings: {
      challenges: ['timeline-basics', 'branch-management', 'merge-conflicts'],
      blueprints: ['timeline-machine', 'parallel-processor'],
      resources: ['timeline-crystals']
    }
  },
  'server-sam': {
    id: 'server-sam',
    name: 'Server Sam',
    role: 'Network Specialist',
    specialty: 'backend',
    color: '#6CC24A', // Node.js green
    dialog: [
      "Welcome to the Galactic Network! I'm Sam, your connection to other colonies.",
      "With backend systems, we can create APIs to share resources across the galactic network.",
      "Databases let you store colony data persistently, even through power cycles.",
      "Want to trade resources with other colonies? We need a secure authentication system first.",
      "RESTful architecture is like colony protocols - standardized ways to communicate.",
      "Let's set up a server to process resource requests from neighboring colonies!"
    ],
    location: {
      area: 'communication-hub',
      position: [-8, 0, -6]
    },
    unlockRequirement: {
      type: 'level',
      value: 5
    },
    offerings: {
      challenges: ['api-basics', 'database-management', 'authentication-security'],
      blueprints: ['server-node', 'data-storage'],
      resources: ['network-components']
    }
  }
};

/**
 * Helper function to get all available villagers
 * @param {number} playerLevel - Current player level
 * @param {string[]} completedChallenges - List of completed challenge IDs
 * @returns {Villager[]} List of available villagers
 */
export function getAvailableVillagers(playerLevel: number, completedChallenges: string[]): Villager[] {
  return Object.values(VILLAGERS).filter(villager => {
    if (!villager.unlockRequirement) {
      return true; // Always available if no requirements
    }
    
    if (villager.unlockRequirement.type === 'level') {
      return playerLevel >= (villager.unlockRequirement.value as number);
    }
    
    if (villager.unlockRequirement.type === 'challenge') {
      return completedChallenges.includes(villager.unlockRequirement.value as string);
    }
    
    return false;
  });
}

/**
 * Get a specific villager by ID
 * @param {string} id - Villager ID
 * @returns {Villager|undefined} Villager object or undefined if not found
 */
export function getVillagerById(id: string): Villager | undefined {
  return VILLAGERS[id];
}
