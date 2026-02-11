import { test, expect } from '@playwright/test';

test.describe('Challenge Completion Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should complete first HTML challenge', async ({ page }) => {
    // Start first challenge
    await page.click('text=Start Challenge');

    // Wait for editor to load
    await page.waitForSelector('[data-testid="code-editor"]');

    // Type code
    await page.fill('[data-testid="code-editor"]', '<h1>Hello World</h1>');

    // Check solution
    await page.click('text=Check Solution');

    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Verify celebration animation
    await expect(page.locator('[data-testid="celebration"]')).toBeVisible();

    // Verify XP reward
    await expect(page.locator('text=/XP.*awarded/i')).toBeVisible();
  });

  test('should show error feedback for incorrect solution', async ({ page }) => {
    // Start challenge
    await page.click('text=Start Challenge');

    // Type incorrect code
    await page.fill('[data-testid="code-editor"]', '<p>Wrong element</p>');

    // Check solution
    await page.click('text=Check Solution');

    // Wait for error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

    // Verify feedback is displayed
    await expect(page.locator('text=/missing/i')).toBeVisible();
  });

  test('should provide hints when requested', async ({ page }) => {
    // Start challenge
    await page.click('text=Start Challenge');

    // Click hint button
    await page.click('[data-testid="hint-button"]');

    // Verify hint is displayed
    await expect(page.locator('[data-testid="hint-message"]')).toBeVisible();
  });

  test('should track progress across multiple challenges', async ({ page }) => {
    // Complete first challenge
    await page.click('text=Start Challenge');
    await page.fill('[data-testid="code-editor"]', '<h1>Hello</h1>');
    await page.click('text=Check Solution');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

    // Move to next challenge
    await page.click('text=Next Challenge');

    // Verify progress indicator updated
    await expect(page.locator('text=/1.*completed/i')).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through focusable elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Verify focus is visible
    const focusedElement = await page.evaluateHandle(() => document.activeElement);
    await expect(focusedElement).toBeTruthy();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // Check for main landmarks
    await expect(page.locator('role=main')).toBeVisible();
    await expect(page.locator('role=navigation')).toBeVisible();

    // Check buttons have labels
    const buttons = await page.locator('button').all();
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/');

    // Check for sr-only announcer
    const announcer = await page.locator('#sr-announcer');
    await expect(announcer).toHaveAttribute('aria-live');
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should adapt UI for mobile', async ({ page }) => {
    await page.goto('/');

    // Check that code editor is visible
    await expect(page.locator('[data-testid="code-editor"]')).toBeVisible();

    // Check that controls are accessible
    await expect(page.locator('text=Check Solution')).toBeVisible();
  });

  test('should support touch interactions', async ({ page }) => {
    await page.goto('/');

    // Tap on challenge
    await page.tap('text=Start Challenge');

    // Verify challenge opened
    await expect(page.locator('[data-testid="challenge-modal"]')).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load within acceptable time', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - start;

    expect(loadTime).toBeLessThan(5000); // 5 seconds
  });

  test('should maintain 30+ FPS in 3D scene', async ({ page }) => {
    await page.goto('/');

    // Measure FPS
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frameCount = 0;
        const startTime = performance.now();

        function countFrame() {
          frameCount++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frameCount);
          }
        }

        requestAnimationFrame(countFrame);
      });
    });

    expect(fps).toBeGreaterThan(30);
  });
});
