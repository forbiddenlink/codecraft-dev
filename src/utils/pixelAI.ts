/**
 * Pixel AI - Intelligent Companion System
 * Provides contextual help, encouragement, and personality
 */

export type PixelMood = 'excited' | 'curious' | 'happy' | 'concerned' | 'proud' | 'thoughtful' | 'encouraging';

export interface PixelDialogue {
  message: string;
  mood: PixelMood;
  emotion?: string; // emoji or icon
  priority?: 'low' | 'medium' | 'high';
}

export interface GameContext {
  currentChallenge?: {
    id: string;
    title: string;
    difficulty: number;
    attempts?: number;
  };
  codeState: {
    html: string;
    css: string;
    javascript: string;
    errors: any[];
    lastModified: 'html' | 'css' | 'javascript' | null;
  };
  playerProgress: {
    challengesCompleted: number;
    totalChallenges: number;
    xp: number;
    level: number;
  };
  colonyState: {
    resources: Record<string, number>;
    buildings: number;
    villagers: number;
  };
  timeInChallenge: number; // seconds
  recentAchievements: string[];
}

export class PixelAI {
  private lastDialogue: PixelDialogue | null = null;
  private dialogueHistory: PixelDialogue[] = [];
  private personalityTraits = {
    helpfulness: 0.9,
    enthusiasm: 0.8,
    patience: 0.95,
    humor: 0.6
  };

  /**
   * Get contextual dialogue based on current game state
   */
  getContextualDialogue(context: GameContext): PixelDialogue {
    // Check for errors first (highest priority)
    if (context.codeState.errors.length > 0) {
      return this.getErrorGuidance(context);
    }

    // Check for recent achievements
    if (context.recentAchievements.length > 0) {
      return this.getCelebration(context);
    }

    // Check if player is stuck
    if (context.timeInChallenge > 300 && context.currentChallenge) { // 5 minutes
      return this.getEncouragement(context);
    }

    // Check for code progress
    if (context.codeState.lastModified) {
      return this.getCodeFeedback(context);
    }

    // Check for low resources
    const lowResources = Object.entries(context.colonyState.resources)
      .filter(([_, amount]) => amount < 50);
    if (lowResources.length > 0) {
      return this.getResourceAdvice(context);
    }

    // Default: provide helpful tips
    return this.getGeneralTip(context);
  }

  /**
   * Provide error guidance with empathy
   */
  private getErrorGuidance(context: GameContext): PixelDialogue {
    const error = context.codeState.errors[0];
    const errorType = this.categorizeError(error);

    const messages: Record<string, string[]> = {
      syntax: [
        "Oops! Looks like there's a small syntax error. Let's fix it together! 🔍",
        "No worries, Commander! Syntax errors are super common. Let me help you spot it.",
        "I see a syntax hiccup. These happen to the best of us! Let's debug this.",
      ],
      missing_tag: [
        "Hmm, I think we're missing a closing tag somewhere. HTML tags always come in pairs! 🏷️",
        "Let's check those tags - every opening tag needs a closing friend!",
        "Tag check! Make sure all your HTML elements are properly closed.",
      ],
      css_property: [
        "The CSS property looks a bit off. Let's double-check the syntax! 🎨",
        "CSS can be tricky! Let's make sure that property is spelled correctly.",
        "I see a CSS issue. Don't worry, we'll get your styles looking perfect!",
      ],
      javascript: [
        "JavaScript error detected! Let's trace through the logic together. 💡",
        "No problem! JavaScript errors are learning opportunities. Let's fix this!",
        "I found a JS issue. Take a deep breath - we'll solve this step by step.",
      ]
    };

    const messageList = messages[errorType] || messages.syntax;
    const message = messageList[Math.floor(Math.random() * messageList.length)];

    return {
      message: `${message}\n\n💬 ${error.message}`,
      mood: 'concerned',
      emotion: '🤔',
      priority: 'high'
    };
  }

