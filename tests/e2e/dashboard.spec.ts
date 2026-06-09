import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './auth.setup'

test.use({ storageState: STORAGE_STATE })

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('carrega sem erro', async ({ page }) => {
    await expect(page.locator('text=Saldo do mês')).toBeVisible()
    await expect(page.locator('text=A Pagar')).toBeVisible()
    await expect(page.locator('text=Receitas do mês')).toBeVisible()
  })

  test('modal Receitas do mês abre e fecha', async ({ page }) => {
    await page.click('text=Receitas do mês')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('modal A Pagar abre e fecha', async ({ page }) => {
    await page.click('text=A Pagar')
    await expect(page.locator('[role="dialog"]')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.locator('[role="dialog"]')).not.toBeVisible()
  })

  test('projeção abre painel de detalhes ao clicar em um mês', async ({ page }) => {
    const chips = page.locator('button').filter({ hasText: /jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez/i })
    const count = await chips.count()
    if (count === 0) return // sem projeções configuradas, pula

    await chips.first().click()
    await expect(page.locator('text=Saldo acumulado')).toBeVisible()
  })
})
