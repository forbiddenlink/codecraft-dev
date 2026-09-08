'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { Suspense, useEffect } from 'react'
import PostHog, { initPostHog } from '@/lib/posthog'
import { trackPageView } from '@/utils/analytics'

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (pathname) {
      let url = window.location.origin + pathname
      const search = searchParams?.toString()
      if (search) url += '?' + search
      void trackPageView(url)
    }
  }, [pathname, searchParams])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog()
  }, [])

  return (
    <PHProvider client={PostHog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}
