import { test, expect } from '@playwright/test'
import { STORAGE_STATE } from './auth.setup'

test.use({ storageState: STORAGE_STATE })

// Smoke test: verifica que cada página carrega sem crash (sem erro 500 / tela em branco)
const pages = [
  { name: 'Dashboard',    path: '/pt/dashboard' },
  { name: 'Contas',       path: '/pt/bills' },
  { name: 'Transações',   path: '/pt/transactions' },
  { name: 'Metas',        path: '/pt/goals' },
  { name: 'Orçamento',    path: '/pt/budget' },
  { name: 'Relatórios',   path: '/pt/reports' },
  { name: 'Pessoas',      path: '/pt/people' },
  { name: 'Rendas',       path: '/pt/income' },
  { name: 'Recorrências', path: '/pt/recurring' },
  { name: 'Configurações',path: '/pt/settings' },
]

for (const { name, path } of pages) {
  test(`${name} — carrega sem erro`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    const response = await page.goto(path)
    await page.waitForLoadState('networkidle')

    // Não pode ser 500 nem redirecionar para login (sessão válida)
    expect(response?.status()).not.toBe(500)
    await expect(page).not.toHaveURL(/login/)

    // Sem erros de JS não tratados
    expect(errors).toHaveLength(0)
  })
}
