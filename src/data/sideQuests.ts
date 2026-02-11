/**
 * Side Quests for CodeCraft
 * Optional missions that add depth, humor, and replay value
 */

export interface SideQuest {
  id: string;
  title: string;
  description: string;
  questGiver: {
    name: string;
    role: string;
    personality: 'serious' | 'humorous' | 'mysterious' | 'enthusiastic' | 'grumpy';
  };
  story: {
    intro: string;
    progress: string[];
    completion: string;
  };
  objectives: Array<{
    id: string;
    description: string;
    type: 'code' | 'build' | 'collect' | 'explore' | 'time-trial' | 'puzzle';
    requirement: any;
    optional?: boolean;
  }>;
  rewards: {
    xp: number;
    resources?: Record<string, number>;
    unlocks?: string[];
    cosmetic?: string;
    title?: string;
  };
  repeatable?: boolean;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  estimatedTime: string; // "5-10 minutes"
}

export const SIDE_QUESTS: SideQuest[] = [
  // ===== HUMOR & PERSONALITY =====
  {
    id: 'coffee-quest',
    title: '☕ The Coffee Crisis',
    description: 'The crew is grumpy without coffee. Build a cafeteria and code a coffee dispenser!',
    questGiver: {
      name: 'Barista Bot',
      role: 'Automated Coffee Dispenser (Sentient)',
      personality: 'humorous'
    },
    story: {
      intro: "Error 418: I'm a teapot. Just kidding! I'm Barista Bot, and the crew needs COFFEE! Like, NOW. Their productivity is down 87.3%. Help me build a proper cafeteria with a working coffee dispenser, or face the wrath of uncaffeinated developers!",
      progress: [
        "Great start! But can you make the coffee machine *sparkle*? Developers love sparkles.",
        "Perfect! Now add some animations. Coffee should pour with *style*!",
        "YES! This is the most beautiful coffee dispenser in the galaxy!"
      ],
      completion: "Achievement unlocked: Caffeinated Coder! The crew's productivity is now 142% and rising. You're a hero! Here's a free espresso... in binary: 01000101 01010011 01010000 01010010 01000101 01010011 01010011 01001111 ☕"
    },
    objectives: [
      {
        id: 'build-cafeteria',
        description: 'Build a cafeteria structure',
        type: 'build',
        requirement: { buildingType: 'cafeteria', count: 1 }
      },
      {
        id: 'code-dispenser',
        description: 'Code an animated coffee dispenser',
        type: 'code',
        requirement: { element: 'button', hasAnimation: true, clickFunction: true }
      },
      {
        id: 'add-flavors',
        description: 'Add at least 3 coffee flavor options',
        type: 'code',
        requirement: { buttons: 3, withLabels: true },
        optional: true
      }
    ],
    rewards: {
      xp: 150,
      resources: { energy: 200, food: 50 },
      unlocks: ['cafeteria-building', 'barista-bot-friend'],
      cosmetic: 'coffee-mug-icon',
      title: 'Caffeinated Coder'
    },
    difficulty: 'easy',
    estimatedTime: '10-15 minutes'
  },

  {
    id: 'bug-hunt',
    title: '🐛 The Great Bug Hunt',
    description: 'Mysterious bugs are infecting the colony code. Find and fix them all!',
    questGiver: {
      name: 'Debug Dan',
      role: 'Quality Assurance Specialist',
      personality: 'grumpy'
    },
    story: {
      intro: "*Sigh* Another day, another hundred bugs. Look, newbie, we've got a serious problem. Someone's been writing sloppy code, and now bugs are EVERYWHERE. Not the cute kind either. These are nasty little logic errors that are making our systems crash. I need you to hunt them down and squash them. All of them. And try not to introduce more bugs while you're at it, okay?",
      progress: [
        "Not bad! You found the missing semicolon. But there are more...",
        "Good catch on that infinite loop! The CPU was literally smoking.",
        "You're actually pretty good at this. Maybe you're not a total newbie after all."
      ],
      completion: "Well, I'll be... You actually did it. All bugs squashed. The systems are running clean. I... I might have misjudged you. Here, take this debugger badge. You earned it. Now get out of here before I start thinking you're competent or something."
    },
    objectives: [
      {
        id: 'fix-html-bug',
        description: 'Fix the unclosed tag in the power grid',
        type: 'code',
        requirement: { bugType: 'unclosed-tag', fixed: true }
      },
      {
        id: 'fix-css-bug',
        description: 'Fix the missing semicolon in the stylesheet',
        type: 'code',
        requirement: { bugType: 'missing-semicolon', fixed: true }
      },
      {
        id: 'fix-js-bug',
        description: 'Fix the infinite loop in the automation script',
        type: 'code',
        requirement: { bugType: 'infinite-loop', fixed: true }
      },
      {
        id: 'bonus-bugs',
        description: 'Find and fix 3 bonus bugs',
        type: 'code',
        requirement: { bonusBugsFixed: 3 },
        optional: true
      }
    ],
    rewards: {
      xp: 300,
      resources: { energy: 150 },
      unlocks: ['debugger-tool', 'bug-detector'],
      cosmetic: 'bug-hunter-badge',
      title: 'Bug Terminator'
    },
    difficulty: 'medium',
    estimatedTime: '15-20 minutes'
  },

  {
    id: 'art-gallery',
    title: '🎨 The Digital Art Gallery',
    description: 'Create a beautiful art gallery showcasing your CSS skills!',
    questGiver: {
      name: 'Aria the Artist',
      role: 'Colony Art Director',
      personality: 'enthusiastic'
    },
    story: {
      intro: "Oh my gosh, Commander! I have the BEST idea! We need an art gallery! A place where we can showcase the beauty of code! CSS is ART, and I want to show everyone! Can you help me build the most GORGEOUS gallery the galaxy has ever seen? Please please please? 🎨✨",
      progress: [
        "OMG that gradient is AMAZING! More colors! MORE!",
        "YES! Those animations are so smooth! You're a GENIUS!",
        "This is... this is BEAUTIFUL! *wipes tear* It's perfect!"
      ],
      completion: "I... I have no words. This gallery is a masterpiece! The way the light reflects off the CSS, the smooth animations, the perfect color harmony... You're not just a developer, you're an ARTIST! The colony will love this. Thank you, thank you, THANK YOU! 💖"
    },
    objectives: [
      {
        id: 'create-gallery',
        description: 'Build a gallery structure with CSS Grid',
        type: 'code',
        requirement: { element: 'section', usesGrid: true, items: 6 }
      },
      {
        id: 'style-masterpiece',
        description: 'Create a stunning visual design',
        type: 'code',
        requirement: { gradients: true, animations: true, hover: true }
      },
      {
        id: 'interactive-exhibits',
        description: 'Add interactive elements to exhibits',
        type: 'code',
        requirement: { clickable: true, transforms: true }
      }
    ],
    rewards: {
      xp: 250,
      resources: { minerals: 100 },
      unlocks: ['art-gallery', 'css-master-badge'],
      cosmetic: 'artist-palette',
      title: 'Digital Picasso'
    },
    difficulty: 'medium',
    estimatedTime: '20-30 minutes'
  },

  // ===== SKILL-BASED CHALLENGES =====
  {
    id: 'speed-coder',
    title: '⚡ Speed Coding Challenge',
    description: 'Complete 5 coding tasks in under 5 minutes!',
    questGiver: {
      name: 'Velocity Vince',
      role: 'Speed Coding Champion',
      personality: 'enthusiastic'
    },
    story: {
      intro: "Yo Commander! Think you're fast? I'm Velocity Vince, and I hold the colony record for speed coding. But I've got a feeling you might give me a run for my money! Here's the challenge: 5 coding tasks, 5 minutes. Complete them all and you'll join the Speed Coders Hall of Fame. Ready? GO GO GO!",
      progress: [
        "Task 1 complete! Nice speed! Keep it up!",
        "3 down, 2 to go! You're on fire!",
        "Last one! Don't choke now!"
      ],
      completion: "WHAT?! You actually beat my record! That's... that's INCREDIBLE! Welcome to the Hall of Fame, Speed Demon! Your typing speed must be off the charts! Here's your champion badge. Wear it with pride! 🏆"
    },
    objectives: [
      {
        id: 'task-1',
        description: 'Create a header with h1 (30 seconds)',
        type: 'time-trial',
        requirement: { timeLimit: 30, code: '<header><h1>' }
      },
      {
        id: 'task-2',
        description: 'Style an element with 3 CSS properties (45 seconds)',
        type: 'time-trial',
        requirement: { timeLimit: 45, cssProperties: 3 }
      },
      {
        id: 'task-3',
        description: 'Write a function with getElementById (60 seconds)',
        type: 'time-trial',
        requirement: { timeLimit: 60, jsFunction: true }
      },
      {
        id: 'task-4',
        description: 'Create a flexbox layout (60 seconds)',
        type: 'time-trial',
        requirement: { timeLimit: 60, flex: true }
      },
      {
        id: 'task-5',
        description: 'Add an event listener (45 seconds)',
        type: 'time-trial',
        requirement: { timeLimit: 45, addEventListener: true }
      }
    ],
    rewards: {
      xp: 400,
      resources: { energy: 300 },
      unlocks: ['speed-mode', 'turbo-keyboard'],
      cosmetic: 'lightning-bolt',
      title: 'Speed Demon'
    },
    repeatable: true,
    difficulty: 'hard',
    estimatedTime: '5-10 minutes (per attempt)'
  },

  {
    id: 'css-wizard',
    title: '🧙 The CSS Wizardry Test',
    description: 'Master advanced CSS to pass the Wizardry Test!',
    questGiver: {
      name: 'Merlin.css',
      role: 'CSS Archmage',
      personality: 'mysterious'
    },
    story: {
      intro: "*A figure in flowing robes appears in a shimmer of light* Greetings, young apprentice. I am Merlin.css, master of the Cascading arts. You have shown promise, but true mastery requires understanding of the ancient CSS magics. Animations, transitions, transforms, gradients - these are but the basics. Are you ready to become a CSS Wizard?",
      progress: [
        "Impressive! You wield the @keyframes with confidence.",
        "Ah, the transform property bends to your will!",
        "Yes... the CSS Force is strong with you."
      ],
      completion: "*Nods approvingly* You have passed the test. From this day forth, you are no longer an apprentice, but a true CSS Wizard. May your styles always cascade beautifully, and your selectors never lack specificity. Go forth and create wonders! 🧙‍♂️✨"
    },
    objectives: [
      {
        id: 'create-animation',
        description: 'Create a complex @keyframes animation',
        type: 'code',
        requirement: { keyframes: true, steps: 3, properties: 2 }
      },
      {
        id: 'master-transforms',
        description: 'Use transform with rotate, scale, and translate',
        type: 'code',
        requirement: { transform: ['rotate', 'scale', 'translate'] }
      },
      {
        id: 'gradient-mastery',
        description: 'Create a multi-color gradient background',
        type: 'code',
        requirement: { gradient: true, colors: 3 }
      },
      {
        id: 'transition-magic',
        description: 'Add smooth transitions to hover effects',
        type: 'code',
        requirement: { transition: true, hover: true }
      }
    ],
    rewards: {
      xp: 500,
      resources: { minerals: 200 },
      unlocks: ['css-wizard-hat', 'advanced-css-tools'],
      cosmetic: 'wizard-staff',
      title: 'CSS Wizard 🧙'
    },
    difficulty: 'hard',
    estimatedTime: '25-35 minutes'
  },

  // ===== EXPLORATION & DISCOVERY =====
  {
    id: 'easter-egg-hunt',
    title: '🥚 The Easter Egg Hunt',
    description: 'Pixel has hidden secret Easter eggs throughout the colony. Find them all!',
    questGiver: {
      name: 'Pixel',
      role: 'Mischievous AI',
      personality: 'humorous'
    },
    story: {
      intro: "Hehe! Commander, I've been having some fun while you were busy coding. I've hidden 10 Easter eggs throughout the colony - little surprises and secrets! Some are in plain sight, others require clever thinking. Can you find them all? 🕵️",
      progress: [
        "Nice! You found the Konami Code reference!",
        "Ooh, good eye! That was well hidden!",
        "You're good at this! Only a few more to go!"
      ],
      completion: "WOW! You found them ALL! I can't believe it! You're like a digital detective! Here's a special reward - access to my secret developer console. Don't tell anyone! 🤫"
    },
    objectives: [
      {
        id: 'find-eggs',
        description: 'Find all 10 hidden Easter eggs',
        type: 'explore',
        requirement: { easterEggsFound: 10 }
      }
    ],
    rewards: {
      xp: 1000,
      resources: { energy: 500, minerals: 500 },
      unlocks: ['dev-console', 'secret-area', 'all-easter-eggs'],
      cosmetic: 'detective-badge',
      title: 'Easter Egg Hunter 🥚'
    },
    difficulty: 'extreme',
    estimatedTime: '45-60 minutes'
  },

  {
    id: 'ancient-puzzle',
    title: '🗿 The Ancient Puzzle',
    description: 'Decode the Ancient encryption to unlock a secret vault!',
    questGiver: {
      name: 'Professor Cypher',
      role: 'Cryptographer',
      personality: 'mysterious'
    },
    story: {
      intro: "Commander, I've discovered something extraordinary. Deep within the ruins is a vault, sealed with an Ancient encryption. The encryption is written in... code. HTML, CSS, and JavaScript combined in ways I've never seen. If you can decode it, imagine what treasures might be inside!",
      progress: [
        "You've decoded the HTML layer! The vault is responding!",
        "The CSS cipher is broken! We're getting closer!",
        "The JavaScript lock is open! The vault is unsealing!"
      ],
      completion: "INCREDIBLE! The vault is open! Inside is... knowledge. Pure, concentrated knowledge of the Ancients. Their entire code library! This is the discovery of the millennium! You'll be famous across the galaxy!"
    },
    objectives: [
      {
        id: 'decode-html',
        description: 'Decode the HTML encryption layer',
        type: 'puzzle',
        requirement: { puzzle: 'html-cipher', solved: true }
      },
      {
        id: 'decode-css',
        description: 'Decode the CSS encryption layer',
        type: 'puzzle',
        requirement: { puzzle: 'css-cipher', solved: true }
      },
      {
        id: 'decode-js',
        description: 'Decode the JavaScript encryption layer',
        type: 'puzzle',
        requirement: { puzzle: 'js-cipher', solved: true }
      }
    ],
    rewards: {
      xp: 800,
      resources: { energy: 400, minerals: 400, water: 400 },
      unlocks: ['ancient-vault', 'ancient-knowledge', 'cipher-tools'],
      cosmetic: 'ancient-medallion',
      title: 'Code Breaker 🔐'
    },
    difficulty: 'extreme',
    estimatedTime: '40-50 minutes'
  },

  // ===== COMMUNITY & SOCIAL =====
  {
    id: 'mentor-mission',
    title: '👥 Mentorship Program',
    description: 'Help 3 new colonists learn to code!',
    questGiver: {
      name: 'Teacher Tara',
      role: 'Education Coordinator',
      personality: 'enthusiastic'
    },
    story: {
      intro: "Commander! We have new colonists arriving, and they're eager to learn coding! You're one of our best developers now - would you help teach them? It would mean so much! Plus, teaching is the best way to solidify your own knowledge!",
      progress: [
        "Great job! Your first student just created their first header!",
        "Student 2 is loving your teaching style!",
        "Last student is almost done with their first project!"
      ],
      completion: "You did it! All three students have completed their first projects! They're so inspired by you! One of them said, 'I want to be just like the Commander someday!' You're making a real difference! 🎓"
    },
    objectives: [
      {
        id: 'teach-student-1',
        description: 'Help Student 1 create their first HTML page',
        type: 'code',
        requirement: { studentProject: 1, completed: true }
      },
      {
        id: 'teach-student-2',
        description: 'Help Student 2 learn CSS basics',
        type: 'code',
        requirement: { studentProject: 2, completed: true }
      },
      {
        id: 'teach-student-3',
        description: 'Help Student 3 write their first JavaScript',
        type: 'code',
        requirement: { studentProject: 3, completed: true }
      }
    ],
    rewards: {
      xp: 350,
      resources: { energy: 200 },
      unlocks: ['mentor-badge', 'teaching-tools'],
      cosmetic: 'teacher-cap',
      title: 'Master Teacher 👨‍🏫'
    },
    repeatable: true,
    difficulty: 'easy',
    estimatedTime: '20-25 minutes'
  }
];

// Helper functions
export function getSideQuestById(id: string): SideQuest | undefined {
  return SIDE_QUESTS.find(q => q.id === id);
}

export function getSideQuestsByDifficulty(difficulty: SideQuest['difficulty']): SideQuest[] {
  return SIDE_QUESTS.filter(q => q.difficulty === difficulty);
}

export function getAvailableSideQuests(
  completedQuests: string[],
  playerLevel: number
): SideQuest[] {
  return SIDE_QUESTS.filter(quest => {
    // Already completed and not repeatable
    if (completedQuests.includes(quest.id) && !quest.repeatable) {
      return false;
    }

    // Level requirements (simplified - you could make this more complex)
    const difficultyLevel = {
      'easy': 1,
      'medium': 3,
      'hard': 5,
      'extreme': 8
    };

    return playerLevel >= difficultyLevel[quest.difficulty];
  });
}