  /**
   * Celebrate achievements with enthusiasm
   */
  private getCelebration(context: GameContext): PixelDialogue {
    const achievement = context.recentAchievements[0];
    
    const celebrations = [
      `🎉 AMAZING! You just unlocked "${achievement}"! You're becoming a true CodeCraft master!`,
      `⭐ WOW! "${achievement}" achieved! The colony is thriving thanks to you!`,
      `🚀 INCREDIBLE! You've earned "${achievement}"! Your skills are really shining!`,
      `✨ FANTASTIC! "${achievement}" is yours! The ancients would be impressed!`,
      `🏆 OUTSTANDING! You've achieved "${achievement}"! Keep up the brilliant work!`
    ];

    return {
      message: celebrations[Math.floor(Math.random() * celebrations.length)],
      mood: 'excited',
      emotion: '🎊',
      priority: 'high'
    };
  }

  /**
   * Provide encouragement when player is stuck
   */
  private getEncouragement(context: GameContext): PixelDialogue {
    const difficulty = context.currentChallenge?.difficulty || 1;
    
    const encouragements = [
      "You're doing great, Commander! Sometimes the best solutions come after taking a short break. ☕",
      "This is a tough challenge, but I believe in you! Want a hint? Check the objectives again. 💪",
      "Every expert was once a beginner. You're learning and growing with each attempt! 🌱",
      "Stuck? That's okay! Try breaking the problem into smaller pieces. You've got this! 🧩",
      "Remember: coding is all about experimentation. Try something new and see what happens! 🔬",
      "The ancients faced challenges too. Persistence is the key to mastery! 🗝️"
    ];

    if (difficulty >= 4) {
      encouragements.push(
        "This is an advanced challenge! You're tackling some serious concepts here. 🎓",
        "Wow, you're working on tough stuff! Take your time and think it through. 🧠"
      );
    }

    return {
      message: encouragements[Math.floor(Math.random() * encouragements.length)],
      mood: 'encouraging',
      emotion: '💙',
      priority: 'medium'
    };
  }

  /**
   * Provide real-time code feedback
   */
  private getCodeFeedback(context: GameContext): PixelDialogue {
    const { lastModified, html, css, javascript } = context.codeState;

    const feedback: Record<string, string[]> = {
      html: [
        "Nice HTML structure! The semantic elements are looking good! 📝",
        "Great job on the markup! Your HTML is clean and organized. ✨",
        "I like how you're structuring this! Keep building! 🏗️",
        "Excellent use of HTML elements! The structure is coming together nicely. 👍"
      ],
      css: [
        "Those styles are looking sharp! The colony is getting more beautiful! 🎨",
        "Great CSS work! I love the colors you're choosing. 🌈",
        "Nice styling! Your design sense is really developing. ✨",
        "Wonderful CSS! The visual hierarchy is clear and appealing. 👌"
      ],
      javascript: [
        "That JavaScript logic is solid! You're thinking like a programmer! 💻",
        "Great code! Your JS skills are really improving. 🚀",
        "Nice function! The logic flow is clear and efficient. ⚡",
        "Excellent JavaScript! You're mastering interactivity. 🎯"
      ]
    };

    if (!lastModified) {
      return this.getGeneralTip(context);
    }

    const messages = feedback[lastModified];
    const message = messages[Math.floor(Math.random() * messages.length)];

    return {
      message,
      mood: 'happy',
      emotion: '😊',
      priority: 'low'
    };
  }

  /**
   * Provide resource management advice
   */
  private getResourceAdvice(context: GameContext): PixelDialogue {
    const lowResources = Object.entries(context.colonyState.resources)
      .filter(([_, amount]) => amount < 50)
      .map(([type]) => type);

    const resourceTips: Record<string, string> = {
      energy: "Energy levels are low! Try building more power generators or solar panels. ⚡",
      minerals: "We're running low on minerals! Set up some mining operations. ⛏️",
      water: "Water reserves are depleting! We need to establish water collectors. 💧",
      food: "Food supplies are low! Let's set up some hydroponic farms. 🌱"
    };

    const resource = lowResources[0];
    const tip = resourceTips[resource] || "Resource management is key to colony success!";

    return {
      message: `⚠️ ${tip}`,
      mood: 'concerned',
      emotion: '📊',
      priority: 'medium'
    };
  }

