export type Plan = 'FREE' | 'PRO'

export interface PlanLimits {
  transactionsPerMonth: number | null
  bills:                number | null
  goals:                number | null
  people:               number | null
  customCategories:     number | null
  recurring:            number | null
  budget:               boolean
  reports:              boolean
  projection:           boolean
  import:               boolean
  chat:                 number | null
  scanner:              number | null
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  FREE: {
    transactionsPerMonth: 50,
    bills:                5,
    goals:                2,
    people:               2,
    customCategories:     3,
    recurring:            2,
    budget:               false,
    reports:              false,
    projection:           false,
    import:               false,
    chat:                 null,
    scanner:              null,
  },
  PRO: {
    transactionsPerMonth: null,
    bills:                null,
    goals:                null,
    people:               null,
    customCategories:     null,
    recurring:            null,
    budget:               true,
    reports:              true,
    projection:           true,
    import:               true,
    chat:                 30,
    scanner:              20,
  },
}

export function isPro(plan?: string | null) {
  return plan === 'PRO'
}

export function getLimits(plan?: string | null): PlanLimits {
  return PLAN_LIMITS[plan as Plan] ?? PLAN_LIMITS.FREE
}

export function usagePercent(used: number, limit: number | null): number {
  if (limit === null) return 0
  return Math.min(Math.round((used / limit) * 100), 100)
}
