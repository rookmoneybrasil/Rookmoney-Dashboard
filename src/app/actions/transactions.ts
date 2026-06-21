'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { TransactionSchema } from '@/lib/validations/transaction'
import { parseISO } from 'date-fns'

export type TransactionFilter = {
  month?: string   // 'YYYY-MM'
  type?:  'INCOME' | 'EXPENSE' | 'ALL'
  categoryId?: string
  search?: string
  page?: number
  pageSize?: number
}

export type TransactionPage = {
  items: Awaited<ReturnType<typeof db.transaction.findMany<{ include: { category: true } }>>>
  total: number
  page: number
  totalPages: number
}

export async function getTransactions(filter: TransactionFilter = {}): Promise<TransactionPage> {
  const session = await getSession()
  if (!session) redirect('/login')

  const { month, type, categoryId, search, page = 1, pageSize = 20 } = filter

  const where: Record<string, unknown> = { userId: session.userId }

  if (month) {
    const [year, m] = month.split('-').map(Number)
    const start = new Date(year, m - 1, 1)
    const end   = new Date(year, m, 0, 23, 59, 59)
    where.date  = { gte: start, lte: end }
  }

  if (type && type !== 'ALL') where.type = type
  if (categoryId) where.categoryId = categoryId
  if (search) {
    where.description = { contains: search, mode: 'insensitive' }
  }

  const [items, total] = await Promise.all([
    db.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.transaction.count({ where }),
  ])

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function createTransaction(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = {
    amount:      formData.get('amount'),
    type:        formData.get('type'),
    description: formData.get('description') || undefined,
    date:        formData.get('date'),
    categoryId:  formData.get('categoryId'),
  }

  const validated = TransactionSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.flatten().formErrors[0] ?? 'Dados inválidos.' }
  }

  await db.transaction.create({
    data: {
      ...validated.data,
      date:   parseISO(validated.data.date),
      userId: session.userId,
    },
  })

  revalidatePath('/dashboard')
  revalidatePath('/transactions')
  revalidatePath('/reports')
  return {}
}

export async function deleteTransaction(id: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.transaction.deleteMany({ where: { id, userId: session.userId } })

  revalidatePath('/dashboard')
  revalidatePath('/transactions')
  revalidatePath('/reports')
}

export async function updateTransaction(
  id: string,
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = {
    amount:      formData.get('amount'),
    type:        formData.get('type'),
    description: formData.get('description') || undefined,
    date:        formData.get('date'),
    categoryId:  formData.get('categoryId'),
  }

  const validated = TransactionSchema.safeParse(raw)
  if (!validated.success) {
    return { error: 'Dados inválidos.' }
  }

  await db.transaction.updateMany({
    where: { id, userId: session.userId },
    data:  { ...validated.data, date: parseISO(validated.data.date) },
  })

  revalidatePath('/dashboard')
  revalidatePath('/transactions')
  revalidatePath('/reports')
  return {}
}
