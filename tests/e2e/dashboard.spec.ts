import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './constants'

test.use({ storageState: STORAGE_STATE })

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pt/dashboard')
    await page.waitForLoadState('load')
  })

  test('carrega sem erro', async ({ page }) => {
    // StatCard labels: "A Receber", "Receitas", "A Pagar", "Saldo do mês"
    await expect(page.locator('text=Saldo do mês').first()).toBeVisible()
    await expect(page.locator('text=A Pagar').first()).toBeVisible()
    await expect(page.locator('text=Receitas').first()).toBeVisible()
  })

  test('modal Receitas do mês abre e fecha', async ({ page }) => {
    // StatCard label é "Receitas" (span.uppercase dentro do .cursor-pointer)
    // StatModal title é "Receitas do mês" (h2, só aparece quando aberto)
    const card = page.locator('.cursor-pointer').filter({
      has: page.locator('span.uppercase').filter({ hasText: /^Receitas$/ }),
    })
    await card.click()

    // Verifica modal aberto pelo h2 — StatModal não tem role="dialog"
    const modalTitle = page.locator('h2').filter({ hasText: 'Receitas do mês' })
    await expect(modalTitle).toBeVisible()

    // Fecha clicando no backdrop (top-left, fora do conteúdo centrado do modal)
    await page.mouse.click(10, 10)
    await expect(modalTitle).not.toBeVisible()
  })

  test('modal A Pagar abre e fecha', async ({ page }) => {
    // StatCard label "A Pagar" — distingue do <h3> "A Pagar" da seção "Próximos vencimentos"
    const card = page.locator('.cursor-pointer').filter({
      has: page.locator('span.uppercase').filter({ hasText: /^A Pagar$/ }),
    })
    await card.click()

    // Modal title é h2, não h3 — garante que é o modal e não o heading da página
    const modalTitle = page.locator('h2').filter({ hasText: 'A Pagar' })
    await expect(modalTitle).toBeVisible()

    // Fecha pelo backdrop
    await page.mouse.click(10, 10)
    await expect(modalTitle).not.toBeVisible()
  })

  test('projeção abre painel de detalhes ao clicar em um mês', async ({ page }) => {
    const chips = page.locator('button').filter({ hasText: /jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez/i })
    const count = await chips.count()
    if (count === 0) return // sem projeções configuradas, pula

    await chips.first().click()
    await expect(page.locator('text=Saldo acumulado')).toBeVisible()
  })
})
