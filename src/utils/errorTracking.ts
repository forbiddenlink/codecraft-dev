/**
 * Error Tracking Integration for CodeCraft
 * Provides Sentry integration for production error monitoring
 *
 * Sentry is an optional dependency - install with: npm install @sentry/nextjs
 */

// Sentry-like interface for type safety
interface SentryLike {
  init: (options: Record<string, unknown>) => void;
  captureException: (error: Error, context?: Record<string, unknown>) => string;
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error') => string;
  setUser: (user: { id?: string; email?: string; username?: string } | null) => void;
  setTag: (key: string, value: string) => void;
  setContext: (name: string, context: Record<string, unknown>) => void;
  addBreadcrumb: (breadcrumb: {
    category?: string;
    message?: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    data?: Record<string, unknown>;
  }) => void;
}

// Check if error tracking is enabled
const isErrorTrackingEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!process.env.NEXT_PUBLIC_SENTRY_DSN;
};

// Lazy load Sentry
let sentryInstance: SentryLike | null = null;
let sentryPromise: Promise<SentryLike | null> | null = null;

const getSentry = async (): Promise<SentryLike | null> => {
  if (!isErrorTrackingEnabled()) return null;

  if (!sentryPromise) {
    sentryPromise = (async () => {
      try {
        const sentry = (await import(/* webpackIgnore: true */ '@sentry/nextjs' as string)) as SentryLike;
        sentry.init({
          dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
          environment: process.env.NODE_ENV,
          tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
          debug: process.env.NODE_ENV === 'development',
          integrations: [],
        });
        sentryInstance = sentry;
        return sentry;
      } catch {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Sentry not available. Install with: npm install @sentry/nextjs');
        }
        return null;
      }
    })();
  }

  return sentryPromise;
};

/**
 * Initialize error tracking (call once at app start)
 */
export const initErrorTracking = async (): Promise<void> => {
  await getSentry();
};

/**
 * Capture an error with optional context
 */
export const captureError = async (
  error: Error,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: { id?: string; email?: string; username?: string };
  }
): Promise<string | null> => {
  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error captured:', error, context);
  }

  const sentry = await getSentry();
  if (!sentry) return null;

  if (context?.tags) {
    Object.entries(context.tags).forEach(([key, value]) => {
      sentry.setTag(key, value);
    });
  }

  if (context?.extra) {
    sentry.setContext('extra', context.extra);
  }

  if (context?.user) {
    sentry.setUser(context.user);
  }

  return sentry.captureException(error);
};

/**
 * Capture a message
 */
export const captureMessage = async (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info'
): Promise<string | null> => {
  const sentry = await getSentry();
  if (!sentry) return null;

  return sentry.captureMessage(message, level);
};

/**
 * Set user context for error tracking
 */
export const setErrorTrackingUser = async (user: {
  id?: string;
  email?: string;
  username?: string;
} | null): Promise<void> => {
  const sentry = await getSentry();
  if (!sentry) return;

  sentry.setUser(user);
};

/**
 * Add a breadcrumb for debugging
 */
export const addBreadcrumb = async (breadcrumb: {
  category?: string;
  message?: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}): Promise<void> => {
  const sentry = await getSentry();
  if (!sentry) return;

  sentry.addBreadcrumb(breadcrumb);
};

// =============================================================================
// GAME-SPECIFIC ERROR TRACKING
// =============================================================================

/**
 * Track code execution errors
 */
export const trackCodeError = async (
  error: Error,
  code: string,
  language: 'html' | 'css' | 'javascript',
  challengeId?: string
): Promise<void> => {
  await captureError(error, {
    tags: {
      error_type: 'code_execution',
      language,
    },
    extra: {
      code: code.substring(0, 1000), // Limit code length
      challengeId,
    },
  });

  await addBreadcrumb({
    category: 'code_execution',
    message: `Code execution error in ${language}`,
    level: 'error',
    data: { challengeId, errorMessage: error.message },
  });
};

/**
 * Track WebGL/3D rendering errors
 */
export const trackRenderError = async (
  error: Error,
  component: string,
  sceneInfo?: {
    buildingCount?: number;
    villagerCount?: number;
    fps?: number;
  }
): Promise<void> => {
  await captureError(error, {
    tags: {
      error_type: 'webgl_render',
      component,
    },
    extra: sceneInfo,
  });
};

/**
 * Track game state errors
 */
export const trackGameStateError = async (
  error: Error,
  action: string,
  state?: Record<string, unknown>
): Promise<void> => {
  await captureError(error, {
    tags: {
      error_type: 'game_state',
      action,
    },
    extra: {
      state: state ? JSON.stringify(state).substring(0, 2000) : undefined,
    },
  });
};

// Export instance for direct access if needed
export const getErrorTrackingInstance = (): SentryLike | null => sentryInstance;
