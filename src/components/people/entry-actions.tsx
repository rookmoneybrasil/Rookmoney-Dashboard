'use client'

import { useState } from 'react'
import { CheckCircle2, RotateCcw, Trash2, AlertTriangle } from 'lucide-react'
import { clientApi } from '@/lib/api-client'

interface Props {
  entryId:   string
  personId:  string
  isSettled: boolean
}

export function EntryActions({ entryId, isSettled }: Props) {
  const [settling,    setSettling]    = useState(false)
  const [delConfirm,  setDelConfirm]  = useState(false)
  const [delPending,  setDelPending]  = useState(false)

  async function handleSettle() {
    setSettling(true)
    try {
      if (isSettled) await clientApi.unsettleEntry(entryId)
      else           await clientApi.settleEntry(entryId)
      window.location.reload()
    } finally { setSettling(false) }
  }

  async function handleDelete() {
    setDelPending(true)
    try {
      await clientApi.deleteEntry(entryId)
      window.location.reload()
    } finally { setDelPending(false) }
  }

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {/* Settle / Unsettle */}
      <button onClick={handleSettle} disabled={settling}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
          isSettled
            ? 'text-slate-500 hover:text-slate-300 hover:bg-ink-700'
            : 'text-success hover:bg-success/10'
        }`}>
        {isSettled ? <RotateCcw className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
        {isSettled ? 'Reabrir' : 'Acertar'}
      </button>

      {/* Delete */}
      {delConfirm ? (
        <div className="flex items-center gap-1 animate-in fade-in duration-150">
          <span className="text-xs text-slate-500 flex items-center gap-0.5">
            <AlertTriangle className="size-3 text-warning shrink-0" />
            Excluir?
          </span>
          <button onClick={handleDelete} disabled={delPending}
            className="h-6 px-2 rounded text-xs font-medium bg-danger/15 text-danger hover:bg-danger/25 border border-danger/20 disabled:opacity-50">
            {delPending ? '...' : 'Sim'}
          </button>
          <button onClick={() => setDelConfirm(false)}
            className="h-6 px-2 rounded text-xs bg-ink-600 text-slate-400 hover:text-slate-200">
            Não
          </button>
        </div>
      ) : (
        <button onClick={() => setDelConfirm(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-danger hover:bg-danger/10 transition-colors">
          <Trash2 className="size-3.5" />
        </button>
      )}
    </div>
  )
}
