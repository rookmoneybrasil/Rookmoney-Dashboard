'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { parseISO, addMonths } from 'date-fns'
import { randomUUID } from 'crypto'
import { IncomeSourceType } from '@/generated/prisma/client'

export async function createOnboardingIncome(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const name        = (formData.get('name') as string)?.trim()
  const amount      = Number(formData.get('amount'))
  const type        = (formData.get('type') as string) || 'EMPLOYMENT'
  const isRecurring = formData.get('isRecurring') !== 'false'
  const dayOfMonth  = parseInt(formData.get('dayOfMonth') as string) || null
  const startDate   = (formData.get('startDate') as string)?.trim() || null

  if (!name || name.length < 2) return { error: 'Nome muito curto.' }
  if (!amount || amount <= 0)   return { error: 'Valor inválido.' }

  const validTypes = Object.values(IncomeSourceType)
  const safeType   = validTypes.includes(type as IncomeSourceType) ? (type as IncomeSourceType) : IncomeSourceType.EMPLOYMENT

  await db.incomeSource.create({
    data: {
      name,
      amount,
      type:        safeType,
      isRecurring,
      dayOfMonth:  dayOfMonth && dayOfMonth >= 1 && dayOfMonth <= 31 ? dayOfMonth : null,
      startDate:   startDate ? new Date(startDate) : null,
      userId:      session.userId,
    },
  })

  revalidatePath('/income')
  return {}
}

export async function createOnboardingGoal(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const name         = (formData.get('name') as string)?.trim()
  const targetAmount = Number(formData.get('targetAmount'))

  if (!name || name.length < 2) return { error: 'Nome muito curto.' }
  if (!targetAmount || targetAmount <= 0) return { error: 'Valor inválido.' }

  await db.goal.create({
    data: { name, targetAmount, currentAmount: 0, userId: session.userId },
  })

  revalidatePath('/goals')
  return {}
}

export async function createOnboardingBill(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const name         = (formData.get('name') as string)?.trim()
  const amount       = Number(formData.get('amount'))
  const mode         = (formData.get('mode') as string) || 'avulso'
  const dueDateStr   = (formData.get('dueDate') as string)?.trim()
  const dayOfMonth   = parseInt(formData.get('dayOfMonth') as string) || 1
  const installments = parseInt(formData.get('installments') as string) || 1
  const alreadyPaid  = parseInt(formData.get('alreadyPaid') as string)  || 0

  if (!name || name.length < 2) return { error: 'Nome muito curto.' }
  if (!amount || amount <= 0)   return { error: 'Valor inválido.' }

  if (mode === 'recorrente') {
    if (dayOfMonth < 1 || dayOfMonth > 28) return { error: 'Dia deve ser entre 1 e 28.' }

    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const dueDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth)

    await db.recurringBill.create({
      data: {
        name,
        amount,
        dayOfMonth,
        userId: session.userId,
        lastAutoMonth: thisMonth,
      },
    })

    await db.bill.create({
      data: {
        name,
        amount,
        dueDate,
        isRecurring: false,
        userId: session.userId,
      },
    })
  } else {
    if (!dueDateStr?.match(/^\d{4}-\d{2}-\d{2}$/)) return { error: 'Data inválida.' }
    const baseDate = parseISO(dueDateStr)

    if (mode === 'parcelado' && installments > 1) {
      const remaining = installments - alreadyPaid
      const groupId = randomUUID()
      await db.bill.createMany({
        data: Array.from({ length: remaining }, (_, i) => ({
          name,
          amount,
          dueDate:            addMonths(baseDate, i),
          isRecurring:        false,
          userId:             session.userId,
          installmentTotal:   installments,
          installmentCurrent: alreadyPaid + i + 1,
          installmentGroupId: groupId,
        })),
      })
    } else {
      await db.bill.create({
        data: {
          name,
          amount,
          dueDate: baseDate,
          isRecurring: false,
          userId: session.userId,
        },
      })
    }
  }

  revalidatePath('/bills')
  revalidatePath('/dashboard')
  return {}
}

export async function markOnboarded() {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.user.update({
    where: { id: session.userId },
    data:  { hasOnboarded: true },
  })

  redirect('/dashboard')
}
