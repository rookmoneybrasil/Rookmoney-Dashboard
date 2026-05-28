import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const ADMIN_EMAIL    = 'admin@rook.local'
const ADMIN_NAME     = 'Admin'
const ADMIN_PASSWORD = 'Admin@123'

async function main() {
  const existing = await db.user.findUnique({ where: { email: ADMIN_EMAIL } })

  if (existing) {
    console.log(`Usuário já existe: ${ADMIN_EMAIL}`)
    console.log(`Senha: ${ADMIN_PASSWORD}`)
    return
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12)

  await db.user.create({
    data: {
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL,
      password: hash,
    },
  })

  console.log('✓ Admin criado com sucesso!')
  console.log(`  E-mail: ${ADMIN_EMAIL}`)
  console.log(`  Senha:  ${ADMIN_PASSWORD}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
