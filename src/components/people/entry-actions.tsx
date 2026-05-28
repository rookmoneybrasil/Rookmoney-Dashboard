'use client'

import { useTransition } from 'react'
import { CheckCircle2, RotateCcw, Trash2 } from 'lucide-react'
import { settleEntry, unsettleEntry, deleteEntry } from '@/app/actions/people'
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button'

interface Props {
  entryId:   string
  personId:  string
  isSettled: boolean
}

export function EntryActions({ entryId, personId, isSettled }: Props) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {isSettled ? (
        <button
          onClick={() => startTransition(() => unsettleEntry(entryId, personId))}
          disabled={pending}
          title="Desfazer acerto"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors"
        >
          <RotateCcw className="size-3.5" />
          Reabrir
        </button>
      ) : (
        <button
          onClick={() => startTransition(() => settleEntry(entryId, personId))}
          disabled={pending}
          title="Marcar como acertado"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-success hover:bg-success/10 transition-colors"
        >
          <CheckCircle2 className="size-3.5" />
          Acertar
        </button>
      )}

      <ConfirmDeleteButton
        action={() => deleteEntry(entryId, personId)}
        icon="trash"
        title="Excluir lançamento"
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-danger hover:bg-danger/10 transition-colors"
      />
    </div>
  )
}
