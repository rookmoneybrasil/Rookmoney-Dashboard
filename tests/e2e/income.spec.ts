import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './constants'
import { cleanupE2EData } from './helpers'

test.use({ storageState: STORAGE_STATE })

test.describe('Rendas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/income')
    await page.waitForLoadState('load')
  })

  test.afterEach(async ({ page }) => {
    await cleanupE2EData(page.request)
  })

  test('página carrega', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /renda|fonte/i }).first()).toBeVisible()
  })

  test('cria renda recorrente e aparece na lista', async ({ page }) => {
    await page.click('button:has-text("Nova fonte")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Tipo "Recorrente" já é default — garante clicando
    await dialog.locator('button').filter({ hasText: /recorrente/i }).first().click()

    await page.fill('input[name="name"]', '[E2E] Salário Teste')

    // Tipo de emprego (Select CLT/PJ, Freelance...) — mantém default (EMPLOYMENT)

    // Valor
    await dialog.locator('input[type="text"]').first().click()
    await page.keyboard.type('500000') // R$ 5.000,00

    // Dia do recebimento
    await page.fill('input[name="dayOfMonth"]', '5')

    // Primeiro pagamento
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[name="startDate"]', today)

    await dialog.locator('button[type="submit"]').click()

    await expect(dialog).not.toBeVisible()
    await expect(page.locator('text=[E2E] Salário Teste').first()).toBeVisible({ timeout: 10_000 })
  })

  test('cria renda eventual e aparece na lista', async ({ page }) => {
    await page.click('button:has-text("Nova fonte")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Alterna para Eventual
    await dialog.locator('button').filter({ hasText: /eventual/i }).first().click()

    await page.fill('input[name="name"]', '[E2E] Freela Teste')

    await dialog.locator('input[type="text"]').first().click()
    await page.keyboard.type('80000') // R$ 800,00

    await dialog.locator('button[type="submit"]').click()

    await expect(dialog).not.toBeVisible()
    await expect(page.locator('text=[E2E] Freela Teste').first()).toBeVisible({ timeout: 10_000 })
  })
})
