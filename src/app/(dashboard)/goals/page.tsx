import { Plus, Calendar, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress, CircularProgress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency, formatDate, calculateProgress } from '@/lib/utils'
import { serverApi } from '@/lib/api-client'
import { DeleteGoalButton } from '@/components/ui/delete-buttons'
import { GoalModal } from '@/components/goals/goal-modal'
import { EditGoalModal } from '@/components/goals/edit-goal-modal'
import { ContributeButton } from '@/components/goals/contribute-button'

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

      {/* Active goals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {active.map((goal) => {
          const target  = Number(goal.targetAmount)
          const current = Number(goal.currentAmount)
          const pct     = calculateProgress(current, target)
          const remaining = Math.max(target - current, 0)

          return (
            <Card
              key={goal.id}
              className="flex flex-col gap-4 group"
            >
              {/* Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="size-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: (goal.color ?? '#3B82F6') + '20' }}
                  >
                    {goal.icon ?? '🎯'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-200 leading-tight truncate">
                      {goal.name}
                    </p>
                    {goal.description && (
                      <p className="text-xs text-slate-600 mt-0.5 truncate">{goal.description}</p>
                    )}
                  </div>
                </div>
                <CircularProgress
                  value={current}
                  max={target}
                  size={44}
                  strokeWidth={4}
                  variant="brand"
                >
                  <span className="text-[10px] font-bold text-slate-300">{pct}%</span>
                </CircularProgress>
              </div>

              {/* Progress */}
              <div className="flex flex-col gap-1.5">
                <Progress value={current} max={target} variant="brand" size="sm" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{formatCurrency(current, true)}</span>
                  <span className="text-xs text-slate-600">meta: {formatCurrency(target, true)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                {goal.deadline ? (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Calendar className="size-3.5" />
                    <span>{formatDate(goal.deadline, 'MMM yyyy')}</span>
                  </div>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <ContributeButton
                    goalId={goal.id}
                    goalName={goal.name}
                    remaining={remaining}
                    current={current}
                    categories={categories}
                  />
                  <EditGoalModal goal={{ id: goal.id, name: goal.name, targetAmount: Number(goal.targetAmount), currentAmount: Number(goal.currentAmount), deadline: goal.deadline, description: goal.description, icon: goal.icon, color: goal.color }} />
                  <DeleteGoalButton id={goal.id} />
                </div>
              </div>

              {/* Mini extrato de aportes */}
              {goal.contributions.length > 0 && (
                <div className="mt-1 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <TrendingUp className="size-3 text-slate-600" />
                    <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">Movimentações</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {goal.contributions.map((c) => {
                      const isWithdrawal = Number(c.amount) < 0
                      return (
                      <div key={c.id} className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">
                          {isWithdrawal && <span className="text-danger mr-1">↓</span>}
                          {format(c.createdAt, "dd 'de' MMM, yyyy", { locale: ptBR })}
                          {c.note && c.note !== 'Retirada' && <span className="text-slate-700 ml-1">· {c.note}</span>}
                        </span>
                        <span className={`text-xs tabular-nums font-medium ${isWithdrawal ? 'text-danger' : 'text-success'}`}>
                          {isWithdrawal ? '' : '+'}{formatCurrency(Math.abs(Number(c.amount)), true)}
                        </span>
                      </div>
                    )})}
                  </div>
                </div>
              )}
            </Card>
          )
        })}

        {/* Add new goal card */}
        <GoalAddCard />
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Concluídas</h2>
          {completed.map((goal) => (
            <Card key={goal.id} variant="outline" className="opacity-60">
              <div className="flex items-center gap-3">
                <div
                  className="size-8 rounded-lg flex items-center justify-center text-sm"
                  style={{ backgroundColor: (goal.color ?? '#22C55E') + '20' }}
                >
                  {goal.icon ?? '✓'}
                </div>
                <span className="text-sm text-slate-400 flex-1">{goal.name}</span>
                <Badge variant="success" size="sm" dot>Concluída</Badge>
                <span className="text-sm font-semibold text-success">
                  {formatCurrency(Number(goal.targetAmount))}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function GoalAddCard() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-ink-500 p-6 text-slate-600 hover:text-slate-400 hover:border-ink-400 transition-colors min-h-[160px]">
      <div className="size-10 rounded-xl border border-dashed border-current flex items-center justify-center">
        <Plus className="size-5" />
      </div>
      <span className="text-sm font-medium">Nova meta</span>
    </div>
  )
}
