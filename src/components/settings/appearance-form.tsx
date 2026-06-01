'use client'

import { useState } from 'react'
import { clientApi } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Palette } from 'lucide-react'

const CURRENCIES = [
  { value: 'BRL', label: 'Real brasileiro (R$)' },
  { value: 'USD', label: 'Dólar americano ($)'  },
  { value: 'EUR', label: 'Euro (€)'             },
]

const DATE_FORMATS = [
  { value: 'dd/MM/yyyy', label: '31/12/2025 (BR padrão)'   },
  { value: 'MM/dd/yyyy', label: '12/31/2025 (US)'          },
  { value: 'yyyy-MM-dd', label: '2025-12-31 (ISO 8601)'    },
]

interface Props { currency: string; dateFormat: string }

export function AppearanceForm({ currency, dateFormat }: Props) {
  const [form, setForm]     = useState({ currency, dateFormat })
  const [pending, setPending] = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState('')

  async function handleSave() {
    setPending(true); setSaved(false); setError('')
    try {
      await clientApi.updatePreferences(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally { setPending(false) }
  }

  const dirty = form.currency !== currency || form.dateFormat !== dateFormat

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Moeda padrão</label>
          <select
            value={form.currency}
            onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
            className="h-10 w-full rounded-lg bg-ink-800 border border-ink-500 hover:border-ink-400 text-sm text-slate-100 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500"
          >
            {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <p className="text-xs text-slate-600">Usado para formatação de valores.</p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-300">Formato de data</label>
          <select
            value={form.dateFormat}
            onChange={e => setForm(f => ({ ...f, dateFormat: e.target.value }))}
            className="h-10 w-full rounded-lg bg-ink-800 border border-ink-500 hover:border-ink-400 text-sm text-slate-100 px-3 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500"
          >
            {DATE_FORMATS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ink-700/60 border border-white/6 text-xs text-slate-500">
          <Palette className="size-3.5 shrink-0" />
          Tema: <span className="text-slate-400 font-medium">Escuro</span>
          <span className="ml-1 text-ink-400 bg-ink-600 px-1.5 py-0.5 rounded text-[10px]">fixo</span>
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={pending || !dirty} size="sm">
          {pending ? 'Salvando...' : saved ? '✓ Salvo!' : 'Salvar preferências'}
        </Button>
        {saved && !pending && <span className="text-xs text-success">Preferências atualizadas.</span>}
      </div>
    </div>
  )
}
