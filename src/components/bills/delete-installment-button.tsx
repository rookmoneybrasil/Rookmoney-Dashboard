'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { clientApi } from '@/lib/api-client'
import { useRouter } from 'next/navigation'

// Per-parcela delete with the 3 scopes (mirrors the mobile dialog):
// "Somente esta" (one), "Esta e as futuras" (future), "Todas" (all).
export function DeleteInstallmentButton({
  billId, installmentCurrent, total, name,
}: {
  billId: string
  installmentCurrent: number | null
  total: number
  name: string
}) {
  const [open, setOpen]       = useState(false)
  const [pending, setPending] = useState(false)
  const router = useRouter()

  async function run(scope: 'one' | 'future' | 'all') {
    setPending(true)
    try {
      await clientApi.deleteBill(billId, scope)
      router.refresh()
    } finally {
      setPending(false)
      setOpen(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="size-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10 transition-colors"
        title="Excluir parcela"
      >
        <Trash2 className="size-3.5" />
      </button>
    )
  }

  return (
    <>
      {/* backdrop to close on outside click */}
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div className="absolute right-0 z-50 mt-1 w-56 rounded-xl border border-white/10 bg-ink-800 shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100">
        <p className="px-3 py-2 text-xs text-slate-500 border-b border-white/6">
          Parcela {installmentCurrent}/{total} de <span className="text-slate-300 font-medium">{name}</span>
        </p>
        <button disabled={pending} onClick={() => run('one')}
          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded-lg transition-colors">
          Somente esta
        </button>
        <button disabled={pending} onClick={() => run('future')}
          className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-white/5 rounded-lg transition-colors">
          Esta e as futuras
        </button>
        <button disabled={pending} onClick={() => run('all')}
          className="w-full text-left px-3 py-2 text-xs text-danger hover:bg-danger/10 rounded-lg transition-colors">
          Todas as parcelas
        </button>
      </div>
    </>
  )
}
