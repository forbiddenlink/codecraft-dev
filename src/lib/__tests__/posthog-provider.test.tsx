import { cleanup, render, waitFor } from '@testing-library/react'
import PostHog from 'posthog-js'
import { type ReactNode, StrictMode } from 'react'
import { PostHogProvider } from '@/components/PostHogProvider'
import { trackChallengeCompleted } from '@/utils/analytics'

const client = jest.mocked(PostHog)
const provider = jest.fn()
jest.mock('posthog-js', () => ({
  __esModule: true,
  default: { init: jest.fn(), capture: jest.fn() },
}))
jest.mock('posthog-js/react', () => ({
  PostHogProvider: (props: { children: ReactNode; client: unknown }) => {
    provider(props)
    return props.children
  },
}))
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams('utm_source=fixture'),
}))

const originalEnv = process.env

describe('mounted analytics provider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'synthetic-key'
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://analytics.example.invalid'
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true'
  })
  afterEach(() => {
    cleanup()
    process.env = originalEnv
  })

  it('renders children without telemetry when explicitly disabled', async () => {
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'false'
    const view = render(
      <PostHogProvider>
        <span>Fixture content</span>
      </PostHogProvider>
    )
    expect(view.getByText('Fixture content')).toBeTruthy()
    await trackChallengeCompleted('intro-1', 100, 5000, 1, 100)
    expect(client.init).not.toHaveBeenCalled()
    expect(client.capture).not.toHaveBeenCalled()
  })

  it('shares one init across child pageview effects, parent effects, StrictMode and challenge events', async () => {
    render(
      <StrictMode>
        <PostHogProvider>
          <span>Fixture content</span>
        </PostHogProvider>
      </StrictMode>
    )
    await trackChallengeCompleted('intro-1', 100, 5000, 1, 100)
    await waitFor(() =>
      expect(client.capture).toHaveBeenCalledWith(
        'challenge_completed',
        expect.objectContaining({ challenge_id: 'intro-1' })
      )
    )
    expect(client.init).toHaveBeenCalledTimes(1)
    expect(client.capture).toHaveBeenCalledWith('$pageview', {
      $current_url: `${window.location.origin}/?utm_source=fixture`,
    })
    for (const [props] of provider.mock.calls) {
      expect(props.client).toBe(client)
      expect(props).not.toHaveProperty('apiKey')
      expect(props).not.toHaveProperty('options')
    }
  })
})
