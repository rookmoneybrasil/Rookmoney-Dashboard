'use client'

import { useState } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { clientApi } from '@/lib/api-client'
import { useRouter } from 'next/navigation'

export function DeleteGroupButton({ groupId }: { groupId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, setPending]       = useState(false)
  const router = useRouter()

  if (confirming) {
    return (
      <div className="flex items-center gap-1 animate-in fade-in duration-150">
        <span className="text-xs text-slate-500 flex items-center gap-1 mr-1">
          <AlertTriangle className="size-3 text-warning" />
          Excluir?
        </span>
        <button
          onClick={async () => {
            setPending(true)
            await clientApi.deleteInstallmentGroup(groupId)
            router.refresh()
          }}
          disabled={pending}
          className="h-6 px-2 rounded text-xs font-medium bg-danger/15 text-danger hover:bg-danger/25 transition-colors border border-danger/20"
        >
          {pending ? '...' : 'Sim'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="h-6 px-2 rounded text-xs font-medium bg-ink-600 text-slate-400 hover:text-slate-200 transition-colors"
        >
          Não
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity size-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10"
      title="Excluir do histórico"
    >
      <X className="size-3.5" />
    </button>
  )
}
