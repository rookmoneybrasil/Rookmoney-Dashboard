'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { BillSchema } from '@/lib/validations/bill'
import { parseISO, addMonths, startOfMonth, endOfMonth } from 'date-fns'
import { randomUUID } from 'crypto'

export async function getBills(onlyPending = false) {
  const session = await getSession()
  if (!session) redirect('/login')

  const rows = await db.bill.findMany({
    where: {
      userId:  session.userId,
      ...(onlyPending ? { isPaid: false } : {}),
    },
    include: { category: true },
    orderBy: [{ isPaid: 'asc' }, { dueDate: 'asc' }],
  })

  return rows.map((b) => ({
    id:                 b.id,
    name:               b.name,
    amount:             Number(b.amount),
    dueDate:            b.dueDate.toISOString(),
    isPaid:             b.isPaid,
    isRecurring:        b.isRecurring,
    notes:              b.notes,
    categoryId:         b.categoryId,
    installmentTotal:   b.installmentTotal,
    installmentCurrent: b.installmentCurrent,
    installmentGroupId: b.installmentGroupId,
    category:           b.category
      ? { id: b.category.id, name: b.category.name, icon: b.category.icon, color: b.category.color }
      : null,
  }))
}

export async function createBill(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = {
    name:         formData.get('name'),
    amount:       formData.get('amount'),
    dueDate:      formData.get('dueDate'),
    isRecurring:  formData.get('isRecurring') === 'true',
    notes:        formData.get('notes')      || undefined,
    categoryId:   formData.get('categoryId') || undefined,
    installments: formData.get('installments') || 1,
  }

  const validated = BillSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.flatten().formErrors[0] ?? 'Dados inválidos.' }
  }

  const { installments, dueDate: dueDateStr, ...rest } = validated.data
  const baseDate = parseISO(dueDateStr)

  if (installments > 1) {
    const groupId        = randomUUID()
    const perInstallment = Math.round((rest.amount / installments) * 100) / 100
    await db.bill.createMany({
      data: Array.from({ length: installments }, (_, i) => ({
        ...rest,
        amount:             perInstallment,
        dueDate:            addMonths(baseDate, i),
        userId:             session.userId,
        categoryId:         rest.categoryId || null,
        installmentTotal:   installments,
        installmentCurrent: i + 1,
        installmentGroupId: groupId,
      })),
    })
  } else {
    await db.bill.create({
      data: {
        ...rest,
        dueDate:    baseDate,
        userId:     session.userId,
        categoryId: rest.categoryId || null,
      },
    })
  }

  revalidatePath('/bills')
  revalidatePath('/dashboard')
  return {}
}

export async function updateBill(
  id: string,
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = {
    name:        formData.get('name'),
    amount:      formData.get('amount'),
    dueDate:     formData.get('dueDate'),
    isRecurring: formData.get('isRecurring') === 'true',
    notes:       formData.get('notes')      || undefined,
    categoryId:  formData.get('categoryId') || undefined,
  }

  const validated = BillSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.flatten().formErrors[0] ?? 'Dados inválidos.' }
  }

  // installments is not a Bill column — drop it before building the update payload
  const { installments, dueDate: dueDateStr, ...fields } = validated.data
  void installments

  await db.bill.updateMany({
    where: { id, userId: session.userId },
    data: {
      ...fields,
      dueDate:    parseISO(dueDateStr),
      categoryId: fields.categoryId || null,
    },
  })

  revalidatePath('/bills')
  revalidatePath('/dashboard')
  return {}
}

export async function markBillPaid(id: string, paid: boolean) {
  const session = await getSession()
  if (!session) redirect('/login')

  const bill = await db.bill.findFirst({ where: { id, userId: session.userId } })
  if (!bill) return

  if (paid) {
    // ── Resolve categoryId ──────────────────────────────────────────
    let categoryId = bill.categoryId
    if (!categoryId) {
      const fallback = await db.category.findFirst({
        where:   { OR: [{ isDefault: true }, { userId: session.userId }] },
        orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      })
      categoryId = fallback?.id ?? null
    }

    // ── Create EXPENSE transaction ──────────────────────────────────
    let paidTransactionId: string | null = null
    if (categoryId) {
      const tx = await db.transaction.create({
        data: {
          amount:      bill.amount,
          type:        'EXPENSE',
          description: bill.installmentTotal
            ? `${bill.name} (${bill.installmentCurrent}/${bill.installmentTotal})`
            : bill.name,
          date:        new Date(),
          userId:      session.userId,
          categoryId,
        },
      })
      paidTransactionId = tx.id
    }

    await db.bill.update({
      where: { id },
      data:  { isPaid: true, paidAt: new Date(), paidTransactionId },
    })

    // ── Auto-spawn next month for recurring bills ───────────────────
    if (bill.isRecurring && !bill.installmentGroupId) {
      const nextDue = addMonths(new Date(bill.dueDate), 1)
      const existing = await db.bill.findFirst({
        where: {
          userId:      session.userId,
          name:        bill.name,
          isRecurring: true,
          dueDate:     { gte: startOfMonth(nextDue), lte: endOfMonth(nextDue) },
        },
      })
      if (!existing) {
        await db.bill.create({
          data: {
            name:        bill.name,
            amount:      bill.amount,
            dueDate:     nextDue,
            isRecurring: true,
            notes:       bill.notes,
            userId:      session.userId,
            categoryId:  bill.categoryId,
          },
        })
      }
    }
  } else {
    // ── Unmark paid — delete the auto-transaction if it exists ──────
    if (bill.paidTransactionId) {
      await db.transaction.deleteMany({
        where: { id: bill.paidTransactionId, userId: session.userId },
      })
    }
    await db.bill.update({
      where: { id },
      data:  { isPaid: false, paidAt: null, paidTransactionId: null },
    })
  }

  revalidatePath('/bills')
  revalidatePath('/dashboard')
  revalidatePath('/transactions')
}

export async function deleteBill(id: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.bill.deleteMany({ where: { id, userId: session.userId } })

  revalidatePath('/bills')
  revalidatePath('/dashboard')
}

export async function deleteBillGroup(groupId: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.bill.deleteMany({
    where: { installmentGroupId: groupId, userId: session.userId, isPaid: false },
  })

  revalidatePath('/bills')
  revalidatePath('/dashboard')
}

export async function deleteInstallmentGroup(groupId: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.bill.deleteMany({
    where: { installmentGroupId: groupId, userId: session.userId },
  })

  revalidatePath('/bills')
  revalidatePath('/dashboard')
}
