'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle } from 'lucide-react'
import { clientApi } from '@/lib/api-client'

export function MigrateRecurringButton() {
  const [pending, setPending] = useState(false)
  const [done,    setDone]    = useState(false)
  const [msg,     setMsg]     = useState('')

  async function handleMigrate() {
    if (!confirm('Isso vai converter os pagamentos cadastrados com o slider antigo (120 parcelas) para o novo sistema recorrente. Deseja continuar?')) return
    setPending(true)
    try {
      const result = await clientApi.migratePersonRecurring()
      setMsg(result.message)
      setDone(true)
      setTimeout(() => window.location.reload(), 1500)
    } catch {
      setMsg('Erro ao migrar. Tente novamente.')
    } finally {
      setPending(false)
    }
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 text-xs text-success bg-success/10 border border-success/20 px-3 py-2 rounded-xl">
        <CheckCircle className="size-3.5 shrink-0" />
        {msg}
      </div>
    )
  }

  return (
    <button
      onClick={handleMigrate}
      disabled={pending}
      className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 hover:bg-amber-400/15 px-3 py-2 rounded-xl transition-colors disabled:opacity-60"
    >
      <RefreshCw className={`size-3.5 shrink-0 ${pending ? 'animate-spin' : ''}`} />
      {pending ? 'Convertendo...' : 'Converter pagamentos antigos para recorrente'}
    </button>
  )
}
