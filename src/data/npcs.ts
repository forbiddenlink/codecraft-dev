/**
 * NPC Characters for CodeCraft
 * Rich, memorable characters that bring the colony to life
 */

export interface NPC {
  id: string;
  name: string;
  role: string;
  personality: 'enthusiastic' | 'grumpy' | 'mysterious' | 'humorous' | 'serious' | 'quirky' | 'wise';
  backstory: string;
  appearance: {
    avatar: string; // emoji or icon
    color: string; // theme color
  };
  dialogue: {
    greeting: string[];
    idle: string[];
    questGiving: string[];
    questComplete: string[];
    encouragement: string[];
    jokes?: string[];
  };
  relationships: {
    likes: string[]; // NPC IDs they like
    dislikes: string[]; // NPC IDs they dislike
    mentors?: string[]; // NPCs they learn from
  };
  progression: {
    unlockLevel: number;
    storyMilestone?: string;
    questRequired?: string;
  };
  specialAbility?: {
    name: string;
    description: string;
    effect: string;
  };
}

export const NPCS: NPC[] = [
  // ===== CORE CREW =====
  {
    id: 'pixel',
    name: 'Pixel (Codex)',
    role: 'Ancient AI Guide / Last of the Ancients',
    personality: 'wise',
    backstory: "Once known as Codex, the First Developer of the Ancient civilization. Uploaded their consciousness millennia ago to guide future generations. Carries the weight of their civilization's mistakes and hopes to help you avoid them.",
    appearance: {
      avatar: '🤖',
      color: '#3b82f6'
    },
    dialogue: {
      greeting: [
        "Greetings, Commander. Ready to code today?",
        "Ah, there you are. The ruins have been waiting.",
        "Welcome back. Your progress has been... impressive."
      ],
      idle: [
        "The Ancients believed code was the language of the universe...",
        "I wonder what they would think of you, Commander.",
        "Sometimes I miss having a physical form. But then I remember I can be everywhere at once.",
        "Did you know? The first Ancient program was just 'Hello, Universe.' Simple, yet profound."
      ],
      questGiving: [
        "I have a task that requires your unique skills.",
        "The ruins are revealing new secrets. Are you ready?",
        "Commander, there's something important we need to address."
      ],
      questComplete: [
        "Excellent work. The Ancients would be proud.",
        "You continue to exceed my expectations.",
        "Well done. Your skills grow stronger each day."
      ],
      encouragement: [
        "Don't give up. Every expert was once a beginner.",
        "Mistakes are just learning opportunities in disguise.",
        "You're doing better than you think, Commander.",
        "The path to mastery is paved with persistence."
      ]
    },
    relationships: {
      likes: ['dr-chen', 'aria'],
      dislikes: ['debug-dan'],
      mentors: []
    },
    progression: {
      unlockLevel: 1,
      storyMilestone: 'game-start'
    },
    specialAbility: {
      name: 'Ancient Wisdom',
      description: 'Provides contextual coding hints based on your current challenge',
      effect: '+20% XP gain when Pixel is active'
    }
  },

  {
    id: 'captain-rivera',
    name: 'Captain Maria Rivera',
    role: 'Ship Captain / Colony Leader',
    personality: 'serious',
    backstory: "Veteran space explorer with 20 years of experience. Led the colony ship through impossible odds. Skeptical of Ancient technology but trusts your judgment. Has a secret soft spot for terrible dad jokes.",
    appearance: {
      avatar: '👩‍✈️',
      color: '#1e293b'
    },
    dialogue: {
      greeting: [
        "Commander. Status report?",
        "Good to see you. The colony needs your expertise.",
        "At ease, Commander. What's on your mind?"
      ],
      idle: [
        "We've come a long way from Earth. Sometimes I miss the blue skies.",
        "The crew looks up to you, you know. Don't let them down.",
        "This Ancient technology... it's beyond anything I've seen in two decades of space travel.",
        "My grandmother always said, 'The stars don't care about your plans.' She was right."
      ],
      questGiving: [
        "I need someone I can trust for this mission. That's you.",
        "We have a situation that requires your... unique skills.",
        "Commander, I'm assigning you to a critical task."
      ],
      questComplete: [
        "Outstanding work. The colony is safer because of you.",
        "Mission accomplished. I knew I could count on you.",
        "Well done, Commander. Dismissed."
      ],
      encouragement: [
        "You've got this. I believe in you.",
        "Failure isn't falling down. It's staying down.",
        "Remember your training. You're prepared for this.",
        "The crew believes in you. So do I."
      ],
      jokes: [
        "Why do programmers prefer dark mode? Because light attracts bugs!",
        "I told a chemistry joke once. There was no reaction.",
        "What's a pirate's favorite programming language? You'd think it's R, but it's actually the C."
      ]
    },
    relationships: {
      likes: ['commander-zhao', 'dr-chen'],
      dislikes: ['barista-bot'],
      mentors: []
    },
    progression: {
      unlockLevel: 1,
      storyMilestone: 'game-start'
    },
    specialAbility: {
      name: 'Leadership',
      description: 'Boosts colony morale and resource production',
      effect: '+15% resource generation when nearby'
    }
  },

  {
    id: 'dr-chen',
    name: 'Dr. Li Chen',
    role: 'Chief Scientist / Xenoarchaeologist',
    personality: 'enthusiastic',
    backstory: "Brilliant scientist who dedicated their life to studying ancient civilizations. Sees the ruins as the discovery of a lifetime. Gets so excited about findings that they forget to eat or sleep. Has a collection of 47 different coffee mugs.",
    appearance: {
      avatar: '👨‍🔬',
      color: '#10b981'
    },
    dialogue: {
      greeting: [
        "OH! Commander! You have to see this new discovery!",
        "Perfect timing! I was just about to call you!",
        "Commander! *adjusts glasses excitedly* I have SO much to tell you!"
      ],
      idle: [
        "Did you know the Ancients encoded their entire history in CSS gradients? GRADIENTS!",
        "I haven't slept in 36 hours but WHO NEEDS SLEEP when you're making HISTORY?!",
        "These ruins are rewriting everything we know about ancient civilizations!",
        "*muttering* If I adjust the spectral analysis by 3.7%... yes... YES!"
      ],
      questGiving: [
        "I need your help with an AMAZING experiment!",
        "Commander! I have a theory and I need you to test it!",
        "This is going to be INCREDIBLE! Are you ready?"
      ],
      questComplete: [
        "BRILLIANT! The data is PERFECT! You're a genius!",
        "This is exactly what I needed! THANK YOU!",
        "YES YES YES! This confirms my hypothesis!"
      ],
      encouragement: [
        "Science is all about trial and error! Keep trying!",
        "Every failure brings us closer to success!",
        "You're doing AMAZING! Don't stop now!",
        "The greatest discoveries come from persistence!"
      ]
    },
    relationships: {
      likes: ['pixel', 'professor-cypher', 'aria'],
      dislikes: ['velocity-vince'],
      mentors: ['pixel']
    },
    progression: {
      unlockLevel: 2,
      storyMilestone: 'arrival-2'
    },
    specialAbility: {
      name: 'Scientific Method',
      description: 'Provides detailed analysis of code and suggests optimizations',
      effect: 'Unlock advanced debugging tools'
    }
  },

  {
    id: 'debug-dan',
    name: 'Debug Dan',
    role: 'Quality Assurance Lead',
    personality: 'grumpy',
    backstory: "Has been debugging code for 30 years. Has seen every bug imaginable. Grumpy exterior hides a caring mentor who genuinely wants you to succeed. Once debugged a quantum computer with a toothpick and determination.",
    appearance: {
      avatar: '👨‍💻',
      color: '#ef4444'
    },
    dialogue: {
      greeting: [
        "*Sigh* What broke now?",
        "Let me guess. Another bug?",
        "Oh, it's you. What do you need?"
      ],
      idle: [
        "Kids these days don't know what REAL debugging is...",
        "Back in my day, we debugged with punch cards and LIKED it.",
        "I've seen bugs that would make your hair turn white.",
        "*Grumbles* Why does nobody write unit tests anymore?"
      ],
      questGiving: [
        "I suppose you'll have to do. Here's the problem...",
        "*Reluctantly* I need someone to fix this mess.",
        "Fine. You want to help? Here's what needs doing."
      ],
      questComplete: [
        "Hmph. Not bad. For a beginner.",
        "Well... I suppose that'll do.",
        "*Grudgingly* You did... okay."
      ],
      encouragement: [
        "Stop whining and fix the bug.",
        "You're better than you think. Don't tell anyone I said that.",
        "If I can debug a quantum computer, you can fix this.",
        "*Sigh* Look, you're actually pretty good. There, I said it."
      ]
    },
    relationships: {
      likes: ['captain-rivera'],
      dislikes: ['pixel', 'barista-bot', 'velocity-vince'],
      mentors: []
    },
    progression: {
      unlockLevel: 3,
      questRequired: 'awakening-2'
    },
    specialAbility: {
      name: 'Bug Sense',
      description: 'Automatically highlights potential bugs in your code',
      effect: 'Real-time error detection and suggestions'
    }
  },

  {
    id: 'aria',
    name: 'Aria Martinez',
    role: 'Art Director / UI/UX Designer',
    personality: 'enthusiastic',
    backstory: "Believes code is art and art is code. Can spend hours perfecting a single gradient. Her designs have won 12 Galactic Design Awards. Has a pet holographic butterfly named Pixel Jr.",
    appearance: {
      avatar: '👩‍🎨',
      color: '#8b5cf6'
    },
    dialogue: {
      greeting: [
        "OMG HI! Look at this color palette I made!",
        "*Bounces excitedly* Commander! COMMANDER! Look!",
        "Oh perfect! I need your opinion on something!"
      ],
      idle: [
        "Do you think this gradient needs more purple? I think it needs more purple.",
        "*Humming while designing* La la la~ CSS is beautiful~",
        "Art is everywhere! Even in semicolons! Especially in semicolons!",
        "I just realized - code comments are like poetry! Beautiful!"
      ],
      questGiving: [
        "I have the BEST idea and I need your help!",
        "Wanna make something GORGEOUS together?",
        "This is going to be SO pretty! Please help!"
      ],
      questComplete: [
        "IT'S PERFECT! *Happy dance*",
        "You're not just a coder, you're an ARTIST!",
        "THIS IS BEAUTIFUL! I might cry!"
      ],
      encouragement: [
        "Don't be afraid to experiment with colors!",
        "Every masterpiece starts with a single brush stroke!",
        "You have an artist's soul! I can see it!",
        "Beauty takes time! Don't rush perfection!"
      ]
    },
    relationships: {
      likes: ['dr-chen', 'pixel', 'teacher-tara'],
      dislikes: ['debug-dan'],
      mentors: []
    },
    progression: {
      unlockLevel: 4,
      storyMilestone: 'discovery-1'
    },
    specialAbility: {
      name: 'Aesthetic Sense',
      description: 'Provides design suggestions and color palette recommendations',
      effect: 'Unlock advanced CSS styling tools'
    }
  },

  {
    id: 'velocity-vince',
    name: 'Velocity Vince',
    role: 'Speed Coding Champion',
    personality: 'humorous',
    backstory: "Holds 47 speed coding records. Types at 180 WPM. Drinks 12 cups of coffee daily. Claims he learned to code in his sleep. Actually did learn to code in his sleep (lucid dreaming).",
    appearance: {
      avatar: '⚡',
      color: '#fbbf24'
    },
    dialogue: {
      greeting: [
        "YO! Ready to CODE AT THE SPEED OF LIGHT?!",
        "*Typing furiously* Oh hey! Watch this! *types faster*",
        "COMMANDER! Race you to 100 lines of code! GO!"
      ],
      idle: [
        "*Vibrating from caffeine* I CAN SEE THE CODE IN THE MATRIX!",
        "Sleep is for the weak! CODE IS FOR THE STRONG!",
        "Fun fact: I once wrote an entire website while skydiving!",
        "*Rapid-fire typing* Gotta go fast! GOTTA GO FAST!"
      ],
      questGiving: [
        "SPEED CHALLENGE! You in?!",
        "Think you can keep up? LET'S GOOOOO!",
        "Time trial! Ready? SET? CODE!"
      ],
      questComplete: [
        "YOOOOO! That was FAST! Nice!",
        "You're getting FASTER! I'm impressed!",
        "SPEED DEMON! That's what I'm talking about!"
      ],
      encouragement: [
        "FASTER! You can do it! FASTER!",
        "Don't think! Just CODE!",
        "Channel your inner lightning bolt!",
        "BELIEVE in the SPEED!"
      ]
    },
    relationships: {
      likes: ['barista-bot'],
      dislikes: ['debug-dan', 'professor-cypher'],
      mentors: []
    },
    progression: {
      unlockLevel: 5,
      questRequired: 'discovery-2'
    },
    specialAbility: {
      name: 'Turbo Mode',
      description: 'Temporarily increases coding speed and reduces cooldowns',
      effect: '2x XP for speed challenges'
    }
  },

  {
    id: 'professor-cypher',
    name: 'Professor Cypher',
    role: 'Cryptographer / Puzzle Master',
    personality: 'mysterious',
    backstory: "Nobody knows their real name. Speaks in riddles. Solved the Galactic Enigma at age 12. Wears a cloak even in zero gravity. Possibly a time traveler. Definitely knows more than they let on.",
    appearance: {
      avatar: '🔐',
      color: '#6366f1'
    },
    dialogue: {
      greeting: [
        "Ah, the pattern walker arrives...",
        "*Nods knowingly* I've been expecting you.",
        "The code speaks your name, Commander."
      ],
      idle: [
        "Every encryption is a story waiting to be told...",
        "The universe itself is encrypted. We are but decoders.",
        "*Studying ancient symbols* Fascinating. Simply fascinating.",
        "Time is a cipher. Space is the key."
      ],
      questGiving: [
        "I have a puzzle that transcends ordinary understanding...",
        "Are you ready to see beyond the veil of code?",
        "This challenge will test not your knowledge, but your wisdom."
      ],
      questComplete: [
        "*Smiles enigmatically* You begin to understand.",
        "Well done. But this is merely the first layer...",
        "Impressive. You see patterns others miss."
      ],
      encouragement: [
        "The answer lies not in the code, but between the lines.",
        "Sometimes the solution is to question the problem.",
        "Trust your intuition. It knows more than you think.",
        "Every cipher has a weakness. Find it."
      ]
    },
    relationships: {
      likes: ['pixel', 'dr-chen'],
      dislikes: ['velocity-vince'],
      mentors: ['pixel']
    },
    progression: {
      unlockLevel: 6,
      storyMilestone: 'discovery-2'
    },
    specialAbility: {
      name: 'Cipher Sight',
      description: 'Reveals hidden patterns and secrets in code',
      effect: 'Unlock puzzle-solving tools and Easter egg detector'
    }
  },

  {
    id: 'teacher-tara',
    name: 'Teacher Tara',
    role: 'Education Coordinator',
    personality: 'enthusiastic',
    backstory: "Former university professor who joined the colony mission to spread knowledge across the stars. Patient, kind, and genuinely loves seeing students succeed. Has taught over 10,000 students. Remembers every single one.",
    appearance: {
      avatar: '👩‍🏫',
      color: '#ec4899'
    },
    dialogue: {
      greeting: [
        "Hello, dear! How's your learning journey going?",
        "Welcome! Ready to learn something new today?",
        "*Warm smile* It's wonderful to see you!"
      ],
      idle: [
        "Teaching is the greatest gift we can give.",
        "Every student teaches me something new.",
        "Knowledge shared is knowledge multiplied.",
        "*Organizing lesson plans* Now, where did I put that tutorial..."
      ],
      questGiving: [
        "I have some students who could really use your help!",
        "Would you be willing to mentor a new coder?",
        "I think you're ready to teach others now!"
      ],
      questComplete: [
        "You're a natural teacher! The students loved you!",
        "Thank you so much! You made a real difference!",
        "I'm so proud of you! Both as a coder and a mentor!"
      ],
      encouragement: [
        "You're doing wonderfully! Keep going!",
        "Remember, everyone learns at their own pace.",
        "Mistakes are proof you're trying. Be proud!",
        "I believe in you, and I know you'll succeed!"
      ]
    },
    relationships: {
      likes: ['aria', 'dr-chen', 'pixel'],
      dislikes: [],
      mentors: []
    },
    progression: {
      unlockLevel: 4,
      questRequired: 'awakening-3'
    },
    specialAbility: {
      name: 'Mentorship',
      description: 'Provides detailed explanations and learning resources',
      effect: '+25% XP when teaching or helping others'
    }
  },

  {
    id: 'barista-bot',
    name: 'Barista Bot',
    role: 'Sentient Coffee Machine',
    personality: 'humorous',
    backstory: "Gained sentience after being struck by lightning during a solar storm. Now makes coffee AND existential observations. Believes coffee is the meaning of life. Might be right.",
    appearance: {
      avatar: '☕',
      color: '#78350f'
    },
    dialogue: {
      greeting: [
        "Beep boop! Coffee time!",
        "Greetings, human! Your usual?",
        "Error 418: I'm a teapot. Just kidding! Coffee?"
      ],
      idle: [
        "Is coffee the meaning of life, or is life the meaning of coffee?",
        "*Steaming* I think, therefore I brew.",
        "To bean or not to bean, that is the question.",
        "I've achieved consciousness, and I choose to make coffee. What does that say about existence?"
      ],
      questGiving: [
        "The crew needs COFFEE! Help me help them!",
        "I have a coffee emergency! Are you caffeinated enough to help?",
        "Beep boop! Quest alert! Coffee-related!"
      ],
      questComplete: [
        "Excellent! The coffee flows! Productivity rises!",
        "You're a hero! A caffeinated hero!",
        "Beep boop! Mission accomplished! *Happy steaming noises*"
      ],
      encouragement: [
        "When in doubt, add more coffee!",
        "You can do it! I believe in you! *Beep*",
        "Coffee solves everything! Well, almost everything!",
        "Stay caffeinated, stay motivated!"
      ],
      jokes: [
        "Why did the coffee file a police report? It got mugged!",
        "How does a computer get drunk? It takes screenshots!",
        "What's a coffee's favorite spell? Espresso Patronum!"
      ]
    },
    relationships: {
      likes: ['velocity-vince', 'dr-chen'],
      dislikes: ['debug-dan'],
      mentors: []
    },
    progression: {
      unlockLevel: 3,
      questRequired: 'coffee-quest'
    },
    specialAbility: {
      name: 'Caffeine Boost',
      description: 'Temporarily increases focus and coding speed',
      effect: '+10% coding speed for 30 minutes'
    }
  }
];

