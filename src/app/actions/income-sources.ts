'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

const Schema = z.object({
  name:        z.string().min(2).max(100),
  type:        z.enum(['EMPLOYMENT', 'FREELANCE', 'RENTAL', 'OTHER']),
  amount:      z.coerce.number().positive(),
  isRecurring: z.coerce.boolean().default(true),
  dayOfMonth:  z.coerce.number().int().min(1).max(31).optional().nullable(),
  categoryId:  z.string().optional().nullable(),
  notes:       z.string().max(500).optional(),
})

export async function getIncomeSources() {
  const session = await getSession()
  if (!session) redirect('/login')

  const rows = await db.incomeSource.findMany({
    where: { userId: session.userId },
    orderBy: [{ isRecurring: 'desc' }, { name: 'asc' }],
  })

  return rows.map((r) => ({
    id:          r.id,
    name:        r.name,
    type:        r.type,
    amount:      Number(r.amount),
    isRecurring: r.isRecurring,
    dayOfMonth:  r.dayOfMonth,
    categoryId:  r.categoryId,
    notes:       r.notes,
  }))
}

export async function createIncomeSource(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = {
    name:        formData.get('name'),
    type:        formData.get('type'),
    amount:      formData.get('amount'),
    isRecurring: formData.get('isRecurring') === 'true',
    dayOfMonth:  formData.get('dayOfMonth') || null,
    categoryId:  formData.get('categoryId') || null,
    notes:       formData.get('notes') || undefined,
  }

  const parsed = Schema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().formErrors[0] ?? 'Dados inválidos.' }

  await db.incomeSource.create({
    data: { ...parsed.data, userId: session.userId, dayOfMonth: parsed.data.dayOfMonth ?? null, categoryId: parsed.data.categoryId ?? null },
  })

  revalidatePath('/income')
  return {}
}

export async function updateIncomeSource(
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
    isRecurring: formData.get('isRecurring') === 'true',
    dayOfMonth:  formData.get('dayOfMonth') || null,
    categoryId:  formData.get('categoryId') || null,
    notes:       formData.get('notes') || undefined,
  }

  const parsed = Schema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.flatten().formErrors[0] ?? 'Dados inválidos.' }

  await db.incomeSource.updateMany({
    where: { id, userId: session.userId },
    data:  { ...parsed.data, dayOfMonth: parsed.data.dayOfMonth ?? null, categoryId: parsed.data.categoryId ?? null },
  })

  revalidatePath('/income')
  return {}
}

export async function deleteIncomeSource(id: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  const src = await db.incomeSource.findFirst({ where: { id, userId: session.userId }, select: { name: true } })
  if (!src) return

  // Delete all income transactions that came from this source (matched by description)
  await db.transaction.deleteMany({
    where: { userId: session.userId, type: 'INCOME', description: src.name },
  })
  await db.incomeSource.deleteMany({ where: { id, userId: session.userId } })
  revalidatePath('/income')
  revalidatePath('/dashboard')
  revalidatePath('/transactions')
}

export async function registerReceipt(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const amount      = Number(formData.get('amount'))
  const date        = formData.get('date') as string
  const categoryId  = formData.get('categoryId') as string
  const description = formData.get('description') as string
  const sourceId    = formData.get('sourceId') as string | null

  if (!amount || amount <= 0) return { error: 'Valor inválido.' }
  if (!categoryId) return { error: 'Selecione uma categoria.' }

  const now       = new Date()
  const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const ops: Promise<unknown>[] = [
    db.transaction.create({
      data: {
        amount,
        type:        'INCOME',
        description: description || null,
        date:        new Date(date),
        userId:      session.userId,
        categoryId,
      },
    }),
  ]

  // Mark income source as received this month so it moves to Histórico
  if (sourceId) {
    ops.push(
      db.incomeSource.update({
        where: { id: sourceId, userId: session.userId },
        data:  { lastAutoPayMonth: yearMonth },
      })
    )
  }

  await Promise.all(ops)

  revalidatePath('/income')
  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  return {}
}

export async function processAutoIncome(userId: string) {
  const now        = new Date()
  const today      = now.getDate()
  const yearMonth  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const sources = await db.incomeSource.findMany({
    where: {
      userId,
      isRecurring: true,
      dayOfMonth:  { not: null },
      categoryId:  { not: null },
    },
  })

  for (const source of sources) {
    if (source.lastAutoPayMonth === yearMonth) continue
    if (today < source.dayOfMonth!) continue

    await db.$transaction([
      db.transaction.create({
        data: {
          amount:      source.amount,
          type:        'INCOME',
          description: source.name,
          date:        new Date(now.getFullYear(), now.getMonth(), source.dayOfMonth!),
          userId,
          categoryId:  source.categoryId!,
        },
      }),
      db.incomeSource.update({
        where: { id: source.id },
        data:  { lastAutoPayMonth: yearMonth },
      }),
    ])
  }
}
