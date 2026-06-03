'use client'

import { useState, useRef } from 'react'
import { RefreshCw, X, AlertTriangle, CheckCircle2, Circle } from 'lucide-react'
import { clientApi, type PersonEntryRecurringItem } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'
import { EditRecurringModal } from './edit-recurring-modal'

interface Category { id: string; name: string; icon: string; color: string }

interface Props {
  item:           PersonEntryRecurringItem
  categories?:    Category[]
  monthEntryId?:  string | null
  paidThisMonth?: boolean
}

export function RecurringEntryCard({ item, categories = [], monthEntryId = null, paidThisMonth = false }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [stopping,   setStopping]   = useState(false)
  const [paid,       setPaid]       = useState(paidThisMonth)
  const [marking,    setMarking]    = useState(false)

  // Prevent concurrent/duplicate clicks — blocks any new action until reload
  const processing = useRef(false)

  const isTheyOwe = item.type === 'THEY_OWE_ME'

  async function handleStop() {
    if (processing.current) return
    processing.current = true
    setStopping(true)
    await clientApi.stopPersonRecurring(item.id)
    window.location.reload()
  }

  async function handleTogglePaid() {
    if (processing.current) return // already handling a click
    processing.current = true
    setMarking(true)

    try {
      if (paid) {
        // Desfazer: reabrir a entrada quitada
        if (monthEntryId) {
          await clientApi.unsettleEntry(monthEntryId)
          setPaid(false)
          window.location.reload()
        }
      } else {
        if (monthEntryId) {
          // Entrada já existe — só acerta
          await clientApi.settleEntry(monthEntryId)
        } else {
          // Nenhuma entrada gerada ainda — cria e acerta em uma operação
          const entry = await clientApi.createEntry(item.personId, {
            type:        item.type,
            description: item.description,
            amount:      item.amount,
            date:        new Date().toISOString().split('T')[0],
            categoryId:  item.categoryId,
          })
          await clientApi.settleEntry(entry.id)
        }
        setPaid(true)
        window.location.reload()
      }
    } catch {
      // Em caso de erro, libera o guard para tentar novamente
      processing.current = false
      setMarking(false)
    }
  }

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${
      paid ? 'bg-success/5 border-success/20' : 'bg-brand-900/20 border-brand-700/30'
    }`}>
      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${paid ? 'bg-success/15' : 'bg-brand-800/60'}`}>
        {paid
          ? <CheckCircle2 className="size-3.5 text-success" />
          : <RefreshCw    className="size-3.5 text-brand-400" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${paid ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
            {item.description}
          </p>
          {paid
            ? <span className="text-[10px] bg-success/15 text-success border border-success/20 px-1.5 py-0.5 rounded-full font-medium shrink-0">Pago</span>
            : <span className="text-[10px] bg-warning/15 text-warning border border-warning/20 px-1.5 py-0.5 rounded-full font-medium shrink-0">Pendente</span>
          }
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          <span className={isTheyOwe ? 'text-success' : 'text-danger'}>
            {isTheyOwe ? '+' : '-'}{formatCurrency(item.amount)}/mês
          </span>
          {' '}· dia {item.dayOfMonth}
          {item.category && ` · ${item.category.icon} ${item.category.name}`}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!confirming && <EditRecurringModal item={item} categories={categories} />}

        {!confirming && (
          <button
            onClick={handleTogglePaid}
            disabled={marking || processing.current}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              paid
                ? 'text-slate-500 hover:text-slate-300 hover:bg-ink-700'
                : 'text-success hover:bg-success/10'
            }`}
          >
            <Circle className="size-3.5" />
            {marking ? '...' : paid ? 'Desfazer' : 'Pago'}
          </button>
        )}

        {!confirming ? (
          <button
            onClick={() => setConfirming(true)}
            className="text-xs text-slate-600 hover:text-danger transition-colors flex items-center gap-1 px-2 py-1 rounded hover:bg-danger/10"
          >
            <X className="size-3" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 flex items-center gap-0.5">
              <AlertTriangle className="size-3 text-warning" /> Parar?</span>
            <button onClick={handleStop} disabled={stopping}
              className="text-xs text-danger hover:text-danger/80 px-1.5 py-1 rounded hover:bg-danger/10 transition-colors disabled:opacity-50">
              {stopping ? '...' : 'Sim'}
            </button>
            <button onClick={() => setConfirming(false)}
              className="text-xs text-slate-500 hover:text-slate-300 px-1.5 py-1 rounded hover:bg-ink-700 transition-colors">
              Não
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
