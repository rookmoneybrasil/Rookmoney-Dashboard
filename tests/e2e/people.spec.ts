import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './constants'
import { cleanupE2EData } from './helpers'

test.use({ storageState: STORAGE_STATE })

test.describe('Pessoas', () => {
  test.afterEach(async ({ page }) => {
    await cleanupE2EData(page.request)
  })

  test('lista de pessoas carrega', async ({ page }) => {
    await page.goto('/pt/people')
    await page.waitForLoadState('load')
    await expect(page.locator('h1, h2').filter({ hasText: /pessoa/i }).first()).toBeVisible()
  })

  test('cria pessoa e aparece na lista', async ({ page }) => {
    await page.goto('/pt/people')
    await page.waitForLoadState('load')

    // Limpa dados anteriores para não bater no limite de 2 pessoas (Free)
    await cleanupE2EData(page.request)
    await page.reload()
    await page.waitForLoadState('load')

    await page.click('button:has-text("Nova pessoa")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    await page.fill('input[name="name"]', '[E2E] Pessoa Teste')

    await dialog.locator('button[type="submit"]').click()

    await expect(dialog).not.toBeVisible()
    await expect(page.locator('text=[E2E] Pessoa Teste').first()).toBeVisible({ timeout: 10_000 })
  })

  test('registra lançamento avulso com pessoa', async ({ page }) => {
    // Cria pessoa via API para garantir que existe
    await cleanupE2EData(page.request)
    const res = await page.request.post('/api/v1/people', {
      data: { name: '[E2E] Pessoa Lançamento', color: '#3b82f6' },
    })
    expect(res.ok()).toBeTruthy()
    const { data: person } = await res.json()

    // Navega para a página de detalhe da pessoa
    await page.goto(`/pt/people/${person.id}`)
    await page.waitForLoadState('load')

    await page.click('button:has-text("Novo lançamento")')
    const dialog = page.locator('[role="dialog"]')
    await expect(dialog).toBeVisible()

    // Direção: "ela me deve" já é default (THEY_OWE_ME)
    // Modo: avulso já é default

    await page.fill('input[name="description"]', '[E2E] Dívida Teste')

    // Valor (CurrencyInput)
    await dialog.locator('input[type="text"]').first().click()
    await page.keyboard.type('15000') // R$ 150,00

    // Data
    const today = new Date().toISOString().split('T')[0]
    await page.fill('input[name="date"]', today)

    await dialog.locator('button[type="submit"]').click()

    await expect(dialog).not.toBeVisible()
    await expect(page.locator('text=[E2E] Dívida Teste').first()).toBeVisible({ timeout: 10_000 })
  })
})
