import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

async function main() {
  const user = await db.user.update({
    where: { email: 'e2e@rookmoney.com' },
    data: { hasOnboarded: true },
    select: { id: true, email: true, hasOnboarded: true },
  })
  console.log('Test user updated:', user)
}

main().catch(console.error).finally(() => db.$disconnect())
