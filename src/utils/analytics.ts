/**
 * Analytics Integration for CodeCraft
 * Provides PostHog integration for product analytics and learning metrics
 *
 * PostHog is an optional dependency - install with: npm install posthog-js
 */

// Types for analytics events
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
}

interface UserProperties {
  level?: number;
  completedChallenges?: number;
  totalXP?: number;
  currentPath?: 'html' | 'css' | 'javascript';
  buildingsPlaced?: number;
  [key: string]: unknown;
}

// PostHog-like interface for type safety without requiring the package
interface PostHogLike {
  init: (apiKey: string, options: Record<string, unknown>) => void;
  capture: (eventName: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, properties?: Record<string, unknown>) => void;
  people: {
    set: (properties: Record<string, unknown>) => void;
  };
  reset: () => void;
  debug: () => void;
}

// Check if analytics is enabled
const isAnalyticsEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' &&
         !!process.env.NEXT_PUBLIC_POSTHOG_KEY;
};

// Lazy load PostHog
let posthogInstance: PostHogLike | null = null;
let posthogPromise: Promise<PostHogLike | null> | null = null;

const getPostHog = async (): Promise<PostHogLike | null> => {
  if (!isAnalyticsEnabled()) return null;

  if (!posthogPromise) {
    posthogPromise = (async () => {
      try {
        // Dynamic import with type assertion - posthog-js is an optional peer dependency
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const posthog = (await import(/* webpackIgnore: true */ 'posthog-js' as string)) as { default: PostHogLike };
        const ph = posthog.default;
        ph.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
          autocapture: false,
          capture_pageview: false,
          persistence: 'localStorage',
          loaded: () => {
            if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
              ph.debug();
            }
          },
        });
        posthogInstance = ph;
        return ph;
      } catch {
        // posthog-js not installed - analytics disabled
        if (process.env.NODE_ENV === 'development') {
          console.warn('PostHog not available. Install with: npm install posthog-js');
        }
        return null;
      }
    })();
  }

  return posthogPromise;
};

/**
 * Track a custom event
 */
export const trackEvent = async (event: AnalyticsEvent): Promise<void> => {
  const posthog = await getPostHog();
  if (!posthog) return;

  posthog.capture(event.name, event.properties);
};

/**
 * Track page view
 */
export const trackPageView = async (path: string): Promise<void> => {
  const posthog = await getPostHog();
  if (!posthog) return;

  posthog.capture('$pageview', { $current_url: path });
};

/**
 * Identify user with properties
 */
export const identifyUser = async (userId: string, properties?: UserProperties): Promise<void> => {
  const posthog = await getPostHog();
  if (!posthog) return;

  posthog.identify(userId, properties);
};

/**
 * Set user properties without identification
 */
export const setUserProperties = async (properties: UserProperties): Promise<void> => {
  const posthog = await getPostHog();
  if (!posthog) return;

  posthog.people.set(properties);
};

/**
 * Reset user identity (for logout)
 */
export const resetUser = async (): Promise<void> => {
  const posthog = await getPostHog();
  if (!posthog) return;

  posthog.reset();
};

// =============================================================================
// LEARNING ANALYTICS EVENTS
// =============================================================================

/**
 * Track when a challenge is started
 */
export const trackChallengeStarted = async (
  challengeId: string,
  challengeTitle: string,
  difficulty: number,
  language: 'html' | 'css' | 'javascript'
): Promise<void> => {
  await trackEvent({
    name: 'challenge_started',
    properties: {
      challenge_id: challengeId,
      challenge_title: challengeTitle,
      difficulty,
      language,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track when code is submitted
 */
export const trackCodeSubmitted = async (
  challengeId: string,
  success: boolean,
  score: number,
  timeSpentMs: number,
  attemptNumber: number
): Promise<void> => {
  await trackEvent({
    name: 'code_submitted',
    properties: {
      challenge_id: challengeId,
      success,
      score,
      time_spent_ms: timeSpentMs,
      attempt_number: attemptNumber,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track when a challenge is completed
 */
export const trackChallengeCompleted = async (
  challengeId: string,
  score: number,
  timeSpentMs: number,
  attempts: number,
  xpEarned: number
): Promise<void> => {
  await trackEvent({
    name: 'challenge_completed',
    properties: {
      challenge_id: challengeId,
      score,
      time_spent_ms: timeSpentMs,
      attempts,
      xp_earned: xpEarned,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track when a building is constructed
 */
export const trackBuildingConstructed = async (
  buildingType: string,
  codeQualityScore: number,
  resourcesCost: Record<string, number>
): Promise<void> => {
  await trackEvent({
    name: 'building_constructed',
    properties: {
      building_type: buildingType,
      code_quality_score: codeQualityScore,
      resources_cost: resourcesCost,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track when a skill is unlocked
 */
export const trackSkillUnlocked = async (
  skillId: string,
  skillPath: string,
  playerLevel: number
): Promise<void> => {
  await trackEvent({
    name: 'skill_unlocked',
    properties: {
      skill_id: skillId,
      skill_path: skillPath,
      player_level: playerLevel,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track when an achievement is earned
 */
export const trackAchievementEarned = async (
  achievementId: string,
  achievementTitle: string
): Promise<void> => {
  await trackEvent({
    name: 'achievement_earned',
    properties: {
      achievement_id: achievementId,
      achievement_title: achievementTitle,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Track session metrics
 */
export const trackSessionEnd = async (
  totalTimeMs: number,
  challengesCompleted: number,
  buildingsPlaced: number,
  xpEarned: number
): Promise<void> => {
  await trackEvent({
    name: 'session_ended',
    properties: {
      total_time_ms: totalTimeMs,
      challenges_completed: challengesCompleted,
      buildings_placed: buildingsPlaced,
      xp_earned: xpEarned,
      timestamp: new Date().toISOString(),
    },
  });
};

// =============================================================================
// PERFORMANCE ANALYTICS
// =============================================================================

/**
 * Track WebGL performance metrics
 */
export const trackPerformanceMetrics = async (metrics: {
  fps: number;
  drawCalls: number;
  triangles: number;
  textures: number;
  geometries: number;
}): Promise<void> => {
  await trackEvent({
    name: 'webgl_performance',
    properties: {
      ...metrics,
      timestamp: new Date().toISOString(),
    },
  });
};

// Export instance for direct access if needed
export const getAnalyticsInstance = (): PostHogLike | null => posthogInstance;