  /**
   * Provide general helpful tips
   */
  private getGeneralTip(context: GameContext): PixelDialogue {
    const tips = [
      "💡 Pro tip: Use semantic HTML elements like <header>, <nav>, and <section> for better structure!",
      "🎨 Design tip: Consistent spacing and colors make your colony look professional!",
      "⚡ Performance tip: Keep your code clean and organized for better maintainability!",
      "🔍 Debugging tip: Check the browser console for helpful error messages!",
      "📚 Learning tip: Don't just copy code - understand why it works!",
      "🎯 Challenge tip: Read the objectives carefully - they guide you to success!",
      "✨ Style tip: CSS Grid and Flexbox are your best friends for layouts!",
      "🚀 JavaScript tip: Functions help you organize and reuse code efficiently!",
      "🏗️ Architecture tip: Plan your structure before you start coding!",
      "💪 Growth tip: Every challenge you complete makes you a better developer!"
    ];

    // Add level-specific tips
    if (context.playerProgress.level < 3) {
      tips.push(
        "🌟 You're just getting started! Take your time and enjoy the learning process.",
        "📖 New to coding? That's perfect! Everyone starts somewhere, and you're doing great!"
      );
    } else if (context.playerProgress.level >= 5) {
      tips.push(
        "🎓 You're becoming quite skilled! Consider experimenting with advanced techniques.",
        "🏆 Impressive progress! You're well on your way to mastering web development."
      );
    }

    return {
      message: tips[Math.floor(Math.random() * tips.length)],
      mood: 'thoughtful',
      emotion: '🤖',
      priority: 'low'
    };
  }

  /**
   * Get a specific hint for the current challenge
   */
  getChallenggeHint(context: GameContext, hintLevel: number = 1): PixelDialogue {
    if (!context.currentChallenge) {
      return {
        message: "Start a challenge to get specific hints! 🎯",
        mood: 'curious',
        emotion: '📝'
      };
    }

    const hints = [
      "Let's start with the basics. Check the HTML template for guidance! 📝",
      "Look at the objectives - they tell you exactly what you need to do! 🎯",
      "Try tackling one objective at a time. Small steps lead to big success! 👣",
      "The CSS template has helpful comments. Read them carefully! 💡",
      "Remember: every opening tag needs a closing tag! 🏷️"
    ];

    return {
      message: hints[Math.min(hintLevel - 1, hints.length - 1)],
      mood: 'thoughtful',
      emotion: '💭',
      priority: 'high'
    };
  }

  /**
   * Get welcome message for new players
   */
  getWelcomeMessage(isFirstTime: boolean): PixelDialogue {
    if (isFirstTime) {
      return {
        message: "👋 Welcome to CodeCraft, Commander! I'm Pixel, your AI companion. Together, we'll build an amazing space colony while you learn to code! Ready for an adventure? 🚀",
        mood: 'excited',
        emotion: '✨',
        priority: 'high'
      };
    }

    return {
      message: "Welcome back, Commander! Ready to continue building your colony? Let's code! 💻",
      mood: 'happy',
      emotion: '😊',
      priority: 'medium'
    };
  }

  /**
   * Categorize error type
   */
  private categorizeError(error: any): string {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('tag') || message.includes('closing')) return 'missing_tag';
    if (message.includes('css') || message.includes('property')) return 'css_property';
    if (message.includes('javascript') || message.includes('function')) return 'javascript';
    
    return 'syntax';
  }

  /**
   * Store dialogue in history
   */
  private storeDialogue(dialogue: PixelDialogue): void {
    this.dialogueHistory.push(dialogue);
    this.lastDialogue = dialogue;
    
    // Keep only last 10 dialogues
    if (this.dialogueHistory.length > 10) {
      this.dialogueHistory.shift();
    }
  }

  /**
   * Get dialogue history
   */
  getHistory(): PixelDialogue[] {
    return [...this.dialogueHistory];
  }
}

// Export singleton instance
export const pixelAI = new PixelAI();

// Export helper function for easy use
export function getPixelDialogue(context: GameContext): PixelDialogue {
  return pixelAI.getContextualDialogue(context);
}

