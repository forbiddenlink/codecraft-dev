/**
 * Example Dialogue Trees
 * Sample conversations for NPCs in CodeCraft
 */

import type { DialogueTree, DialogueNode } from '@/utils/dialogueSystem';

/**
 * Tutorial Guide - First Meeting
 */
export const tutorialGuideIntro: DialogueTree = {
  id: 'tutorial_guide_intro',
  npcId: 'tutorial_guide',
  title: 'First Meeting with Guide',
  startNodeId: 'intro_1',
  priority: 100,
  nodes: new Map<string, DialogueNode>([
    [
      'intro_1',
      {
        id: 'intro_1',
        speaker: 'Tutorial Guide',
        text: "Welcome to CodeCraft, young developer! I've been waiting for someone with your potential. Are you ready to begin your journey into the world of web development?",
        emotion: 'excited',
        choices: [
          {
            id: 'eager',
            text: "Yes! I'm excited to learn!",
            nextNodeId: 'intro_eager',
          },
          {
            id: 'nervous',
            text: "I'm a bit nervous, but I'll try my best.",
            nextNodeId: 'intro_nervous',
          },
          {
            id: 'skip',
            text: 'I already know the basics. Can we skip ahead?',
            nextNodeId: 'intro_skip',
            conditions: [
              {
                type: 'levelGreaterThan',
                param: 3,
              },
            ],
            requirementText: 'Reach level 4',
          },
        ],
      },
    ],
    [
      'intro_eager',
      {
        id: 'intro_eager',
        speaker: 'Tutorial Guide',
        text: "Excellent attitude! That enthusiasm will serve you well. Let me start by explaining the three pillars of web development: HTML for structure, CSS for style, and JavaScript for interactivity.",
        emotion: 'happy',
        next: 'explain_basics',
      },
    ],
    [
      'intro_nervous',
      {
        id: 'intro_nervous',
        speaker: 'Tutorial Guide',
        text: "Don't worry at all! Everyone starts somewhere, and I'll be here to guide you every step of the way. We'll take it nice and slow. Remember, every expert was once a beginner.",
        emotion: 'happy',
        next: 'explain_basics',
        effects: [
          {
            type: 'giveXP',
            param: 10,
          },
        ],
      },
    ],
    [
      'intro_skip',
      {
        id: 'intro_skip',
        speaker: 'Tutorial Guide',
        text: "Impressive! I can see you've already got a foundation. In that case, let me show you some advanced techniques that will really level up your skills.",
        emotion: 'proud',
        next: null,
        effects: [
          {
            type: 'unlockChallenge',
            param: 'advanced_challenges',
          },
        ],
      },
    ],
    [
      'explain_basics',
      {
        id: 'explain_basics',
        speaker: 'Tutorial Guide',
        text: "HTML is like the skeleton of a webpage - it provides the structure. CSS is the clothing and makeup - it makes things look beautiful. And JavaScript is the muscles and brain - it makes things move and think!",
        emotion: 'neutral',
        choices: [
          {
            id: 'understand',
            text: 'That makes sense! What should I learn first?',
            nextNodeId: 'first_challenge',
          },
          {
            id: 'analogy',
            text: 'Great analogy! Can you give me a practical example?',
            nextNodeId: 'practical_example',
          },
        ],
      },
    ],
    [
      'practical_example',
      {
        id: 'practical_example',
        speaker: 'Tutorial Guide',
        text: 'Sure! Imagine building a house. HTML is the walls and rooms. CSS is the paint, furniture, and decorations. JavaScript is the electricity that powers the lights and appliances. Together, they create a complete, functional, beautiful space!',
        emotion: 'excited',
        next: 'first_challenge',
      },
    ],
    [
      'first_challenge',
      {
        id: 'first_challenge',
        speaker: 'Tutorial Guide',
        text: "Perfect! Let's start with your first challenge. I'll teach you the basics of HTML. Complete it, and you'll earn your first achievement and some resources to build your colony!",
        emotion: 'happy',
        next: null,
        effects: [
          {
            type: 'giveQuest',
            param: 'first_html_challenge',
          },
          {
            type: 'giveXP',
            param: 50,
          },
        ],
      },
    ],
  ]),
};

