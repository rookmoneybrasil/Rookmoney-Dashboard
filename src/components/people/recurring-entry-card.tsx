'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, X, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react'
import { clientApi, type PersonEntryRecurringItem } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'
import { EditRecurringModal } from './edit-recurring-modal'

interface Category { id: string; name: string; icon: string; color: string }

interface Props {
  item:        PersonEntryRecurringItem
  categories?: Category[]
}

// Standardized to match RecurringBillRow (Contas Fixas): the template only
// toggles active/paused, edits, or deletes — it does NOT have a "Pago"
// action. The month's actual generated entry (with its own pay button)
// already appears in the regular entries list further down the page, so a
// pay button here would just be a redundant second way to do the same thing.
export function RecurringEntryCard({ item, categories = [] }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [stopping,   setStopping]   = useState(false)
  const [toggling,   setToggling]   = useState(false)

  const isTheyOwe = item.type === 'THEY_OWE_ME'

  async function handleToggle() {
    setToggling(true)
    try {
      await clientApi.updatePersonRecurring(item.id, { isActive: !item.isActive })
      router.refresh()
    } catch {
      alert('Não foi possível atualizar. Tente novamente.')
    } finally {
      setToggling(false)
    }
  }

  async function handleStop() {
    setStopping(true)
    try {
      await clientApi.stopPersonRecurring(item.id)
      router.refresh()
    } catch {
      alert('Não foi possível remover. Tente novamente.')
      setStopping(false)
    }
  }

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${
      item.isActive
        ? 'bg-brand-900/20 border-brand-700/30'
        : 'bg-ink-800/50 border-ink-700/50 opacity-50'
    }`}>
      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${item.isActive ? 'bg-brand-800/60' : 'bg-ink-700'}`}>
        <RefreshCw className={`size-3.5 ${item.isActive ? 'text-brand-400' : 'text-slate-500'}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium truncate ${item.isActive ? 'text-slate-200' : 'text-slate-500'}`}>
            {item.description}
          </p>
          {!item.isActive && (
            <span className="text-[10px] bg-ink-700 text-slate-600 border border-ink-600 px-1.5 py-0.5 rounded-full font-medium shrink-0">Pausada</span>
          )}
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
        {!confirming && (
          <button
            type="button"
            onClick={handleToggle}
            disabled={toggling}
            title={item.isActive ? 'Pausar recorrência' : 'Ativar recorrência'}
            className="size-7 rounded-lg flex items-center justify-center transition-colors text-slate-500 hover:text-slate-300 hover:bg-ink-700 disabled:opacity-50"
          >
            {item.isActive ? <ToggleRight className="size-4 text-success" /> : <ToggleLeft className="size-4" />}
          </button>
        )}

        {!confirming && <EditRecurringModal item={item} categories={categories} />}

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
              <AlertTriangle className="size-3 text-warning" /> Remover?</span>
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
