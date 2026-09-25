import PostHog from 'posthog-js'

// Identifies this app in the shared PostHog project (325061), which several apps
// report into. Registered as a super property so every event carries it and per-app
// funnels stay filterable.
const APP_NAME = 'codecraft'

let initialized = false

// A local build serves the production bundle, so NODE_ENV alone does not keep dev
// traffic out: 150 of the project's 946 pageviews in 30 days came from
// localhost:3041. The host is the reliable signal.
const isLocalHost = (): boolean =>
  typeof window !== 'undefined' &&
  /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(window.location.hostname)

// Set NEXT_PUBLIC_POSTHOG_ALLOW_LOCALHOST=true to deliberately exercise analytics
// against a local build.
const isAnalyticsEnabled = (): boolean =>
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true' &&
  !!process.env.NEXT_PUBLIC_POSTHOG_KEY &&
  (process.env.NEXT_PUBLIC_POSTHOG_ALLOW_LOCALHOST === 'true' || !isLocalHost())

export const initPostHog = (): typeof PostHog | null => {
  if (!isAnalyticsEnabled()) return null
  if (initialized) return PostHog

  PostHog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    // api_host may be the same-origin /ingest proxy. ui_host keeps the toolbar and
    // every "view in PostHog" link pointing at the real app instead of the proxy.
    ui_host: 'https://us.posthog.com',
    person_profiles: 'identified_only',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: true,
    persistence: 'localStorage',
    loaded: (ph) => {
      ph.register({ app: APP_NAME })
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
