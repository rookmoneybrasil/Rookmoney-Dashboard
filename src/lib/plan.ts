import { db } from '@/lib/db'
import { isPro, FREE_LIMITS } from '@/lib/features'

export async function getUserPlan(userId: string): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } })
  return user?.plan ?? 'FREE'
}

/**
 * Checks if a free user has hit a resource limit.
 * Returns an error string if over limit, null if OK.
 */
export async function checkFreeLimit(
  userId: string,
  resource: keyof typeof FREE_LIMITS,
): Promise<string | null> {
  const plan = await getUserPlan(userId)
  if (isPro(plan)) return null

  const limit = FREE_LIMITS[resource]

  let count = 0
  if (resource === 'categories') {
    count = await db.category.count({ where: { userId } })
  } else if (resource === 'goals') {
    count = await db.goal.count({ where: { userId, isCompleted: false } })
  } else if (resource === 'budgets') {
    // count distinct categories with a budget this month
    const now   = new Date()
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    count = await db.budget.count({ where: { userId, month } })
  }

  if (count >= limit) {
    const names: Record<keyof typeof FREE_LIMITS, string> = {
      categories: 'categorias',
      goals:      'metas ativas',
      budgets:    'orçamentos',
    }
    return `Limite do plano gratuito atingido (${limit} ${names[resource]}). Faça upgrade para o plano Pro.`
  }

  return null
}
