import { RefreshCw } from 'lucide-react'
import { serverApi } from '@/lib/api-client'
import { RecurringModal } from '@/components/recurring/recurring-modal'
import { RecurringList } from '@/components/recurring/recurring-list'

export default async function RecurringPage() {
  const [items, categories] = await Promise.all([
    serverApi.recurring(),
    serverApi.categories(),
  ])

  const active   = items.filter((r) => r.isActive)
  const inactive = items.filter((r) => !r.isActive)

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Recorrências</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {active.length} ativa{active.length !== 1 ? 's' : ''} · {inactive.length} inativa{inactive.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-slate-600 mt-1 max-w-md">Transações recorrentes são lançadas automaticamente todo mês na data configurada — despesas fixas como aluguel, internet ou assinaturas.</p>
        </div>
        <RecurringModal categories={categories} />
      </div>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <RefreshCw className="size-10 text-slate-700" />
          <p className="text-slate-500 text-sm">Nenhuma recorrência cadastrada.</p>
          <p className="text-slate-600 text-xs">Use o botão acima para criar sua primeira transação recorrente.</p>
        </div>
      )}

      <RecurringList items={items} categories={categories} />
    </div>
  )
}
