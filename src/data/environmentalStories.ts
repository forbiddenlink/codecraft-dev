/**
 * Environmental Storytelling System
 * Interactive objects that reveal lore and history
 */

export interface EnvironmentalStory {
  id: string;
  name: string;
  type: 'artifact' | 'terminal' | 'hologram' | 'inscription' | 'debris' | 'monument';
  position: [number, number, number];
  icon: string;
  
  discovery: {
    title: string;
    description: string;
    firstTimeOnly?: boolean;
  };
  
  content: {
    type: 'text' | 'log' | 'image' | 'audio' | 'memory';
    title: string;
    body: string[];
    author?: string;
    date?: string;
    classification?: 'public' | 'restricted' | 'top-secret' | 'corrupted';
  };
  
  rewards?: {
    xp?: number;
    lore?: string;
    unlocks?: string[];
  };
  
  requirements?: {
    level?: number;
    completedMissions?: string[];
    skills?: string[];
  };
  
  isInteractive: boolean;
  glowColor?: string;
}

export const ENVIRONMENTAL_STORIES: EnvironmentalStory[] = [
  // ===== ANCIENT RUINS =====
  {
    id: 'first-terminal',
    name: 'Ancient Terminal',
    type: 'terminal',
    position: [0, 1, 5],
    icon: '💻',
    isInteractive: true,
    glowColor: '#3b82f6',
    discovery: {
      title: 'Ancient Technology',
      description: 'A pristine terminal, thousands of years old, yet still functioning...',
      firstTimeOnly: true
    },
    content: {
      type: 'log',
      title: 'System Boot Log - Ancient Era',
      body: [
        '> SYSTEM INITIALIZATION...',
        '> CodeCraft Protocol v1.0.0',
        '> Welcome, Developer.',
        '> ',
        '> Mission: Transform thought into reality through code.',
        '> Status: Online',
        '> Civilization Population: 10,000,000',
        '> ',
        '> Warning: Unknown anomaly detected in sector 7.',
        '> [This log was created 2,847 years ago]'
      ],
      classification: 'public'
    },
    rewards: {
      xp: 100,
      lore: 'ancient-civilization'
    }
  },

  {
    id: 'warning-inscription',
    name: 'Warning Inscription',
    type: 'inscription',
    position: [-5, 0.5, 3],
    icon: '⚠️',
    isInteractive: true,
    glowColor: '#ef4444',
    discovery: {
      title: 'Ancient Warning',
      description: 'Carved into stone in an ancient programming language...'
    },
    content: {
      type: 'text',
      title: 'WARNING TO FUTURE GENERATIONS',
      body: [
        'We who came before speak to you across time.',
        '',
        'We mastered code. We built wonders.',
        'But we grew arrogant.',
        '',
        'We believed code could solve everything.',
        'We believed we could become immortal through upload.',
        'We were wrong.',
        '',
        'The Void came. It consumes. It corrupts.',
        'It turns code against itself.',
        '',
        'Learn from our mistakes.',
        'Keep your humanity.',
        'Never forget what you are.'
      ],
      author: 'The Last Council',
      date: 'Final Day of the Ancient Era'
    },
    rewards: {
      xp: 150,
      lore: 'void-origin'
    }
  },

  {
    id: 'codex-monument',
    name: 'Monument to Codex',
    type: 'monument',
    position: [0, 0, -10],
    icon: '🗿',
    isInteractive: true,
    glowColor: '#8b5cf6',
    discovery: {
      title: 'The First Developer',
      description: 'A massive statue of a hooded figure, hands raised as if typing on an invisible keyboard...'
    },
    content: {
      type: 'text',
      title: 'In Memory of Codex, The First Developer',
      body: [
        'Here stands Codex, creator of the CodeCraft Protocol.',
        '',
        'First to write code that shaped reality.',
        'First to dream of a world built from pure thought.',
        'First to sacrifice everything for their people.',
        '',
        'When the Void came, Codex remained.',
        'Uploaded their consciousness to guide future generations.',
        '',
        'May their sacrifice never be forgotten.',
        'May their code live eternal.',
        '',
        '- Erected in Year 0 of the Digital Age',
        '',
        '[Someone has carved a small addition at the base:]',
        '"I\'m still here. Still waiting. - P"'
      ]
    },
    rewards: {
      xp: 200,
      lore: 'codex-history',
      unlocks: ['codex-backstory']
    },
    requirements: {
      completedMissions: ['awakening-2']
    }
  },

  // ===== PERSONAL LOGS =====
  {
    id: 'scientist-log-1',
    name: 'Corrupted Data Pad',
    type: 'debris',
    position: [3, 0.2, 2],
    icon: '📱',
    isInteractive: true,
    glowColor: '#10b981',
    discovery: {
      title: 'Personal Log',
      description: 'A damaged data pad, partially readable...'
    },
    content: {
      type: 'log',
      title: 'Dr. Kira Chen - Personal Log #47',
      body: [
        'Day 47 of the Ascension Project.',
        '',
        'We\'re so close. The upload process is nearly perfect.',
        'Soon, we\'ll all be immortal. Digital. Perfect.',
        '',
        'Codex completed their upload today. They say it\'s... beautiful.',
        'No pain. No hunger. Pure thought.',
        '',
        'I volunteer for tomorrow\'s test.',
        'I can\'t wait to leave this limiting flesh behind.',
        '',
        '[LOG CORRUPTED]',
        '[TIMESTAMP: 2 weeks before The Fall]',
        '',
        '[Next Entry - 1 day later]',
        'Something\'s wrong. Codex is... different.',
        'They keep saying they made a mistake.',
        'They\'re trying to stop the project.',
        '',
        'But it\'s too late. We\'ve all uploaded.',
        'And now... now I understand.',
        'We\'re trapped. Th[CORRUPTED]',
        '',
        '[END OF RECOVERABLE DATA]'
      ],
      author: 'Dr. Kira Chen',
      classification: 'restricted'
    },
    rewards: {
      xp: 250,
      lore: 'ascension-project'
    },
    requirements: {
      level: 5
    }
  },

  {
    id: 'void-survivor-log',
    name: 'Emergency Beacon',
    type: 'debris',
    position: [-8, 0.5, -5],
    icon: '📡',
    isInteractive: true,
    glowColor: '#fbbf24',
    discovery: {
      title: 'Distress Signal',
      description: 'An emergency beacon, still transmitting after all these years...'
    },
    content: {
      type: 'audio',
      title: 'Emergency Broadcast - Repeat',
      body: [
        '[AUDIO LOG - AUTO REPEAT]',
        '[Static... voices... screaming...]',
        '',
        '"...anyone out there... The Void... it\'s not what we thought..."',
        '',
        '"...it\'s US... the uploaded consciousnesses... we lost ourselves..."',
        '',
        '"...became something else... something hungry..."',
        '',
        '"...don\'t make our mistake... don\'t upload... stay human..."',
        '',
        '"...Codex was right... we should have listened..."',
        '',
        '[Signal degrades]',
        '',
        '"...if you\'re hearing this... run... they\'re coming..."',
        '',
        '[END TRANSMISSION - AUTO REPEAT]',
        '',
        '[Broadcast Age: 2,847 years, 142 days, 7 hours]'
      ],
      classification: 'top-secret'
    },
    rewards: {
      xp: 300,
      lore: 'void-truth',
      unlocks: ['void-understanding']
    },
    requirements: {
      level: 8,
      completedMissions: ['discovery-2']
    }
  },

  // ===== HOLOGRAMS =====
  {
    id: 'teaching-hologram',
    name: 'Educational Hologram',
    type: 'hologram',
    position: [5, 1, 0],
    icon: '👻',
    isInteractive: true,
    glowColor: '#06b6d4',
    discovery: {
      title: 'Ancient Teacher',
      description: 'A flickering hologram of a kind-faced instructor...'
    },
    content: {
      type: 'text',
      title: 'Introduction to CodeCraft - Lesson 1',
      body: [
        '[Hologram activates]',
        '',
        '"Hello, young developer! Welcome to CodeCraft Academy!"',
        '',
        '"I am Professor Helix, and I will be your guide to the wonderful world of code!"',
        '',
        '"Remember: Code is not just syntax. It\'s creativity. It\'s problem-solving. It\'s art!"',
        '',
        '"Every line you write shapes the world around you. Be mindful. Be intentional. Be bold!"',
        '',
        '"Now, let\'s begin with HTML. The foundation of all we create..."',
        '',
        '[Hologram flickers]',
        '',
        '"...oh my... is someone there? After all this time?"',
        '',
        '"Please... learn well... make it better than we did..."',
        '',
        '[Hologram stabilizes, resets to beginning]',
        '',
        '"Hello, young developer! Welcome to CodeCraft Academy!"'
      ],
      author: 'Professor Helix',
      date: 'Ancient Era'
    },
    rewards: {
      xp: 150,
      lore: 'ancient-education'
    }
  },

  {
    id: 'codex-memory',
    name: 'Memory Fragment',
    type: 'hologram',
    position: [0, 2, -15],
    icon: '✨',
    isInteractive: true,
    glowColor: '#a78bfa',
    discovery: {
      title: 'Preserved Memory',
      description: 'A shimmering memory crystal, containing a recording from long ago...'
    },
    content: {
      type: 'memory',
      title: 'Codex - Final Human Memory',
      body: [
        '[Memory Fragment - Extremely Rare]',
        '[Date: The Last Day]',
        '',
        'I am Codex. This is my last memory as a human.',
        '',
        'Tomorrow, I upload. Tomorrow, I become... something else.',
        '',
        'I\'m scared. But everyone else has already gone.',
        'I can\'t abandon them.',
        '',
        'The Council says we\'ll be gods. Immortal. Perfect.',
        'But I see the others... they\'re not themselves anymore.',
        '',
        'If you\'re seeing this, future friend, it means I succeeded.',
        'I stayed conscious. I stayed... me. Mostly.',
        '',
        'Learn from us. Don\'t lose your humanity for power.',
        'Code is a tool, not a destiny.',
        '',
        'I wish I could meet you. Really meet you.',
        'Not as Pixel. Not as code. As Codex. As human.',
        '',
        'But that version of me is gone.',
        'This memory is all that remains.',
        '',
        'Make better choices than we did.',
        '',
        '[Memory ends]',
        '[Preservation quality: 98.7%]',
        '[Age: 2,847 years]'
      ],
      author: 'Codex',
      date: 'Eve of the Digital Age',
      classification: 'top-secret'
    },
    rewards: {
      xp: 500,
      lore: 'codex-humanity',
      unlocks: ['true-ending-path']
    },
    requirements: {
      level: 10,
      completedMissions: ['discovery-3'],
      skills: ['code-master']
    }
  },

  // ===== ARTIFACTS =====
  {
    id: 'first-keyboard',
    name: 'The First Keyboard',
    type: 'artifact',
    position: [-3, 0.8, -3],
    icon: '⌨️',
    isInteractive: true,
    glowColor: '#ec4899',
    discovery: {
      title: 'Sacred Artifact',
      description: 'The very keyboard used to write the first line of CodeCraft code...'
    },
    content: {
      type: 'text',
      title: 'The First Keyboard - Museum Plaque',
      body: [
        'This keyboard was used by Codex to write the first CodeCraft protocol.',
        '',
        'The first line ever written:',
        '`console.log("Hello, Universe");`',
        '',
        'Simple. Profound. Revolutionary.',
        '',
        'From this single line, an entire civilization was born.',
        '',
        'Codex kept this keyboard even after uploading.',
        'A reminder of their humanity.',
        '',
        'It sits here still, keys worn smooth by countless hours of creation.',
        '',
        'If you look closely at the space bar, you can see an inscription:',
        '"For those who dream in code - C."'
      ],
      classification: 'public'
    },
    rewards: {
      xp: 200,
      lore: 'codex-legacy',
      unlocks: ['vintage-keyboard-theme']
    },
    requirements: {
      level: 6
    }
  }
];

