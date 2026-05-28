import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }

// In development, never cache — avoids stale client after `prisma generate`
export const db =
  process.env.NODE_ENV === 'production'
    ? (globalForPrisma.prisma ?? (globalForPrisma.prisma = createPrismaClient()))
    : createPrismaClient()
