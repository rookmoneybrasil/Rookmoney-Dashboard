'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, ArrowDownRight, AlertTriangle, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WithTooltip } from '@/components/ui/tooltip'
import { formatCurrency, formatDate } from '@/lib/utils'
import { clientApi, type Transaction, type Category, type Account } from '@/lib/api-client'
import { getServiceBrand } from '@/lib/service-brands'
import { EditTransactionModal } from './edit-transaction-modal'
import { InfoModal } from '@/components/ui/info-modal'

interface Props {
  transactions: Transaction[]
  categories: Category[]
  accounts?:  Account[]
}

// Optimistic delete, same pattern as PendingBillsList: the row disappears
// immediately with a plain (non-transition) state update, the mutation +
// router.refresh() happen in the background, and a failed delete rolls
// the row back instead of leaving the page stuck.
export function TransactionsList({ transactions, categories, accounts = [] }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(transactions)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => { setItems(transactions) }, [transactions])

  function setBusy(id: string, busy: boolean) {
    setBusyIds(prev => {
      const next = new Set(prev)
      busy ? next.add(id) : next.delete(id)
      return next
    })
  }

  async function deleteTx(id: string) {
    if (busyIds.has(id)) return
    let rollback: Transaction[] | null = null
    setItems(prev => { rollback = prev; return prev.filter(t => t.id !== id) })
    setBusy(id, true)
    try {
      await clientApi.deleteTransaction(id)
      router.refresh()
    } catch {
      if (rollback) setItems(rollback)
      alert('Erro ao excluir a transação. Tente novamente.')
    } finally {
      setBusy(id, false)
    }
  }

  return (
    <Card padding="none">
      <CardContent>
        <div className="divide-y divide-white/5">
          {items.map((tx) => {
            const brand = getServiceBrand(tx.description, tx.category.name)
            const busy  = busyIds.has(tx.id)
            return (
              <div
                key={tx.id}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-ink-600/30 transition-all group ${busy ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <WithTooltip content={brand ? brand.name : tx.category.name} side="right">
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

                <InfoModal
                  className="flex-1 min-w-0"
                  typeLabel="Transação"
                  title={tx.description ?? tx.category.name}
                  amount={`${tx.type === 'INCOME' ? '+' : '-'}${formatCurrency(Number(tx.amount))}`}
                  amountClass={tx.type === 'INCOME' ? 'text-success' : 'text-slate-100'}
                  badge={{ label: tx.type === 'INCOME' ? 'Receita' : 'Despesa', variant: tx.type === 'INCOME' ? 'success' : 'danger' }}
                  rows={[
                    { label: 'Tipo',      value: tx.type === 'INCOME' ? 'Receita' : 'Despesa' },
                    { label: 'Data',      value: formatDate(tx.date) },
                    { label: 'Categoria', value: `${tx.category.icon} ${tx.category.name}` },
                    { label: 'Conta',     value: tx.account ? `${tx.account.icon} ${tx.account.name}` : '' },
                    { label: 'Descrição', value: tx.description ?? '' },
                    ...(tx.ignored ? [{ label: 'Ignorada', value: 'Sim — fora dos saldos e relatórios' }] : []),
                  ]}
                >
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {tx.description ?? tx.category.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                      style={{ backgroundColor: tx.category.color + '18', color: tx.category.color }}
                    >
                      {tx.category.icon} {tx.category.name}
                    </span>
                    <span className="text-xs text-slate-600">{formatDate(tx.date)}</span>
                    {tx.account && <span className="text-xs text-slate-600">· {tx.account.icon} {tx.account.name}</span>}
                    {tx.ignored && <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-slate-500/15 text-slate-400 border border-slate-500/20">Ignorada</span>}
                  </div>
                </InfoModal>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-semibold tabular-nums ${tx.type === 'INCOME' ? 'text-success' : 'text-slate-300'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}
                      {formatCurrency(Number(tx.amount))}
                    </span>
                    <WithTooltip content={tx.type === 'INCOME' ? 'Entrada de dinheiro' : 'Saída de dinheiro'} side="left">
                      <Badge variant={tx.type === 'INCOME' ? 'income' : 'expense'} size="sm">
                        {tx.type === 'INCOME' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </WithTooltip>
                  </div>

                  <EditTransactionModal transaction={{ ...tx, amount: Number(tx.amount) }} categories={categories} accounts={accounts} />

                  {confirmingId === tx.id ? (
                    <div className="flex items-center gap-1 animate-in fade-in duration-150">
                      <span className="text-xs text-slate-500 flex items-center gap-1 mr-0.5">
                        <AlertTriangle className="size-3 text-warning shrink-0" />
                        Excluir?
                      </span>
                      <button
                        onClick={() => { setConfirmingId(null); deleteTx(tx.id) }}
                        className="h-6 px-2 rounded text-xs font-medium bg-danger/15 text-danger hover:bg-danger/25 transition-colors border border-danger/20"
                      >
                        Sim
                      </button>
                      <button
                        onClick={() => setConfirmingId(null)}
                        className="h-6 px-2 rounded text-xs font-medium bg-ink-600 text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmingId(tx.id)}
                      disabled={busy}
                      className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40"
                      title="Excluir"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
