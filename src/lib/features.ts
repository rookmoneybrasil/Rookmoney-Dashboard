export function isPro(plan: string): boolean {
  return plan === 'PRO'
}

export const FREE_LIMITS = {
  categories: 10,
  goals:       5,
  budgets:     5,
}

export const PRO_FEATURES = [
  'Relatórios avançados',
  'Export PDF/CSV',
  'Suporte prioritário',
  'Histórico ilimitado',
  'API de integração',
]
