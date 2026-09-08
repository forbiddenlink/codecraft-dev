import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { loadBindings, transform } from 'next/dist/build/swc'

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    capture: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
    debug: jest.fn(),
    opt_out_capturing: jest.fn(),
    people: { set: jest.fn() },
  },
}))
let client: { init: jest.Mock; capture: jest.Mock; opt_out_capturing: jest.Mock }
const originalEnv = process.env

describe('shared analytics initialization', () => {
  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
    client = require('posthog-js').default
    jest.clearAllMocks()
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = 'true'
    process.env.NEXT_PUBLIC_POSTHOG_KEY = 'synthetic-key'
    process.env.NEXT_PUBLIC_POSTHOG_HOST = ''
    process.env.NODE_ENV = 'test'
  })
  afterEach(() => {
    process.env = originalEnv
    jest.restoreAllMocks()
  })

  it.each(['false', ''])('does not initialize or emit when enablement is %s', async (flag) => {
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS = flag
    const { initPostHog } = await import('../posthog')
    const { trackChallengeCompleted, trackPageView } = await import('@/utils/analytics')
    initPostHog()
    await trackPageView('/synthetic')
    await trackChallengeCompleted('intro-1', 100, 5000, 1, 100)
    expect(client.init).not.toHaveBeenCalled()
    expect(client.capture).not.toHaveBeenCalled()
  })

  it('does not initialize without a key', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = ''
    const { initPostHog } = await import('../posthog')
    initPostHog()
    expect(client.init).not.toHaveBeenCalled()
  })

  it('shares one client and host for pageviews and challenge events, even before provider mount', async () => {
    process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://analytics.example.invalid'
    const { initPostHog } = await import('../posthog')
    const { trackChallengeCompleted, trackPageView, getAnalyticsInstance } = await import(
      '@/utils/analytics'
    )
    await trackChallengeCompleted('intro-1', 100, 5000, 1, 100)
    initPostHog()
    initPostHog()
    await trackPageView('/synthetic')
    expect(client.init).toHaveBeenCalledTimes(1)
    expect(client.init).toHaveBeenCalledWith(
      'synthetic-key',
      expect.objectContaining({
        api_host: 'https://analytics.example.invalid',
        autocapture: false,
        capture_pageview: false,
      })
    )
    expect(getAnalyticsInstance()).toBe(client)
    expect(client.capture).toHaveBeenCalledWith(
      'challenge_completed',
      expect.objectContaining({ challenge_id: 'intro-1', time_spent_ms: 5000, attempts: 1 })
    )
    expect(client.capture).toHaveBeenCalledWith('$pageview', { $current_url: '/synthetic' })
  })

  it('uses the same default host as the mounted provider', async () => {
    const { initPostHog } = await import('../posthog')
    initPostHog()
    expect(client.init).toHaveBeenCalledWith(
      'synthetic-key',
      expect.objectContaining({ api_host: 'https://us.i.posthog.com' })
    )
  })

  it('does not initialize on the server and can initialize after hydration', async () => {
    // Jest's jsdom window is non-configurable. Execute the actual module in an
    // isolated server context, then provide a browser global on that same module.
    const source = readFileSync(resolve(__dirname, '../posthog.ts'), 'utf8')
    await loadBindings()
    const { code: outputText } = await transform(source, {
      filename: 'posthog.ts',
      jsc: { parser: { syntax: 'typescript' } },
      module: { type: 'commonjs' },
    })
    const context: {
      exports: { initPostHog?: () => unknown }
      process: { env: NodeJS.ProcessEnv }
      require: () => unknown
      window?: object
    } = {
      exports: {},
      process: { env: process.env },
      require: () => ({ __esModule: true, default: client }),
    }
    runInNewContext(outputText, context)
    context.exports.initPostHog!()
    expect(client.init).not.toHaveBeenCalled()
    context.window = {}
    context.exports.initPostHog!()
    expect(client.init).toHaveBeenCalledTimes(1)
  })

  it('retains the development opt-out', async () => {
    process.env.NODE_ENV = 'development'
    const { initPostHog } = await import('../posthog')
    initPostHog()
    client.init.mock.calls[0][1].loaded(client)
    expect(client.opt_out_capturing).toHaveBeenCalledTimes(1)
  })
})
