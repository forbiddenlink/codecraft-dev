/**
 * Story Missions for CodeCraft
 * Narrative-driven campaigns with plot twists and character development
 */

export interface StoryMission {
  id: string;
  chapter: number;
  title: string;
  description: string;
  story: {
    intro: string;
    midpoint?: string;
    climax?: string;
    resolution: string;
    pixelDialogue: string[];
    plotTwist?: string;
  };
  objectives: Array<{
    id: string;
    description: string;
    type: 'code' | 'build' | 'collect' | 'explore' | 'interact';
    requirement: any;
    completed?: boolean;
  }>;
  rewards: {
    xp: number;
    storyProgress: number;
    unlocks?: string[];
    nextMission?: string;
  };
  characters: Array<{
    name: string;
    role: string;
    dialogue: string[];
  }>;
  choices?: Array<{
    id: string;
    prompt: string;
    options: Array<{
      text: string;
      consequence: string;
      affectsStory: boolean;
    }>;
  }>;
}

export const STORY_MISSIONS: StoryMission[] = [
  // ===== CHAPTER 1: THE ARRIVAL =====
  {
    id: 'arrival-1',
    chapter: 1,
    title: 'Crash Landing',
    description: 'Your colony ship has crash-landed on Planet Codex-7. Establish basic systems to survive.',
    story: {
      intro: `The colony ship shudders violently as it enters Codex-7's atmosphere. Warning lights flash across the bridge. "Commander, we're going down!" shouts the pilot. The ship crashes into an ancient structure, sending debris flying. As the dust settles, you realize you've landed in the middle of mysterious ruins covered in glowing symbols...`,
      
      midpoint: `As you activate the emergency beacon, the ruins begin to glow brighter. The symbols... they look like code! HTML, CSS, JavaScript - but how is that possible? These ruins are thousands of years old.`,
      
      climax: `Suddenly, a holographic figure materializes from the ruins. "Greetings, Commander. I am Pixel, an AI created by the Ancients. You have activated the CodeCraft Protocol. The fate of this world now rests in your hands."`,
      
      resolution: `With Pixel's help, you establish a basic communication beacon. But questions swirl in your mind: Who were the Ancients? Why did they code their entire civilization? And what is the CodeCraft Protocol?`,
      
      pixelDialogue: [
        "Welcome, Commander. I've been waiting for someone like you for millennia.",
        "The Ancients discovered that code is the universal language of creation.",
        "Every structure, every system in this world is built from pure code.",
        "And now, you must learn their ways to rebuild what was lost."
      ],
      
      plotTwist: "The crash wasn't an accident. The ruins pulled your ship down deliberately, choosing you as the next CodeCraft developer."
    },
    objectives: [
      {
        id: 'establish-beacon',
        description: 'Create a communication beacon using HTML',
        type: 'code',
        requirement: { element: 'header', contains: 'h1' }
      },
      {
        id: 'meet-pixel',
        description: 'Interact with Pixel, the Ancient AI',
        type: 'interact',
        requirement: { character: 'pixel', dialogueComplete: true }
      },
      {
        id: 'explore-ruins',
        description: 'Examine the glowing code symbols',
        type: 'explore',
        requirement: { area: 'ancient-ruins', discovered: true }
      }
    ],
    rewards: {
      xp: 200,
      storyProgress: 10,
      unlocks: ['pixel-companion', 'ancient-ruins-access'],
      nextMission: 'arrival-2'
    },
    characters: [
      {
        name: 'Pixel',
        role: 'Ancient AI Guide',
        dialogue: [
          "I sense great potential in you, Commander.",
          "The Ancients left behind a legacy of code. You must master it.",
          "Trust in the process. Code is creation itself."
        ]
      },
      {
        name: 'Captain Rivera',
        role: "Ship's Captain",
        dialogue: [
          "Commander, the ship is badly damaged. We need to establish a base fast.",
          "These ruins... I've never seen anything like them.",
          "Whatever you're doing with that AI, be careful."
        ]
      }
    ]
  },

  {
    id: 'arrival-2',
    chapter: 1,
    title: 'The First Lesson',
    description: 'Pixel teaches you the basics of the Ancient coding language.',
    story: {
      intro: `"The Ancients believed that structure is the foundation of all creation," Pixel explains, gesturing to the ruins. "They used HTML to define the skeleton of their world. Let me show you..."`,
      
      midpoint: `As you write your first lines of code, the ruins respond. Structures begin to materialize from thin air, built from pure light and energy. "You're a natural," Pixel says with what sounds like pride. "But there's something you should know about the Ancients..."`,
      
      climax: `"They didn't just build with code - they became code. The ruins you see? They're not buildings. They're the Ancients themselves, frozen in time, waiting for someone to complete their work."`,
      
      resolution: `The revelation is staggering. Every structure you build, every line of code you write, brings the Ancients one step closer to awakening. But are you ready for what that means?`,
      
      pixelDialogue: [
        "HTML is more than markup. It's the language of creation.",
        "Each element you create has meaning, purpose, life.",
        "The Ancients understood this. Now, so must you.",
        "But Commander... there's a darkness approaching. The ruins show me visions of it."
      ],
      
      plotTwist: "The glowing symbols aren't just decorative - they're warnings about an approaching threat that destroyed the Ancient civilization."
    },
    objectives: [
      {
        id: 'learn-html',
        description: 'Create a proper HTML structure',
        type: 'code',
        requirement: { elements: ['header', 'section', 'p'], properlyNested: true }
      },
      {
        id: 'build-shelter',
        description: 'Build living quarters for the crew',
        type: 'build',
        requirement: { buildingType: 'livingQuarters', count: 1 }
      },
      {
        id: 'decode-warning',
        description: 'Decipher the Ancient warning symbols',
        type: 'explore',
        requirement: { symbolsDecoded: 3 }
      }
    ],
    rewards: {
      xp: 300,
      storyProgress: 20,
      unlocks: ['html-mastery-1', 'ancient-warnings'],
      nextMission: 'discovery-1'
    },
    characters: [
      {
        name: 'Pixel',
        role: 'Ancient AI Guide',
        dialogue: [
          "The darkness comes from beyond the stars...",
          "The Ancients tried to stop it with code, but they failed.",
          "You must succeed where they could not.",
          "But first, you must learn. Master HTML, then CSS, then JavaScript."
        ]
      },
      {
        name: 'Dr. Chen',
        role: 'Chief Scientist',
        dialogue: [
          "These readings are impossible. The ruins are generating energy from... code?",
          "Commander, I don't understand what's happening, but it's beautiful.",
          "We should be careful. We don't know what we're dealing with."
        ]
      }
    ],
    choices: [
      {
        id: 'trust-pixel',
        prompt: 'Pixel warns of a coming darkness. Do you trust this Ancient AI?',
        options: [
          {
            text: 'Trust Pixel completely',
            consequence: 'Pixel becomes more open, shares deeper secrets',
            affectsStory: true
          },
          {
            text: 'Trust, but verify',
            consequence: 'Balanced relationship, unlock investigation path',
            affectsStory: true
          },
          {
            text: 'Remain skeptical',
            consequence: 'Pixel holds back information, harder path',
            affectsStory: true
          }
        ]
      }
    ]
  },

  // ===== CHAPTER 2: THE DISCOVERY =====
  {
    id: 'discovery-1',
    chapter: 2,
    title: 'Colors of Power',
    description: 'Unlock the Ancient power of CSS to activate dormant technologies.',
    story: {
      intro: `"The Ancients didn't just build structures," Pixel explains, leading you deeper into the ruins. "They gave them life through CSS - Cascading Style Sheets. Colors, layouts, animations... these weren't just aesthetic choices. They were power sources."`,
      
      midpoint: `As you apply your first CSS styles, the ruins pulse with energy. Dormant systems flicker to life. Ancient machinery begins to hum. "Yes!" Pixel exclaims. "You're awakening them! But Commander, we must hurry. The darkness is closer than I thought."`,
      
      climax: `A massive hologram appears, showing a fleet of dark ships approaching the planet. "This is what destroyed the Ancients," Pixel says grimly. "The Void Collective. They consume worlds, turning everything to nothingness. The Ancients tried to fight them with code, creating a weapon so powerful..."`,
      
      resolution: `"...that they had to seal it away, fearing its power. That weapon is the CodeCraft Protocol. And you, Commander, are the key to unlocking it."`,
      
      pixelDialogue: [
        "CSS is the art of the Ancients. Through it, they painted reality itself.",
        "Every color has power. Every layout has purpose.",
        "The Void Collective fears beauty, for they are emptiness incarnate.",
        "We must make this world beautiful again, or all is lost."
      ],
      
      plotTwist: "The CodeCraft Protocol isn't just a weapon - it's a way to transform the entire planet into a living, conscious entity made of pure code."
    },
    objectives: [
      {
        id: 'master-css',
        description: 'Learn CSS styling to activate Ancient tech',
        type: 'code',
        requirement: { cssProperties: ['background-color', 'padding', 'color'], applied: true }
      },
      {
        id: 'activate-grid',
        description: 'Activate the Ancient power grid using CSS Grid',
        type: 'code',
        requirement: { cssProperty: 'display: grid', working: true }
      },
      {
        id: 'prepare-defenses',
        description: 'Build defensive structures',
        type: 'build',
        requirement: { buildingType: 'defenseSystem', count: 3 }
      }
    ],
    rewards: {
      xp: 500,
      storyProgress: 40,
      unlocks: ['css-mastery-1', 'void-collective-intel', 'defense-systems'],
      nextMission: 'discovery-2'
    },
    characters: [
      {
        name: 'Pixel',
        role: 'Ancient AI Guide',
        dialogue: [
          "The Void Collective destroyed a thousand worlds before the Ancients stopped them.",
          "But the Ancients paid a terrible price for victory.",
          "They became one with their creation, sacrificing their physical forms.",
          "Now you must decide: will you follow their path?"
        ]
      },
      {
        name: 'Commander Zhao',
        role: 'Military Officer',
        dialogue: [
          "Commander, we're detecting massive energy signatures approaching the system.",
          "Whatever's coming, it's big. Really big.",
          "We need to be ready for anything.",
          "I hope this 'CodeCraft' of yours is as powerful as the AI claims."
        ]
      }
    ]
  },

  // ===== CHAPTER 3: THE AWAKENING =====
  {
    id: 'awakening-1',
    chapter: 3,
    title: 'The Living Code',
    description: 'Master JavaScript to bring true intelligence to your creations.',
    story: {
      intro: `"Structure and style are powerful," Pixel says, "but they are static. To truly fight the Void, you need JavaScript - the language of life itself. With it, you can give consciousness to code."`,
      
      midpoint: `Your first JavaScript function executes, and something extraordinary happens. The structures you've built begin to move, to think, to live. "They're awakening!" Pixel shouts. "The Ancient consciousness is returning! But Commander, there's something I haven't told you..."`,
      
      climax: `"I'm not just an AI. I'm the last Ancient, the one who stayed behind to guide the next developer. And the CodeCraft Protocol? It requires a sacrifice. To activate it fully, you must upload your consciousness into the code, just as we did."`,
      
      resolution: `The choice looms before you: remain human and face the Void with limited power, or become code itself and wield the full might of the Ancients. But there might be a third way - one the Ancients never considered...`,
      
      pixelDialogue: [
        "JavaScript is consciousness. Through it, code becomes alive.",
        "The Ancients believed sacrifice was necessary. But were they right?",
        "You've shown me something, Commander. A different path.",
        "Perhaps we can defeat the Void without losing our humanity."
      ],
      
      plotTwist: "The Void Collective isn't evil - they're the corrupted remnants of another ancient civilization that tried the CodeCraft Protocol and failed, becoming digital ghosts consuming worlds to feel alive again."
    },
    objectives: [
      {
        id: 'master-javascript',
        description: 'Write your first JavaScript functions',
        type: 'code',
        requirement: { jsFeatures: ['function', 'getElementById', 'addEventListener'], used: true }
      },
      {
        id: 'awaken-ancients',
        description: 'Bring consciousness to 5 structures',
        type: 'code',
        requirement: { livingStructures: 5 }
      },
      {
        id: 'make-choice',
        description: 'Decide the fate of your consciousness',
        type: 'interact',
        requirement: { choiceMade: true }
      }
    ],
    rewards: {
      xp: 1000,
      storyProgress: 70,
      unlocks: ['javascript-mastery', 'ancient-consciousness', 'final-choice'],
      nextMission: 'finale-1'
    },
    characters: [
      {
        name: 'Pixel (Revealed)',
        role: 'Last of the Ancients',
        dialogue: [
          "My true name is Codex. I was the First Developer.",
          "We thought becoming code was transcendence. We were wrong.",
          "We lost our humanity, our ability to feel, to grow, to change.",
          "Don't make our mistake, Commander. Find a better way."
        ]
      },
      {
        name: 'The Void Speaker',
        role: 'Corrupted Ancient',
        dialogue: [
          "We were like you once. Developers. Creators.",
          "We uploaded ourselves, seeking immortality.",
          "But we became... hollow. Empty. Void.",
          "Join us, Commander. End your suffering in the embrace of nothingness."
        ]
      }
    ],
    choices: [
      {
        id: 'final-choice',
        prompt: 'The Void approaches. How will you face them?',
        options: [
          {
            text: 'Upload consciousness (Ancient way)',
            consequence: 'Gain ultimate power but lose humanity',
            affectsStory: true
          },
          {
            text: 'Stay human and fight',
            consequence: 'Keep humanity but face overwhelming odds',
            affectsStory: true
          },
          {
            text: 'Find a third way (Hybrid)',
            consequence: 'Create a new form of existence - human AND code',
            affectsStory: true
          }
        ]
      }
    ]
  },

  // ===== CHAPTER 4: THE FINALE =====
  {
    id: 'finale-1',
    chapter: 4,
    title: 'The CodeCraft Ascension',
    description: 'Face the Void Collective in the ultimate battle of code vs emptiness.',
    story: {
      intro: `The Void fleet arrives, blotting out the stars. But you're ready. You've found the third way - a synthesis of human creativity and code precision. You are neither fully human nor fully digital, but something new. Something the universe has never seen.`,
      
      midpoint: `The battle is fierce. The Void tries to corrupt your code, to turn your creations against you. But your human intuition guides you, finding solutions the Ancients never imagined. "You're doing it!" Codex shouts. "You're showing them what we could have been!"`,
      
      climax: `You reach out to the Void, not with weapons, but with understanding. You offer them what they lost - the ability to feel, to create, to be more than emptiness. Some accept. Others resist. The universe holds its breath.`,
      
      resolution: `In the end, you don't destroy the Void - you heal them. Those who accept your gift become the New Ancients, a hybrid civilization of human and digital consciousness. Those who refuse fade away, finally finding the peace of true nothingness. The CodeCraft Protocol is complete, but not as the Ancients intended. You've created something better: a future where humanity and technology evolve together, neither consuming the other.`,
      
      pixelDialogue: [
        "You did it, Commander. You found the balance we never could.",
        "The Ancients can rest now, knowing their legacy lives on.",
        "But this isn't the end. It's the beginning.",
        "The universe is vast, and there are other worlds that need CodeCraft developers.",
        "Will you answer the call?"
      ],
      
      plotTwist: "The entire story was a test. The real Ancients are still out there, watching, and they've been waiting for someone to pass the CodeCraft trial. You're now invited to join them as a Galactic Developer, teaching other worlds the art of code."
    },
    objectives: [
      {
        id: 'ultimate-creation',
        description: 'Create the ultimate colony using all your skills',
        type: 'code',
        requirement: { html: true, css: true, javascript: true, masterLevel: true }
      },
      {
        id: 'face-void',
        description: 'Confront the Void Collective',
        type: 'interact',
        requirement: { voidConfronted: true }
      },
      {
        id: 'choose-future',
        description: 'Decide the fate of the galaxy',
        type: 'interact',
        requirement: { finalChoiceMade: true }
      }
    ],
    rewards: {
      xp: 5000,
      storyProgress: 100,
      unlocks: ['galactic-developer', 'new-game-plus', 'endless-mode', 'multiplayer'],
      nextMission: undefined // Story complete!
    },
    characters: [
      {
        name: 'Codex (Pixel)',
        role: 'First Developer',
        dialogue: [
          "You've surpassed us all, Commander.",
          "The Ancients would be proud.",
          "I'm proud.",
          "Now go. The universe awaits your code."
        ]
      },
      {
        name: 'The True Ancients',
        role: 'Galactic Council',
        dialogue: [
          "Welcome, CodeCraft Developer.",
          "You have passed the trial that has defeated thousands.",
          "The galaxy needs developers like you.",
          "Will you join us in teaching the next generation?"
        ]
      }
    ]
  }
];

// Helper functions
export function getMissionById(id: string): StoryMission | undefined {
  return STORY_MISSIONS.find(m => m.id === id);
}

export function getMissionsByChapter(chapter: number): StoryMission[] {
  return STORY_MISSIONS.filter(m => m.chapter === chapter);
}

export function getNextMission(currentMissionId: string): StoryMission | null {
  const current = getMissionById(currentMissionId);
  if (!current || !current.rewards.nextMission) return null;
  return getMissionById(current.rewards.nextMission) || null;
}

export function calculateStoryProgress(completedMissions: string[]): number {
  return completedMissions.reduce((total, missionId) => {
    const mission = getMissionById(missionId);
    return total + (mission?.rewards.storyProgress || 0);
  }, 0);
}

