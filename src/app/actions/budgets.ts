'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { BudgetSchema } from '@/lib/validations/budget'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { checkFreeLimit } from '@/lib/plan'

export async function getBudgets(month?: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  const targetMonth = month ?? format(new Date(), 'yyyy-MM')

  const [budgets, transactions, bills] = await Promise.all([
    db.budget.findMany({
      where:   { userId: session.userId, month: targetMonth },
      include: { category: true },
    }),
    db.transaction.findMany({
      where: {
        userId: session.userId,
        type:   'EXPENSE',
        date:   {
          gte: startOfMonth(new Date(targetMonth + '-01')),
          lte: endOfMonth(new Date(targetMonth + '-01')),
        },
      },
    }),
    db.bill.findMany({
      where: {
        userId:  session.userId,
        dueDate: {
          gte: startOfMonth(new Date(targetMonth + '-01')),
          lte: endOfMonth(new Date(targetMonth + '-01')),
        },
      },
    }),
  ])

  // Build spending map per category
  const spentMap: Record<string, number> = {}
  for (const tx of transactions) {
    spentMap[tx.categoryId] = (spentMap[tx.categoryId] ?? 0) + Number(tx.amount)
  }
  for (const bill of bills) {
    if (bill.categoryId) {
      spentMap[bill.categoryId] = (spentMap[bill.categoryId] ?? 0) + Number(bill.amount)
    }
  }

  return budgets.map((b) => ({
    id:         b.id,
    month:      b.month,
    categoryId: b.categoryId,
    amount:     Number(b.amount),
    spent:      spentMap[b.categoryId] ?? 0,
    category: {
      name:  b.category.name,
      icon:  b.category.icon,
      color: b.category.color,
    },
  }))
}

export async function setBudget(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  // Only count as a new budget if this category+month combo doesn't exist yet
  const validated = BudgetSchema.safeParse({
    categoryId: formData.get('categoryId'),
    amount:     formData.get('amount'),
    month:      formData.get('month'),
  })
  if (!validated.success) {
    return { error: validated.error.flatten().formErrors[0] ?? 'Dados inválidos.' }
  }

  const existing = await db.budget.findFirst({
    where: { userId: session.userId, categoryId: validated.data.categoryId, month: validated.data.month },
  })
  if (!existing) {
    const limitErr = await checkFreeLimit(session.userId, 'budgets')
    if (limitErr) return { error: limitErr }
  }

  await db.budget.upsert({
    where: {
      userId_categoryId_month: {
        userId:     session.userId,
        categoryId: validated.data.categoryId,
        month:      validated.data.month,
      },
    },
    update: { amount: validated.data.amount },
    create: { ...validated.data, userId: session.userId },
  })

  revalidatePath('/budget')
  return {}
}

export async function deleteBudget(id: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.budget.deleteMany({ where: { id, userId: session.userId } })

  revalidatePath('/budget')
}
