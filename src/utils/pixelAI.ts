/**
 * Pixel AI - Intelligent Companion System
 * Provides contextual help, encouragement, and personality
 */

export type PixelMood =
  | 'excited'
  | 'curious'
  | 'happy'
  | 'concerned'
  | 'proud'
  | 'thoughtful'
  | 'encouraging'

export interface PixelDialogue {
  message: string
  mood: PixelMood
  priority?: 'low' | 'medium' | 'high'
}

export interface GameContext {
  currentChallenge?: {
    id: string
    title: string
    difficulty: number
    attempts?: number
  }
  codeState: {
    html: string
    css: string
    javascript: string
    errors: any[]
    lastModified: 'html' | 'css' | 'javascript' | null
  }
  playerProgress: {
    challengesCompleted: number
    totalChallenges: number
    xp: number
    level: number
  }
  colonyState: {
    resources: Record<string, number>
    buildings: number
    villagers: number
  }
  timeInChallenge: number // seconds
  recentAchievements: string[]
}

export class PixelAI {
  private lastDialogue: PixelDialogue | null = null
  private dialogueHistory: PixelDialogue[] = []

  /**
   * Get contextual dialogue based on current game state
   */
  getContextualDialogue(context: GameContext): PixelDialogue {
    if (context.codeState.errors.length > 0) {
      return this.getErrorGuidance(context)
    }

    if (context.recentAchievements.length > 0) {
      return this.getCelebration(context)
    }

    if (context.timeInChallenge > 300 && context.currentChallenge) {
      return this.getEncouragement(context)
    }

    if (context.codeState.lastModified) {
      return this.getCodeFeedback(context)
    }

    const lowResources = Object.entries(context.colonyState.resources).filter(
      ([, amount]) => amount < 50
    )
    if (lowResources.length > 0) {
      return this.getResourceAdvice(context)
    }

    return this.getGeneralTip(context)
  }

  private getErrorGuidance(context: GameContext): PixelDialogue {
    const error = context.codeState.errors[0]
    const errorType = this.categorizeError(error)

    const messages: Record<string, string[]> = {
      syntax: [
        "There's a small syntax error. Let's fix it together.",
        'Syntax errors are common. I can help you spot it.',
        "There's a syntax hiccup. Let's debug this step by step.",
      ],
      missing_tag: [
        'A closing tag may be missing. HTML tags usually come in pairs.',
        'Check your tags — every opening tag needs a closing tag.',
        'Make sure all HTML elements are properly closed.',
      ],
      css_property: [
        'A CSS property looks off. Double-check the syntax.',
        "Let's verify that CSS property is spelled correctly.",
        "There's a CSS issue. We can get the styles looking right.",
      ],
      javascript: [
        "There's a JavaScript error. Let's trace through the logic.",
        'JavaScript errors are learning opportunities. We can fix this.',
        'I found a JS issue. We can solve it step by step.',
      ],
    }

    const messageList = messages[errorType] || messages.syntax
    const message = messageList[Math.floor(Math.random() * messageList.length)]

    return {
      message: `${message}\n\n${error.message}`,
      mood: 'concerned',
      priority: 'high',
    }
  }

  private getCelebration(context: GameContext): PixelDialogue {
    const achievement = context.recentAchievements[0]

    const celebrations = [
      `Amazing — you unlocked "${achievement}". You're becoming a true CodeCraft master.`,
      `"${achievement}" achieved. The colony is thriving thanks to you.`,
      `Incredible — you've earned "${achievement}". Your skills are really showing.`,
      `"${achievement}" is yours. Keep the momentum going.`,
      `Outstanding — you've achieved "${achievement}". Excellent work.`,
    ]

    return {
      message: celebrations[Math.floor(Math.random() * celebrations.length)],
      mood: 'excited',
      priority: 'high',
    }
  }

  private getEncouragement(context: GameContext): PixelDialogue {
    const difficulty = context.currentChallenge?.difficulty || 1

    const encouragements = [
      "You're doing well. Sometimes the best solutions come after a short break.",
      'This is a tough challenge, but you can do it. Check the objectives again for a hint.',
      'Every expert was once a beginner. Each attempt builds skill.',
      'If you feel stuck, break the problem into smaller pieces.',
      'Coding is experimentation. Try a new approach and observe the result.',
      'Persistence is the key to mastery.',
    ]

    if (difficulty >= 4) {
      encouragements.push(
        'This is an advanced challenge. Take your time with the concepts.',
        "You're working on tough material. Think it through carefully."
      )
    }

    return {
      message: encouragements[Math.floor(Math.random() * encouragements.length)],
      mood: 'encouraging',
      priority: 'medium',
    }
  }

