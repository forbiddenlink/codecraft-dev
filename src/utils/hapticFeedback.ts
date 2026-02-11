// File: /src/utils/hapticFeedback.ts
/**
 * Haptic Feedback Utility
 * Provides vibration patterns for different game events
 * Note: Vibration API not supported on Safari/iOS
 */

class HapticFeedbackSystem {
  private static instance: HapticFeedbackSystem;
  private isSupported: boolean;
  private enabled: boolean = true;

  private constructor() {
    this.isSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  }

  static getInstance(): HapticFeedbackSystem {
    if (!HapticFeedbackSystem.instance) {
      HapticFeedbackSystem.instance = new HapticFeedbackSystem();
    }
    return HapticFeedbackSystem.instance;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isHapticSupported(): boolean {
    return this.isSupported;
  }

  private vibrate(pattern: number | number[]): boolean {
    if (!this.isSupported || !this.enabled) return false;
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }

  // Predefined patterns for different events
  private patterns = {
    // Success - short double tap
    success: [50, 30, 50],
    // Error - longer buzz
    error: [100, 50, 100],
    // Level up - celebratory pattern
    levelUp: [50, 50, 50, 50, 100, 50, 150],
    // Achievement - triumphant
    achievement: [100, 30, 100, 30, 200],
    // Button press - minimal
    tap: [10],
    // Warning - attention-getting
    warning: [200, 100, 200],
    // Streak milestone
    streak: [30, 30, 30, 30, 30, 30, 100],
    // Code compile success
    codeSuccess: [20, 20, 40],
    // Building placed
    buildingPlace: [80, 30, 50],
    // Resource collected
    resourceCollect: [15, 15, 15],
    // Perfect score
    perfectScore: [50, 50, 50, 50, 100, 100, 200],
    // Challenge complete
    challengeComplete: [100, 50, 100, 50, 200],
    // Mastery achieved
    mastery: [50, 30, 50, 30, 100, 50, 100, 50, 200],
  };

  // Convenience methods
  success(): boolean { return this.vibrate(this.patterns.success); }
  error(): boolean { return this.vibrate(this.patterns.error); }
  levelUp(): boolean { return this.vibrate(this.patterns.levelUp); }
  achievement(): boolean { return this.vibrate(this.patterns.achievement); }
  tap(): boolean { return this.vibrate(this.patterns.tap); }
  warning(): boolean { return this.vibrate(this.patterns.warning); }
  streak(): boolean { return this.vibrate(this.patterns.streak); }
  codeSuccess(): boolean { return this.vibrate(this.patterns.codeSuccess); }
  buildingPlace(): boolean { return this.vibrate(this.patterns.buildingPlace); }
  resourceCollect(): boolean { return this.vibrate(this.patterns.resourceCollect); }
  perfectScore(): boolean { return this.vibrate(this.patterns.perfectScore); }
  challengeComplete(): boolean { return this.vibrate(this.patterns.challengeComplete); }
  mastery(): boolean { return this.vibrate(this.patterns.mastery); }
  custom(pattern: number[]): boolean { return this.vibrate(pattern); }

  // Cancel ongoing vibration
  cancel(): void {
    if (this.isSupported) {
      navigator.vibrate(0);
    }
  }
}

export const hapticFeedback = HapticFeedbackSystem.getInstance();
export default hapticFeedback;
