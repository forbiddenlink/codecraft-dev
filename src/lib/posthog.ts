import PostHog from 'posthog-js'

let initialized = false

const isAnalyticsEnabled = (): boolean =>
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' &&
  !!process.env.NEXT_PUBLIC_POSTHOG_KEY

export const initPostHog = (): typeof PostHog | null => {
  if (!isAnalyticsEnabled()) return null
  if (initialized) return PostHog

  PostHog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: true,
    persistence: 'localStorage',
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') ph.opt_out_capturing()
      if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') ph.debug()
    },
  })
  initialized = true
  return PostHog
}

export const getPostHogInstance = (): typeof PostHog | null =>
  initialized && isAnalyticsEnabled() ? PostHog : null

export default PostHog