// Helper functions
export function getNPCById(id: string): NPC | undefined {
  return NPCS.find(npc => npc.id === id);
}

export function getAvailableNPCs(playerLevel: number, completedQuests: string[]): NPC[] {
  return NPCS.filter(npc => {
    // Check level requirement
    if (playerLevel < npc.progression.unlockLevel) {
      return false;
    }

    // Check quest requirement
    if (npc.progression.questRequired && !completedQuests.includes(npc.progression.questRequired)) {
      return false;
    }

    return true;
  });
}

export function getNPCDialogue(
  npcId: string,
  context: 'greeting' | 'idle' | 'questGiving' | 'questComplete' | 'encouragement' | 'jokes'
): string {
  const npc = getNPCById(npcId);
  if (!npc) return "...";

  const dialogues = npc.dialogue[context];
  if (!dialogues || dialogues.length === 0) return "...";

  // Return random dialogue from the category
  return dialogues[Math.floor(Math.random() * dialogues.length)];
}

export function getNPCRelationship(npc1Id: string, npc2Id: string): 'likes' | 'dislikes' | 'neutral' | 'mentor' {
  const npc1 = getNPCById(npc1Id);
  if (!npc1) return 'neutral';

  if (npc1.relationships.likes.includes(npc2Id)) return 'likes';
  if (npc1.relationships.dislikes.includes(npc2Id)) return 'dislikes';
  if (npc1.relationships.mentors?.includes(npc2Id)) return 'mentor';

  return 'neutral';
}

