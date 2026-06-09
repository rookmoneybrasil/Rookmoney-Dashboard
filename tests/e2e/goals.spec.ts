import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './auth.setup'

test.use({ storageState: STORAGE_STATE })

test.describe('Metas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/goals')
    await page.waitForLoadState('networkidle')
  })

  test('página carrega', async ({ page }) => {
    await expect(page.locator('h1').filter({ hasText: /meta/i })).toBeVisible()
  })

  test('barra de progresso nunca ultrapassa 100%', async ({ page }) => {
    const bars = page.locator('[role="progressbar"], .progress-bar, [style*="width"]')
    const count = await bars.count()
    for (let i = 0; i < count; i++) {
      const style = await bars.nth(i).getAttribute('style') ?? ''
      const match = style.match(/width:\s*([\d.]+)%/)
      if (match) {
        const pct = parseFloat(match[1])
        expect(pct).toBeLessThanOrEqual(100)
      }
    }
  })
})
