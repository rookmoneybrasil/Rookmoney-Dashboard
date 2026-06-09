import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './constants'
import { cleanupE2EData } from './helpers'

test.use({ storageState: STORAGE_STATE })

test.describe('Recorrências', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/recurring')
    await page.waitForLoadState('load')
  })

  test.afterEach(async ({ page }) => {
    await cleanupE2EData(page.request)
  })

  test('página carrega', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /recorr/i }).first()).toBeVisible()
  })

  test('cria recorrência mensal e aparece na lista', async ({ page }) => {
    // Garante estado limpo + cria categoria disponível
    await cleanupE2EData(page.request)
    await page.request.post('/api/v1/categories', {
      data: { name: '[E2E] Categoria', icon: '🧪', color: '#6366f1' },
    })
    await page.reload()
    await page.waitForLoadState('load')

    await page.click('button:has-text("Nova recorrência")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    await page.fill('input[name="name"]', '[E2E] Netflix Teste')

    // Valor — CurrencyInput não tem atributo name, pula o campo nome com :not([name])
    await dialog.locator('input[type="text"]:not([name])').first().click()
    await page.keyboard.type('5490') // R$ 54,90

    // Categoria — o modal tem 3 comboboxes (Tipo, Categoria, Frequência)
    // Categoria é o índice 1 (segundo combobox)
    await dialog.getByRole('combobox').nth(1).click()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    // Frequência já é MONTHLY por default — não altera
    // Dia do mês
    await page.fill('input[name="dayOfMonth"]', '15')

    await dialog.locator('button[type="submit"]').click()

    await expect(dialog).not.toBeVisible()
    await expect(page.locator('text=[E2E] Netflix Teste').first()).toBeVisible({ timeout: 10_000 })
  })
})
