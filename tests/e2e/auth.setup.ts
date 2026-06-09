import { test as setup } from '@playwright/test'
import { SignJWT } from 'jose'
import { Client } from 'pg'
import { STORAGE_STATE } from './constants'

// Cria sessão diretamente via JWT — sem depender de server action nem aguardar compilação
setup('autenticar usuário de teste', async ({ page }) => {
  const email     = process.env.TEST_EMAIL    ?? ''
  const dbUrl     = process.env.DATABASE_URL  ?? ''
  const jwtSecret = process.env.JWT_SECRET    ?? 'rook-dev-secret-replace-in-production'

  if (!email || !dbUrl) throw new Error('TEST_EMAIL e DATABASE_URL precisam estar definidos em .env.test')

  // 1. Busca o usuário direto no banco e garante que hasOnboarded=true
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()
  const { rows } = await client.query<{ id: string; name: string; email: string }>(
    'SELECT id, name, email FROM "User" WHERE email = $1 LIMIT 1',
    [email]
  )
  if (!rows[0]) { await client.end(); throw new Error(`Usuário de teste ${email} não encontrado no banco`) }

  // Garante onboarding concluído para ir direto ao dashboard
  await client.query('UPDATE "User" SET "hasOnboarded" = true WHERE email = $1', [email])
  await client.end()
  const user = rows[0]

  // 2. Cria JWT com o mesmo segredo que o servidor dev usa
  const SECRET = new TextEncoder().encode(jwtSecret)
  const token = await new SignJWT({ userId: user.id, name: user.name, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(SECRET)

  // 3. Seta cookie diretamente — sem navegar para nenhuma página (evita compilação lenta)
  await page.context().addCookies([{
    name:     'rook_session',
    value:    token,
    domain:   'localhost',
    path:     '/',
    httpOnly: true,
    sameSite: 'Lax',
  }])

  // 4. Salva estado (os testes individuais verificam o acesso ao dashboard)
  await page.context().storageState({ path: STORAGE_STATE })
})