/**
 * Resource Manager - Trading Dialogue
 */
export const resourceManagerTrade: DialogueTree = {
  id: 'resource_manager_trade',
  npcId: 'resource_manager',
  title: 'Resource Trading',
  startNodeId: 'trade_greeting',
  priority: 50,
  nodes: new Map<string, DialogueNode>([
    [
      'trade_greeting',
      {
        id: 'trade_greeting',
        speaker: 'Resource Manager',
        text: "Ah, a fellow builder! I manage the colony's resources. Every challenge you complete earns materials that help us grow. What brings you to my workshop today?",
        emotion: 'happy',
        choices: [
          {
            id: 'trade',
            text: 'I want to trade resources',
            nextNodeId: 'trade_options',
          },
          {
            id: 'info',
            text: 'Tell me about the different resources',
            nextNodeId: 'resource_info',
          },
          {
            id: 'upgrade',
            text: 'Can I upgrade my buildings?',
            nextNodeId: 'building_upgrade',
            conditions: [
              {
                type: 'hasItem',
                param: 'minerals',
                operator: '>=',
                value: 100,
              },
            ],
            requirementText: 'Need 100 minerals',
          },
        ],
      },
    ],
    [
      'resource_info',
      {
        id: 'resource_info',
        speaker: 'Resource Manager',
        text: 'We have four main resources: Energy powers our systems, Minerals build structures, Water sustains life, and Food keeps everyone happy. Balance them wisely!',
        emotion: 'neutral',
        next: 'trade_greeting',
      },
    ],
    [
      'trade_options',
      {
        id: 'trade_options',
        speaker: 'Resource Manager',
        text: 'I can trade 50 minerals for 100 energy, or 30 water for 50 food. Fair deals for a hardworking coder like yourself!',
        emotion: 'happy',
        choices: [
          {
            id: 'trade_energy',
            text: 'Trade minerals for energy (50 → 100)',
            nextNodeId: 'trade_complete',
            conditions: [
              {
                type: 'hasItem',
                param: 'minerals',
                operator: '>=',
                value: 50,
              },
            ],
            effects: [
              {
                type: 'giveResources',
                param: 'minerals',
                value: -50,
              },
              {
                type: 'giveResources',
                param: 'energy',
                value: 100,
              },
            ],
            requirementText: 'Need 50 minerals',
          },
          {
            id: 'trade_food',
            text: 'Trade water for food (30 → 50)',
            nextNodeId: 'trade_complete',
            conditions: [
              {
                type: 'hasItem',
                param: 'water',
                operator: '>=',
                value: 30,
              },
            ],
            effects: [
              {
                type: 'giveResources',
                param: 'water',
                value: -30,
              },
              {
                type: 'giveResources',
                param: 'food',
                value: 50,
              },
            ],
            requirementText: 'Need 30 water',
          },
          {
            id: 'cancel',
            text: 'Maybe later',
            nextNodeId: null,
          },
        ],
      },
    ],
    [
      'trade_complete',
      {
        id: 'trade_complete',
        speaker: 'Resource Manager',
        text: 'Excellent trade! Your resources have been updated. Come back anytime you need to balance your supplies!',
        emotion: 'happy',
        next: null,
      },
    ],
    [
      'building_upgrade',
      {
        id: 'building_upgrade',
        speaker: 'Resource Manager',
        text: "You've gathered enough materials! I can upgrade your Code Laboratory to increase energy production by 50%. This will help you tackle harder challenges!",
        emotion: 'excited',
        choices: [
          {
            id: 'confirm_upgrade',
            text: 'Yes, upgrade my laboratory! (100 minerals)',
            nextNodeId: 'upgrade_complete',
            effects: [
              {
                type: 'giveResources',
                param: 'minerals',
                value: -100,
              },
              {
                type: 'setFlag',
                param: 'lab_upgraded',
              },
            ],
          },
          {
            id: 'decline_upgrade',
            text: 'Not right now',
            nextNodeId: null,
          },
        ],
      },
    ],
    [
      'upgrade_complete',
      {
        id: 'upgrade_complete',
        speaker: 'Resource Manager',
        text: 'Upgrade complete! Your laboratory is now more efficient. Keep improving, and your colony will thrive!',
        emotion: 'proud',
        next: null,
        effects: [
          {
            type: 'giveXP',
            param: 200,
          },
        ],
      },
    ],
  ]),
};

