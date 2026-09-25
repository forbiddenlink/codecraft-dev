import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

// PostHog's host is either an absolute origin or the same-origin proxy path that
// next.config rewrites, so a plain URL validator would reject the proxy and fail the build.
const posthogHost = z
  .string()
  .refine((value) => value.startsWith('/') || /^https?:\/\//.test(value), {
    message: 'must be an absolute URL or a same-origin path such as /ingest',
  })
  .optional()

export const env = createEnv({
  server: {
    AXIOM_TOKEN: z.string().min(1).optional(),
    GROQ_API_KEY: z.string().min(1),
    JUDGE0_API_KEY: z.string().min(1).optional(),
    JUDGE0_API_URL: z.string().url().optional(),
    JUDGE0_RAPIDAPI_HOST: z.string().url().optional(),
    LIVEBLOCKS_SECRET_KEY: z.string().min(1).optional(),
    R2_ACCESS_KEY_ID: z.string().min(1).optional(),
    R2_ACCOUNT_ID: z.string().optional(),
    R2_BUCKET_NAME: z.string().optional(),
    R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
    XAPI_LRS_ENDPOINT: z.string().url().optional(),
    XAPI_LRS_PASSWORD: z.string().min(1).optional(),
    XAPI_LRS_USERNAME: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().url().optional(),
    NEXT_PUBLIC_ASSETS_URL: z.string().url().optional(),
    NEXT_PUBLIC_AXIOM_DATASET: z.string().optional(),
    NEXT_PUBLIC_DEBUG_MODE: z.string().optional(),
    NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().optional(),
    NEXT_PUBLIC_ENABLE_MULTIPLAYER: z.string().optional(),
    NEXT_PUBLIC_ENABLE_SOUND: z.string().optional(),
    NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_PARTYKIT_HOST: z.string().url().optional(),
    // The PostHog host is allowed to be a same-origin proxy path such as '/ingest', which is
    // what the rewrite in next.config serves. Requiring a URL here would reject that and fail
    // the build.
    NEXT_PUBLIC_POSTHOG_HOST: posthogHost,
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
  },
  runtimeEnv: {
    AXIOM_TOKEN: process.env.AXIOM_TOKEN,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
    JUDGE0_API_KEY: process.env.JUDGE0_API_KEY,
    JUDGE0_API_URL: process.env.JUDGE0_API_URL,
    JUDGE0_RAPIDAPI_HOST: process.env.JUDGE0_RAPIDAPI_HOST,
    LIVEBLOCKS_SECRET_KEY: process.env.LIVEBLOCKS_SECRET_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_ASSETS_URL: process.env.NEXT_PUBLIC_ASSETS_URL,
    NEXT_PUBLIC_AXIOM_DATASET: process.env.NEXT_PUBLIC_AXIOM_DATASET,
    NEXT_PUBLIC_DEBUG_MODE: process.env.NEXT_PUBLIC_DEBUG_MODE,
    NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    NEXT_PUBLIC_ENABLE_MULTIPLAYER: process.env.NEXT_PUBLIC_ENABLE_MULTIPLAYER,
    NEXT_PUBLIC_ENABLE_SOUND: process.env.NEXT_PUBLIC_ENABLE_SOUND,
    NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY,
    NEXT_PUBLIC_PARTYKIT_HOST: process.env.NEXT_PUBLIC_PARTYKIT_HOST,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    XAPI_LRS_ENDPOINT: process.env.XAPI_LRS_ENDPOINT,
    XAPI_LRS_PASSWORD: process.env.XAPI_LRS_PASSWORD,
    XAPI_LRS_USERNAME: process.env.XAPI_LRS_USERNAME,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
