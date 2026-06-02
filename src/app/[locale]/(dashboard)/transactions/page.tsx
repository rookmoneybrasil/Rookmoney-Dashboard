import { Suspense } from 'react'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { type TransactionFilter } from '@/lib/api-client'
import { DeleteTransactionButton } from '@/components/ui/delete-buttons'
import { serverApi } from '@/lib/api-client'
import { TransactionModal } from '@/components/transactions/transaction-modal'
import { EditTransactionModal } from '@/components/transactions/edit-transaction-modal'
import { TransactionFilters } from '@/components/transactions/transaction-filters'
import { PaginationBar } from '@/components/ui/pagination-bar'
import { getServiceBrand } from '@/lib/service-brands'
import { WithTooltip } from '@/components/ui/tooltip'

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
          <p className="text-xs text-slate-600 mt-1 max-w-md">Registre todas as entradas e saídas de dinheiro. Use os filtros para buscar por período, tipo ou categoria.</p>
        </div>
        <TransactionModal categories={categories} />
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
                : 'Use o botão acima para adicionar a primeira transação'}
            </p>
          </div>
        </div>
      ) : (
        <Card padding="none">
          <CardContent>
            <div className="divide-y divide-white/5">
              {transactions.map((tx) => {
                const brand = getServiceBrand(tx.description, tx.category.name)

                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-ink-600/30 transition-colors group"
                  >
                    {/* Icon — brand or category */}
                    <WithTooltip
                      content={brand ? brand.name : tx.category.name}
                      side="right"
                    >
                      <div
                        className="size-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm select-none"
                        style={
                          brand
                            ? { backgroundColor: brand.color, color: brand.text }
                            : { backgroundColor: tx.category.color + '20', color: tx.category.color }
                        }
                      >
                        {brand ? brand.short : (
                          tx.type === 'INCOME'
                            ? <ArrowUpRight className="size-5" />
                            : <ArrowDownRight className="size-5" />
                        )}
                      </div>
                    </WithTooltip>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">
                        {tx.description ?? tx.category.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                          style={{
                            backgroundColor: tx.category.color + '18',
                            color: tx.category.color,
                          }}
                        >
                          {tx.category.icon} {tx.category.name}
                        </span>
                        <span className="text-xs text-slate-600">{formatDate(tx.date)}</span>
                      </div>
                    </div>

                    {/* Amount + badge + delete */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex flex-col items-end">
                        <span
                          className={`text-sm font-semibold tabular-nums ${
                            tx.type === 'INCOME' ? 'text-success' : 'text-slate-300'
                          }`}
                        >
                          {tx.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(Number(tx.amount))}
                        </span>
                        <WithTooltip
                          content={tx.type === 'INCOME' ? 'Entrada de dinheiro' : 'Saída de dinheiro'}
                          side="left"
                        >
                          <Badge variant={tx.type === 'INCOME' ? 'income' : 'expense'} size="sm">
                            {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                          </Badge>
                        </WithTooltip>
                      </div>

                      <EditTransactionModal transaction={{ ...tx, amount: Number(tx.amount) }} categories={categories} />

                      <DeleteTransactionButton id={tx.id} />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      <Suspense>
        <PaginationBar page={currentPage} totalPages={totalPages} />
      </Suspense>
    </div>
  )
}