/**
 * Skill Master - Advanced Training
 */
export const skillMasterAdvanced: DialogueTree = {
  id: 'skill_master_advanced',
  npcId: 'skill_master',
  title: 'Advanced Training',
  startNodeId: 'master_greeting',
  priority: 75,
  nodes: new Map<string, DialogueNode>([
    [
      'master_greeting',
      {
        id: 'master_greeting',
        speaker: 'Skill Master',
        text: "I sense great potential in you, developer. You've mastered the basics, but are you ready to unlock true mastery?",
        emotion: 'neutral',
        conditions: [
          {
            type: 'levelGreaterThan',
            param: 5,
          },
        ],
        choices: [
          {
            id: 'ready',
            text: 'I am ready for advanced training!',
            nextNodeId: 'choose_specialization',
          },
          {
            id: 'not_ready',
            text: 'What do I need to prepare?',
            nextNodeId: 'requirements',
          },
        ],
      },
    ],
    [
      'requirements',
      {
        id: 'requirements',
        speaker: 'Skill Master',
        text: 'Advanced training requires dedication. Complete 10 perfect challenges, and prove your foundation is solid. Only then can we begin.',
        emotion: 'neutral',
        next: null,
      },
    ],
    [
      'choose_specialization',
      {
        id: 'choose_specialization',
        speaker: 'Skill Master',
        text: 'Excellent! Choose your path: become a CSS Artist mastering visual design, or a JavaScript Architect building complex interactivity.',
        emotion: 'excited',
        choices: [
          {
            id: 'css_artist',
            text: 'CSS Artist - Master of Visual Design',
            nextNodeId: 'css_path',
          },
          {
            id: 'js_architect',
            text: 'JavaScript Architect - Builder of Logic',
            nextNodeId: 'js_path',
          },
        ],
      },
    ],
    [
      'css_path',
      {
        id: 'css_path',
        speaker: 'Skill Master',
        text: 'The path of the CSS Artist! You will learn animations, responsive design, and advanced layouts. Your creations will be beautiful and functional!',
        emotion: 'proud',
        next: null,
        effects: [
          {
            type: 'setFlag',
            param: 'css_specialization',
          },
          {
            type: 'unlockChallenge',
            param: 'advanced_css',
          },
          {
            type: 'giveXP',
            param: 500,
          },
        ],
      },
    ],
    [
      'js_path',
      {
        id: 'js_path',
        speaker: 'Skill Master',
        text: 'The path of the JavaScript Architect! You will master algorithms, async programming, and complex state management. Your code will be powerful and elegant!',
        emotion: 'proud',
        next: null,
        effects: [
          {
            type: 'setFlag',
            param: 'js_specialization',
          },
          {
            type: 'unlockChallenge',
            param: 'advanced_javascript',
          },
          {
            type: 'giveXP',
            param: 500,
          },
        ],
      },
    ],
  ]),
};

// Export all dialogue trees
export const allDialogueTrees = [
  tutorialGuideIntro,
  resourceManagerTrade,
  skillMasterAdvanced,
];
