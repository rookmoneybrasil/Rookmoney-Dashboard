'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, AlertTriangle, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { EditEntryModal } from './edit-entry-modal'
import { MarkEntrySettledButton } from './mark-entry-settled-button'
import { InfoModal } from '@/components/ui/info-modal'
import { personEntryInfo } from './entry-info'
import { formatCurrency, formatDate } from '@/lib/utils'
import { clientApi, type PersonEntryRow } from '@/lib/api-client'

type Category = { id: string; name: string; icon: string; color: string }

// Mirrors PendingBillsList's row (components/bills/pending-bills-list.tsx) so
// a pending person entry looks the same as a pending bill — direction (te
// deve / você deve) takes the place of due-date urgency, since person
// entries don't have an overdue/urgent concept of their own.
export function PendingEntryRow({ entry, personId, categories }: { entry: PersonEntryRow; personId: string; categories: Category[] }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const isTheyOwe = entry.type === 'THEY_OWE_ME'

  async function handleDelete() {
    setBusy(true)
    try {
      await clientApi.deleteEntry(entry.id)
      router.refresh()
    } catch {
      alert('Erro ao excluir o lançamento. Tente novamente.')
      setBusy(false)
    }
  }

  return (
    <div className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all group ${
      isTheyOwe ? 'bg-success/5 border-success/20 hover:bg-success/8' : 'bg-danger/5 border-danger/20 hover:bg-danger/8'
    } ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${isTheyOwe ? 'bg-success/15' : 'bg-danger/15'}`}>
        {entry.category?.icon
          ? <span>{entry.category.icon}</span>
          : isTheyOwe ? <TrendingUp className="size-3.5 text-success" /> : <TrendingDown className="size-3.5 text-danger" />
        }
      </div>
      <InfoModal className="flex-1 min-w-0" {...personEntryInfo(entry, false)}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-medium text-slate-200 truncate">{entry.description}</p>
          {entry.recurringEntryId && <span className="text-[10px] text-brand-500">↻ recorrente</span>}
          <Badge variant={isTheyOwe ? 'success' : 'danger'} size="sm" dot>{isTheyOwe ? 'Recebível' : 'A pagar'}</Badge>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {entry.category?.name ?? 'Sem categoria'} · {formatDate(entry.date)}
        </p>
      </InfoModal>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-sm font-semibold tabular-nums ${isTheyOwe ? 'text-success' : 'text-danger'}`}>
          {formatCurrency(entry.amount)}
        </span>
        <MarkEntrySettledButton entryId={entry.id} isSettled={false} showLabel />
        {confirming ? (
          <div className="flex items-center gap-1 animate-in fade-in duration-150">
            <span className="text-xs text-slate-500 flex items-center gap-1 mr-0.5">
              <AlertTriangle className="size-3 text-warning shrink-0" />
              Excluir?
            </span>
            <button onClick={handleDelete} disabled={busy}
              className="h-6 px-2 rounded text-xs font-medium bg-danger/15 text-danger hover:bg-danger/25 transition-colors border border-danger/20">
              Sim
            </button>
            <button onClick={() => setConfirming(false)}
              className="h-6 px-2 rounded text-xs font-medium bg-ink-600 text-slate-400 hover:text-slate-200 transition-colors">
              Não
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <EditEntryModal entry={entry} categories={categories} />
            <button onClick={() => setConfirming(true)} disabled={busy}
              className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40"
              title="Excluir">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
