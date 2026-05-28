import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter } as never)

async function main() {
  const email = 'admin@rookmoney.com'
  const existing = await db.user.findUnique({ where: { email } })
  if (existing) {
    console.log('✓ Usuário já existe:', existing.email)
    return
  }
  const hash = await bcrypt.hash('admin123', 10)
  const user = await db.user.create({
    data: { name: 'Admin', email, password: hash, hasOnboarded: true },
  })
  console.log('✓ Usuário criado:', user.email)
}

main().catch(console.error).finally(() => db.$disconnect())
