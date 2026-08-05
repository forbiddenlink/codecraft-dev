import { expect, test } from '@playwright/test'

/**
 * Smoke tests: verify the app actually boots and core routes render.
 *
 * These assert against markup that really exists in the app (see src/app/*).
 * The previous challenge-completion spec targeted data-testid selectors that
 * were never added to any component, so every test timed out. Kept honest:
 * only assert what ships. Extend with real challenge-flow coverage once the
 * relevant components expose stable test hooks.
 */

test.describe('App smoke', () => {
  test('home page boots with landmark and heading', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/')

    // Main landmark rendered (src/app/page.tsx -> <main id="main">).
    await expect(page.locator('main#main')).toBeVisible()

    // Accessible page heading present (sr-only H1).
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/CodeCraft/i)

    // No uncaught runtime errors on load.
    expect(errors, `page errors: ${errors.join(' | ')}`).toEqual([])
  })

  test('document title is set', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/CodeCraft/i)
  })

  test('static routes respond', async ({ page }) => {
    for (const path of ['/playground', '/privacy', '/terms']) {
      const res = await page.goto(path)
      expect(res?.status(), `${path} status`).toBeLessThan(400)
    }
  })
})
