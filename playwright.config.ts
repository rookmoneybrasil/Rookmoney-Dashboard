import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'
import path from 'path'

// Carrega .env.test explicitamente antes de tudo
config({ path: path.resolve(__dirname, '.env.test') })

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,           // 1 worker evita race condition entre specs que compartilham o banco
  retries: 1,
  timeout: 120_000,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'pt-BR',
  },

  // Passa env vars explicitamente — garante que Next.js não sobrescreve com .env local
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      DATABASE_URL:  process.env.DATABASE_URL  ?? '',
      API_URL:       process.env.API_URL       ?? '',
      JWT_SECRET:    process.env.JWT_SECRET    ?? 'rook-dev-secret-replace-in-production',
      TEST_EMAIL:    process.env.TEST_EMAIL    ?? '',
      TEST_PASSWORD: process.env.TEST_PASSWORD ?? '',
      NODE_ENV:      'development',
    },
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
})
