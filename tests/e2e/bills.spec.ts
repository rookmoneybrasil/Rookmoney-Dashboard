import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './auth.setup'

test.use({ storageState: STORAGE_STATE })

test.describe('Contas a Pagar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/bills')
    await page.waitForLoadState('networkidle')
  })

  test('página carrega', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /conta/i }).first()).toBeVisible()
  })

  test('modal de nova conta abre e fecha com ESC sem sujar estado', async ({ page }) => {
    await page.click('button:has-text("Nova conta")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Preenche parcialmente
    await page.fill('input[name="name"]', 'Teste Playwright')

    // Fecha com ESC
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    // Reabre — campo deve estar vazio (fix que aplicamos)
    await page.click('button:has-text("Nova conta")')
    await expect(dialog).toBeVisible()
    const nameField = page.locator('input[name="name"]')
    await expect(nameField).toHaveValue('')
  })

  test('cria e exibe nova conta avulsa', async ({ page }) => {
    await page.click('button:has-text("Nova conta")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    await page.fill('input[name="name"]', '[E2E] Conta Teste')

    // CurrencyInput — digita via teclado no campo visível
    const amountInput = dialog.locator('input[type="text"]').first()
    await amountInput.click()
    await page.keyboard.type('15000') // R$ 150,00

    // Data
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[name="dueDate"]', today)

    await page.click('button[type="submit"]')

    // Após salvar, modal fecha e conta aparece na lista
    await expect(dialog).not.toBeVisible()
    await expect(page.locator('text=[E2E] Conta Teste')).toBeVisible({ timeout: 10_000 })
  })
})
