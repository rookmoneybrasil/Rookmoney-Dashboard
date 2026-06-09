import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './constants'
import { cleanupE2EData } from './helpers'

test.use({ storageState: STORAGE_STATE })

test.describe('Metas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/goals')
    await page.waitForLoadState('load')
  })

  test.afterEach(async ({ page }) => {
    await cleanupE2EData(page.request)
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

  test('cria meta e aparece na lista', async ({ page }) => {
    // Limpa dados anteriores para não bater no limite de 2 metas (Free)
    await cleanupE2EData(page.request)
    await page.reload()
    await page.waitForLoadState('load')

    await page.click('button:has-text("Nova")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    await page.fill('input[name="name"]', '[E2E] Meta Teste')

    // CurrencyInput não tem atributo name — pula o campo nome com :not([name])
    await dialog.locator('input[type="text"]:not([name])').first().click()
    await page.keyboard.type('100000') // R$ 1.000,00

    await dialog.locator('button[type="submit"]').click()

    await expect(dialog).not.toBeVisible()
    await expect(page.locator('text=[E2E] Meta Teste').first()).toBeVisible({ timeout: 10_000 })
  })

  test('faz aporte em meta existente', async ({ page }) => {
    // Garante meta limpa antes
    await cleanupE2EData(page.request)

    // Cria uma meta via API para ter dado garantido
    const res = await page.request.post('/api/v1/goals', {
      data: { name: '[E2E] Meta Aporte', targetAmount: 1000, color: '#3B82F6' },
    })
    expect(res.ok()).toBeTruthy()

    await page.reload()
    await page.waitForLoadState('load')

    // Clica no botão de aporte (title="Adicionar ou retirar")
    // Só há uma meta na página (limpeza prévia) — .first() é seguro
    await page.locator('button[title="Adicionar ou retirar"]').first().click()

    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Modo Aportar já é default
    // CurrencyInput é único no modal — .first() funciona
    await dialog.locator('input[type="text"]').first().click()
    await page.keyboard.type('5000') // R$ 50,00

    await dialog.locator('button[type="submit"]').click()

    await expect(dialog).not.toBeVisible()
  })
})
