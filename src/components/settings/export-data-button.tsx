'use client'

import { useState } from 'react'
import { Download, Loader2, CheckCircle } from 'lucide-react'
import { clientApi } from '@/lib/api-client'

export function ExportDataButton() {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  async function handleExport() {
    setState('loading')
    try {
      const data = await clientApi.exportData()
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `rook-money-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setState('done')
      setTimeout(() => setState('idle'), 3000)
    } catch {
      setState('idle')
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={state === 'loading'}
      className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-ink-700 hover:bg-ink-600 border border-ink-500 text-slate-300 text-sm font-medium transition-colors disabled:opacity-60"
    >
      {state === 'loading' ? (
        <><Loader2 className="size-4 animate-spin" />Exportando...</>
      ) : state === 'done' ? (
        <><CheckCircle className="size-4 text-success" />Baixado!</>
      ) : (
        <><Download className="size-4" />Exportar dados (JSON)</>
      )}
    </button>
  )
}
