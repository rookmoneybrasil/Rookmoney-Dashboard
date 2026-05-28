import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const db = new PrismaClient({ adapter })

const DEFAULT_CATEGORIES = [
  { name: 'Moradia',       icon: '🏠', color: '#3B82F6', isDefault: true },
  { name: 'Alimentação',   icon: '🍔', color: '#F59E0B', isDefault: true },
  { name: 'Transporte',    icon: '🚗', color: '#06B6D4', isDefault: true },
  { name: 'Saúde',         icon: '❤️',  color: '#F43F5E', isDefault: true },
  { name: 'Educação',      icon: '📚', color: '#8B5CF6', isDefault: true },
  { name: 'Lazer',         icon: '🎮', color: '#EC4899', isDefault: true },
  { name: 'Vestuário',     icon: '👕', color: '#84CC16', isDefault: true },
  { name: 'Tecnologia',    icon: '💻', color: '#14B8A6', isDefault: true },
  { name: 'Finanças',      icon: '📊', color: '#6366F1', isDefault: true },
  { name: 'Outros',        icon: '📦', color: '#78716C', isDefault: true },
  { name: 'Salário',       icon: '💼', color: '#22C55E', isDefault: true },
  { name: 'Freelance',     icon: '🖥️',  color: '#10B981', isDefault: true },
  { name: 'Investimentos', icon: '📈', color: '#34D399', isDefault: true },
  { name: 'Presente',      icon: '🎁', color: '#6EE7B7', isDefault: true },
  { name: 'Renda extra',   icon: '💰', color: '#A7F3D0', isDefault: true },
]

async function main() {
  const existing = await db.category.count({ where: { isDefault: true } })

  if (existing > 0) {
    console.log(`Skipping seed — ${existing} default categories already exist.`)
    return
  }

  await db.category.createMany({ data: DEFAULT_CATEGORIES })
  console.log(`✓ Seeded ${DEFAULT_CATEGORIES.length} default categories.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())
