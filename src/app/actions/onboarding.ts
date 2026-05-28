'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function createOnboardingIncome(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const name   = (formData.get('name') as string)?.trim()
  const amount = Number(formData.get('amount'))

  if (!name || name.length < 2) return { error: 'Nome muito curto.' }
  if (!amount || amount <= 0)   return { error: 'Valor inválido.' }

  await db.incomeSource.create({
    data: {
      name,
      amount,
      type:        'EMPLOYMENT',
      isRecurring: true,
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

export async function markOnboarded() {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.user.update({
    where: { id: session.userId },
    data:  { hasOnboarded: true },
  })

  redirect('/dashboard')
}
