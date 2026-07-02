import { Suspense } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { type TransactionFilter } from '@/lib/api-client'
import { serverApi } from '@/lib/api-client'
import { TransactionsList } from '@/components/transactions/transactions-list'
import { TransactionFilters } from '@/components/transactions/transaction-filters'
import { PaginationBar } from '@/components/ui/pagination-bar'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function TransactionsPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams

  const page = Math.max(1, Number(sp.page ?? '1') || 1)

  const filter: TransactionFilter = {
    type:       (sp.type as TransactionFilter['type']) ?? 'ALL',
    search:     sp.search     as string | undefined,
    categoryId: sp.categoryId as string | undefined,
    month:      sp.month      as string | undefined,
    page,
    pageSize:   20,
  }

  const txParams: Record<string, string> = { page: String(page), pageSize: '20' }
  if (filter.type)       txParams.type       = filter.type
  if (filter.search)     txParams.search     = filter.search
  if (filter.categoryId) txParams.categoryId = filter.categoryId
  if (filter.month)      txParams.month      = filter.month

  const [{ items: transactions, total, totalPages, page: currentPage }, categories] = await Promise.all([
    serverApi.transactions(txParams),
    serverApi.categories(),
  ])

  const now        = new Date()
  const monthLabel = filter.month
    ? format(new Date(filter.month + '-01'), 'MMMM yyyy', { locale: ptBR })
    : format(now, 'MMMM yyyy', { locale: ptBR })

  return (
    <div className="flex flex-col gap-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 capitalize">Transações</h1>
          <p className="text-sm text-slate-500 mt-0.5 capitalize">{monthLabel}</p>
          <p className="text-xs text-slate-600 mt-1 max-w-md">Visualize todas as entradas e saídas de dinheiro. Use os filtros para buscar por período, tipo ou categoria.</p>
        </div>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-20 rounded-xl bg-ink-800 animate-pulse" />}>
        <TransactionFilters categories={categories} totalCount={total} />
      </Suspense>

      {/* List */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
          <div className="size-12 rounded-xl bg-ink-700 flex items-center justify-center text-slate-600">
            <ArrowUpRight className="size-6" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Nenhuma transação encontrada</p>
            <p className="text-slate-600 text-xs mt-1">
              {Object.values(filter).some(Boolean)
                ? 'Tente ajustar os filtros'
                : 'Suas transações de contas, rendas e pessoas aparecerão aqui'}
            </p>
          </div>
        </div>
      ) : (
        <TransactionsList transactions={transactions} categories={categories} />
      )}

      {/* Pagination */}
      <Suspense>
        <PaginationBar page={currentPage} totalPages={totalPages} />
      </Suspense>
    </div>
  )
}
