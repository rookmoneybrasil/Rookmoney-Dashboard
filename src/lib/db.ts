import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient() {
  const url = process.env.DATABASE_URL!
  const isRemote = !url.includes('localhost') && !url.includes('127.0.0.1')
  const adapter = new PrismaPg({
    connectionString: url,
    ...(isRemote ? { ssl: { rejectUnauthorized: false } } : {}),
  })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

export const db =
  process.env.NODE_ENV === 'production'
    ? (globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient()))
    : createPrismaClient()
