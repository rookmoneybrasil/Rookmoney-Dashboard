import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './constants'
import { cleanupE2EData } from './helpers'

test.use({ storageState: STORAGE_STATE })

test.describe('Contas a Pagar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/bills')
    await page.waitForLoadState('load')
  })

  test.afterEach(async ({ page }) => {
    await cleanupE2EData(page.request)
  })

  test('página carrega', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /conta/i }).first()).toBeVisible()
  })

  test('modal de nova conta abre e fecha com ESC sem sujar estado', async ({ page }) => {
    await page.click('button:has-text("Nova conta")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    await page.fill('input[name="name"]', 'Teste Playwright')

    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    // Reabre — campo deve estar vazio
    await page.click('button:has-text("Nova conta")')
    await expect(dialog).toBeVisible()
    const nameField = page.locator('input[name="name"]')
    await expect(nameField).toHaveValue('')
  })

  test('cria e exibe nova conta avulsa', async ({ page }) => {
    // Limpa dados anteriores para não bater no limite (Free: 5 contas)
    await cleanupE2EData(page.request)
    await page.reload()
    await page.waitForLoadState('load')

    await page.click('button:has-text("Nova conta")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    await page.fill('input[name="name"]', '[E2E] Conta Teste')

    // CurrencyInput — é o 2º input[type=text] (o 1º é o campo name)
    const amountInput = dialog.locator('input[type="text"]').nth(1)
    await amountInput.click()
    await page.keyboard.type('15000') // R$ 150,00

    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[name="dueDate"]', today)

    await page.click('button[type="submit"]')

    await expect(dialog).not.toBeVisible()
    await expect(page.locator('text=[E2E] Conta Teste').first()).toBeVisible({ timeout: 10_000 })
  })

  test('marca conta como paga', async ({ page }) => {
    // Cria conta via API para ter dado garantido
    await cleanupE2EData(page.request)
    const today = new Date().toISOString().split('T')[0]
    const res = await page.request.post('/api/v1/bills', {
      data: { name: '[E2E] Conta Pagar', amount: 99.9, dueDate: today },
    })
    expect(res.ok()).toBeTruthy()

    await page.reload()
    await page.waitForLoadState('load')

    // MarkBillPaidButton não tem texto — usa o title attribute
    await page.locator('button[title="Marcar como paga"]').first().click()

    // Após click, a página recarrega e o botão muda de title
    await expect(
      page.locator('button[title="Marcar como pendente"]').first()
    ).toBeVisible({ timeout: 10_000 })
  })
})
