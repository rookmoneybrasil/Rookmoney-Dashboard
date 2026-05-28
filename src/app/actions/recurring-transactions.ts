'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

const Schema = z.object({
  name:       z.string().min(2).max(100),
  type:       z.enum(['INCOME', 'EXPENSE']),
  amount:     z.coerce.number().positive(),
  categoryId: z.string().min(1),
  frequency:  z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']).default('MONTHLY'),
  dayOfMonth: z.coerce.number().int().min(1).max(31).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
})

export async function getRecurringTransactions() {
  const session = await getSession()
  if (!session) redirect('/login')

  const rows = await db.recurringTransaction.findMany({
    where:   { userId: session.userId },
    include: { category: true },
    orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
  })

  return rows.map((r) => ({
    id:            r.id,
    name:          r.name,
    amount:        Number(r.amount),
    type:          r.type,
    frequency:     r.frequency,
    dayOfMonth:    r.dayOfMonth,
    description:   r.description,
    isActive:      r.isActive,
    lastAutoMonth: r.lastAutoMonth,
    categoryId:    r.categoryId,
    category:      { id: r.category.id, name: r.category.name, icon: r.category.icon, color: r.category.color },
  }))
}

export async function createRecurringTransaction(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = {
    name:        formData.get('name'),
    type:        formData.get('type'),
    amount:      formData.get('amount'),
    categoryId:  formData.get('categoryId'),
    frequency:   formData.get('frequency') || 'MONTHLY',
    dayOfMonth:  formData.get('dayOfMonth') || null,
    description: formData.get('description') || null,
  }

  const parsed = Schema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().formErrors[0] ?? 'Dados inválidos.' }

  await db.recurringTransaction.create({
    data: {
      ...parsed.data,
      dayOfMonth:  parsed.data.dayOfMonth ?? null,
      description: parsed.data.description ?? null,
      userId:      session.userId,
    },
  })

  revalidatePath('/recurring')
  return {}
}

export async function updateRecurringTransaction(
  id: string,
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = {
    name:        formData.get('name'),
    type:        formData.get('type'),
    amount:      formData.get('amount'),
    categoryId:  formData.get('categoryId'),
    frequency:   formData.get('frequency') || 'MONTHLY',
    dayOfMonth:  formData.get('dayOfMonth') || null,
    description: formData.get('description') || null,
  }

  const parsed = Schema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().formErrors[0] ?? 'Dados inválidos.' }

  await db.recurringTransaction.updateMany({
    where: { id, userId: session.userId },
    data:  {
      ...parsed.data,
      dayOfMonth:  parsed.data.dayOfMonth ?? null,
      description: parsed.data.description ?? null,
    },
  })

  revalidatePath('/recurring')
  return {}
}

export async function deleteRecurringTransaction(id: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.recurringTransaction.deleteMany({ where: { id, userId: session.userId } })
  revalidatePath('/recurring')
}

export async function toggleRecurringTransaction(id: string, isActive: boolean) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.recurringTransaction.updateMany({
    where: { id, userId: session.userId },
    data:  { isActive },
  })
  revalidatePath('/recurring')
}

export async function processAutoRecurring(userId: string) {
  const now       = new Date()
  const today     = now.getDate()
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const recurrings = await db.recurringTransaction.findMany({
    where: { userId, isActive: true },
  })

  for (const rec of recurrings) {
    if (rec.lastAutoMonth === yearMonth) continue

    // For MONTHLY, only run when dayOfMonth has passed (if set)
    if (rec.frequency === 'MONTHLY' && rec.dayOfMonth !== null) {
      if (today < rec.dayOfMonth) continue
    }

    // For WEEKLY / YEARLY, just run once per month (yearMonth guard is sufficient)
    await db.$transaction([
      db.transaction.create({
        data: {
          amount:      rec.amount,
          type:        rec.type,
          description: rec.name,
          date:        rec.frequency === 'MONTHLY' && rec.dayOfMonth
            ? new Date(now.getFullYear(), now.getMonth(), rec.dayOfMonth)
            : now,
          userId,
          categoryId:  rec.categoryId,
        },
      }),
      db.recurringTransaction.update({
        where: { id: rec.id },
        data:  { lastAutoMonth: yearMonth },
      }),
    ])
  }
}
