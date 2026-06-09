import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './constants'

test.use({ storageState: STORAGE_STATE })

test.describe('Transações', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/transactions')
    await page.waitForLoadState('load')
  })

  test('página carrega', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /transa/i }).first()).toBeVisible()
  })

  test('modal de nova transação fecha com ESC sem sujar estado', async ({ page }) => {
    await page.click('button:has-text("Nova")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    await page.fill('input[name="description"]', 'Descrição teste')
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    // Reabre — campo deve estar vazio
    await page.click('button:has-text("Nova")')
    await expect(dialog).toBeVisible()
    await expect(page.locator('input[name="description"]')).toHaveValue('')
  })
})
