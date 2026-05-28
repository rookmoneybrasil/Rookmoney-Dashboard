'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { GoalSchema, GoalContributionSchema } from '@/lib/validations/goal'
import { parseISO } from 'date-fns'
import { checkFreeLimit } from '@/lib/plan'

export async function getGoals(includeCompleted = false) {
  const session = await getSession()
  if (!session) redirect('/login')

  return db.goal.findMany({
    where: {
      userId:      session.userId,
      isCompleted: includeCompleted ? undefined : false,
    },
    include: {
      contributions: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createGoal(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = {
    name:          formData.get('name'),
    targetAmount:  formData.get('targetAmount'),
    currentAmount: formData.get('currentAmount') || '0',
    deadline:      formData.get('deadline') || undefined,
    description:   formData.get('description') || undefined,
    icon:          formData.get('icon')  || undefined,
    color:         formData.get('color') || undefined,
  }

  const limitErr = await checkFreeLimit(session.userId, 'goals')
  if (limitErr) return { error: limitErr }

  const validated = GoalSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.flatten().formErrors[0] ?? 'Dados inválidos.' }
  }

  await db.goal.create({
    data: {
      ...validated.data,
      deadline: validated.data.deadline ? parseISO(validated.data.deadline) : null,
      userId:   session.userId,
    },
  })

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return {}
}

export async function addContribution(
  goalId: string,
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = { amount: formData.get('amount') }
  const validated = GoalContributionSchema.safeParse(raw)
  if (!validated.success) return { error: 'Valor inválido.' }

  const goal = await db.goal.findFirst({ where: { id: goalId, userId: session.userId } })
  if (!goal) return { error: 'Meta não encontrada.' }

  const newAmount  = Number(goal.currentAmount) + validated.data.amount
  const isComplete = newAmount >= Number(goal.targetAmount)

  await db.$transaction([
    db.goal.update({
      where: { id: goalId },
      data:  {
        currentAmount: newAmount,
        isCompleted:   isComplete,
        completedAt:   isComplete ? new Date() : null,
      },
    }),
    db.goalContribution.create({
      data: { goalId, amount: validated.data.amount },
    }),
  ])

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return {}
}

export async function updateGoal(
  id: string,
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = {
    name:          formData.get('name'),
    targetAmount:  formData.get('targetAmount'),
    currentAmount: formData.get('currentAmount') || '0',
    deadline:      formData.get('deadline') || undefined,
    description:   formData.get('description') || undefined,
    icon:          formData.get('icon')  || undefined,
    color:         formData.get('color') || undefined,
  }

  const validated = GoalSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.flatten().formErrors[0] ?? 'Dados inválidos.' }
  }

  await db.goal.updateMany({
    where: { id, userId: session.userId },
    data:  {
      ...validated.data,
      deadline: validated.data.deadline ? parseISO(validated.data.deadline) : null,
    },
  })

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteGoal(id: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.goal.deleteMany({ where: { id, userId: session.userId } })

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}
