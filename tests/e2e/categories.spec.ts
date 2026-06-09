import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './constants'
import { cleanupE2EData } from './helpers'

test.use({ storageState: STORAGE_STATE })

test.describe('Categorias', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/categories')
    await page.waitForLoadState('load')
  })

  test.afterEach(async ({ page }) => {
    await cleanupE2EData(page.request)
  })

  test('página carrega', async ({ page }) => {
    await expect(page.locator('h1, h2').filter({ hasText: /categor/i }).first()).toBeVisible()
  })

  test('cria categoria customizada com ícone e aparece na lista', async ({ page }) => {
    // Limpa dados anteriores (Free: limite 3 categorias custom)
    await cleanupE2EData(page.request)
    await page.reload()
    await page.waitForLoadState('load')

    await page.click('button:has-text("Nova categoria")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    await page.fill('input[name="name"]', '[E2E] Streaming Teste')

    // Abre o emoji picker — botão contém um <span class="text-slate-600"> com "+"
    // quando nenhum ícone está selecionado
    const iconPickerBtn = dialog.locator('button:has(span.text-slate-600)')
    await iconPickerBtn.click()

    // Picker abre com grid de emojis — clica no primeiro emoji disponível
    await page.locator('.grid-cols-8 button').first().click()

    await dialog.locator('button[type="submit"]').click()

    await expect(dialog).not.toBeVisible()
    await expect(page.locator('text=[E2E] Streaming Teste').first()).toBeVisible({ timeout: 10_000 })
  })
})
