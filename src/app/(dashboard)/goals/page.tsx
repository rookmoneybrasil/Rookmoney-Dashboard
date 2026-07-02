import { serverApi } from '@/lib/api-client'
import { GoalModal } from '@/components/goals/goal-modal'
import { GoalsList } from '@/components/goals/goals-list'

export default async function GoalsPage() {
  const [allGoals, categories] = await Promise.all([serverApi.goals(true), serverApi.categories()])

  const active    = allGoals.filter((g) => !g.isCompleted)
  const completed = allGoals.filter((g) =>  g.isCompleted)

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Metas</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {active.length} ativa{active.length !== 1 ? 's' : ''} ·{' '}
            {completed.length} concluída{completed.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-slate-600 mt-1 max-w-md">Defina objetivos financeiros e acompanhe o progresso. Cada aporte registrado vira uma despesa e alimenta o saldo da meta.</p>
        </div>
        <GoalModal />
      </div>

      <GoalsList goals={allGoals} categories={categories} />
    </div>
  )
}