  private getCodeFeedback(context: GameContext): PixelDialogue {
    const { lastModified } = context.codeState

    const feedback: Record<string, string[]> = {
      html: [
        'Nice HTML structure. The semantic elements look solid.',
        'Clean markup. Keep building on this structure.',
        'Good HTML organization. The layout is coming together.',
      ],
      css: [
        'Those styles look sharp. The colony is getting clearer visually.',
        'Strong CSS work. Your visual hierarchy is developing well.',
        'Nice styling choices. Consistent spacing will help a lot.',
      ],
      javascript: [
        'Solid JavaScript logic. You are thinking like a programmer.',
        'Good function structure. The flow is clear.',
        'Excellent interactivity work. Keep refining the logic.',
      ],
    }

    if (!lastModified) {
      return this.getGeneralTip(context)
    }

    const messages = feedback[lastModified]
    return {
      message: messages[Math.floor(Math.random() * messages.length)],
      mood: 'happy',
      priority: 'low',
    }
  }

  private getResourceAdvice(context: GameContext): PixelDialogue {
    const lowResources = Object.entries(context.colonyState.resources)
      .filter(([, amount]) => amount < 50)
      .map(([type]) => type)

    const resourceTips: Record<string, string> = {
      energy: 'Energy is low. Build more generators or solar panels.',
      minerals: 'Minerals are running low. Set up mining operations.',
      water: 'Water reserves are depleting. Establish water collectors.',
      food: 'Food supplies are low. Set up hydroponic farms.',
    }

    const resource = lowResources[0]
    const tip = resourceTips[resource] || 'Resource management is key to colony success.'

    return {
      message: tip,
      mood: 'concerned',
      priority: 'medium',
    }
  }

  private getGeneralTip(context: GameContext): PixelDialogue {
    const tips = [
      'Pro tip: use semantic HTML like header, nav, and section for clearer structure.',
      'Design tip: consistent spacing and color make the colony feel intentional.',
      'Performance tip: keep code clean and organized for easier maintenance.',
      'Debugging tip: check the editor diagnostics for precise error locations.',
      'Learning tip: understand why code works, not only that it works.',
      'Challenge tip: read the objectives carefully — they guide the solution.',
      'Style tip: CSS Grid and Flexbox handle most layout needs cleanly.',
      'JavaScript tip: functions help you organize and reuse logic.',
      'Architecture tip: plan structure before you start coding.',
      'Growth tip: every completed challenge makes you a stronger developer.',
    ]

    if (context.playerProgress.level < 3) {
      tips.push(
        "You're just getting started. Take your time and enjoy the process.",
        'New to coding? Everyone starts somewhere — you are doing well.'
      )
    } else if (context.playerProgress.level >= 5) {
      tips.push(
        'You are getting skilled. Try experimenting with more advanced techniques.',
        'Impressive progress. You are well on your way to web development mastery.'
      )
    }

    return {
      message: tips[Math.floor(Math.random() * tips.length)],
      mood: 'thoughtful',
      priority: 'low',
    }
  }

  getChallenggeHint(context: GameContext, hintLevel: number = 1): PixelDialogue {
    if (!context.currentChallenge) {
      return {
        message: 'Start a challenge to get specific hints.',
        mood: 'curious',
      }
    }

    const hints = [
      'Start with the basics. Check the HTML template for guidance.',
      'Look at the objectives — they tell you exactly what to do.',
      'Tackle one objective at a time. Small steps lead to progress.',
      'The CSS template has helpful comments. Read them carefully.',
      'Remember: every opening tag needs a closing tag.',
    ]

    return {
      message: hints[Math.min(hintLevel - 1, hints.length - 1)],
      mood: 'thoughtful',
      priority: 'high',
    }
  }

  getWelcomeMessage(isFirstTime: boolean): PixelDialogue {
    if (isFirstTime) {
      return {
        message:
          "Welcome to CodeCraft, Commander. I'm Pixel, your AI companion. Together we'll build a space colony while you learn to code. Ready when you are.",
        mood: 'excited',
        priority: 'high',
      }
    }

    return {
      message: 'Welcome back, Commander. Ready to continue building your colony?',
      mood: 'happy',
      priority: 'medium',
    }
  }

  private categorizeError(error: any): string {
    const message = error.message?.toLowerCase() || ''

    if (message.includes('tag') || message.includes('closing')) return 'missing_tag'
    if (message.includes('css') || message.includes('property')) return 'css_property'
    if (message.includes('javascript') || message.includes('function')) return 'javascript'

    return 'syntax'
  }

  private storeDialogue(dialogue: PixelDialogue): void {
    this.dialogueHistory.push(dialogue)
    this.lastDialogue = dialogue

    if (this.dialogueHistory.length > 10) {
      this.dialogueHistory.shift()
    }
  }

  getHistory(): PixelDialogue[] {
    return [...this.dialogueHistory]
  }
}

export const pixelAI = new PixelAI()

export function getPixelDialogue(context: GameContext): PixelDialogue {
  return pixelAI.getContextualDialogue(context)
}
