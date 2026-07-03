'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { clientApi } from '@/lib/api-client'

// Mirrors MarkBillPaidButton (components/ui/delete-buttons.tsx) so the
// settle/unsettle toggle for a person entry looks and behaves the same as
// the Bills "Pagar" action.
export function MarkEntrySettledButton({ entryId, isSettled, showLabel }: { entryId: string; isSettled: boolean; showLabel?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <button
      disabled={loading}
      onClick={async () => {
        if (loading) return
        setLoading(true)
        try {
          if (isSettled) await clientApi.unsettleEntry(entryId)
          else           await clientApi.settleEntry(entryId)
          router.refresh()
        } catch {
          alert('Erro ao atualizar o lançamento. Tente novamente.')
        } finally {
          setLoading(false)
        }
      }}
      className={showLabel
        ? `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isSettled ? 'text-slate-500 hover:text-slate-300 hover:bg-ink-700 border border-ink-600' : 'text-success bg-success/10 hover:bg-success/20 border border-success/30'}`
        : 'size-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-success hover:bg-success/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
      }
      title={isSettled ? 'Reabrir' : 'Acertar'}
    >
      <svg className={`size-3.5 ${loading ? 'animate-spin opacity-50' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        {isSettled
          ? <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          : <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
      {showLabel && <span>{loading ? '...' : isSettled ? 'Acertado' : 'Acertar'}</span>}
    </button>
  )
}