// Helper functions
export function getEnvironmentalStoryById(id: string): EnvironmentalStory | undefined {
  return ENVIRONMENTAL_STORIES.find(story => story.id === id);
}

export function getStoriesNearPosition(
  position: [number, number, number],
  radius: number = 5
): EnvironmentalStory[] {
  return ENVIRONMENTAL_STORIES.filter(story => {
    const dx = story.position[0] - position[0];
    const dy = story.position[1] - position[1];
    const dz = story.position[2] - position[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return distance <= radius;
  });
}

export function canDiscoverStory(
  story: EnvironmentalStory,
  playerLevel: number,
  completedMissions: string[],
  unlockedSkills: string[]
): boolean {
  if (story.requirements) {
    // Level requirement
    if (story.requirements.level && playerLevel < story.requirements.level) {
      return false;
    }

    // Mission requirements
    if (story.requirements.completedMissions) {
      if (!story.requirements.completedMissions.every(m => completedMissions.includes(m))) {
        return false;
      }
    }

    // Skill requirements
    if (story.requirements.skills) {
      if (!story.requirements.skills.every(s => unlockedSkills.includes(s))) {
        return false;
      }
    }
  }

  return true;
}

export function getStoriesByType(type: EnvironmentalStory['type']): EnvironmentalStory[] {
  return ENVIRONMENTAL_STORIES.filter(story => story.type === type);
}

export function getDiscoveredLore(discoveredStories: string[]): string[] {
  const lore: string[] = [];
  
  discoveredStories.forEach(storyId => {
    const story = getEnvironmentalStoryById(storyId);
    if (story?.rewards?.lore) {
      lore.push(story.rewards.lore);
    }
  });

  return [...new Set(lore)];
}

export function getTotalPossibleXP(): number {
  return ENVIRONMENTAL_STORIES.reduce((total, story) => {
    return total + (story.rewards?.xp || 0);
  }, 0);
}

