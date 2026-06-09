import { test as setup, expect } from '@playwright/test'
import path from 'path'

export const STORAGE_STATE = path.join(__dirname, '../.auth/session.json')

setup('autenticar usuário de teste', async ({ page }) => {
  const email    = process.env.TEST_EMAIL    ?? ''
  const password = process.env.TEST_PASSWORD ?? ''

  if (!email || !password) throw new Error('TEST_EMAIL e TEST_PASSWORD precisam estar definidos em .env.test')

  await page.goto('/pt/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')

  // Aguarda redirecionamento para o dashboard
  await page.waitForURL('**/dashboard', { timeout: 15_000 })
  await expect(page).toHaveURL(/dashboard/)

  // Salva o cookie de sessão para reutilizar nos testes
  await page.context().storageState({ path: STORAGE_STATE })
})
