import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './constants'
import { cleanupE2EData } from './helpers'

test.use({ storageState: STORAGE_STATE })

test.describe('Transações', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/transactions')
    await page.waitForLoadState('load')
  })

  test.afterEach(async ({ page }) => {
    await cleanupE2EData(page.request)
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

  test('cria despesa e aparece na lista', async ({ page }) => {
    // Garante uma categoria disponível (usuário novo não tem categorias padrão)
    await cleanupE2EData(page.request)
    await page.request.post('/api/v1/categories', {
      data: { name: '[E2E] Categoria', icon: '🧪', color: '#6366f1' },
    })
    await page.reload()
    await page.waitForLoadState('load')

    await page.click('button:has-text("Nova")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Tipo Despesa já é default — confirma
    await dialog.locator('button').filter({ hasText: /despesa/i }).click()

    // CurrencyInput — primeiro input[type=text] no dialog
    await dialog.locator('input[type="text"]').first().click()
    await page.keyboard.type('5000') // R$ 50,00

    await page.fill('input[name="description"]', '[E2E] Despesa Teste')

    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[name="date"]', today)

    // Categoria — usa teclado para evitar problema de viewport com Radix Select portal
    await dialog.getByRole('combobox').click()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    await dialog.locator('button[type="submit"]').click()

    await expect(dialog).not.toBeVisible()
    await expect(page.locator('text=[E2E] Despesa Teste').first()).toBeVisible({ timeout: 10_000 })
  })

  test('cria receita e aparece na lista', async ({ page }) => {
    // Garante uma categoria disponível
    await cleanupE2EData(page.request)
    await page.request.post('/api/v1/categories', {
      data: { name: '[E2E] Categoria', icon: '🧪', color: '#6366f1' },
    })
    await page.reload()
    await page.waitForLoadState('load')

    await page.click('button:has-text("Nova")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    await dialog.locator('button').filter({ hasText: /receita/i }).click()

    await dialog.locator('input[type="text"]').first().click()
    await page.keyboard.type('20000') // R$ 200,00

    await page.fill('input[name="description"]', '[E2E] Receita Teste')

    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[name="date"]', today)

    await dialog.getByRole('combobox').click()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')

    await dialog.locator('button[type="submit"]').click()

    await expect(dialog).not.toBeVisible()
    await expect(page.locator('text=[E2E] Receita Teste').first()).toBeVisible({ timeout: 10_000 })
  })
})
