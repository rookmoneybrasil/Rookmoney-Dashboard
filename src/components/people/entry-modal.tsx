'use client'

import { useState } from 'react'
import { CategorySelect } from '@/components/ui/category-select'
import { Plus, RefreshCw, Calendar } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import { formatCurrency } from '@/lib/utils'

interface Category { id: string; name: string; icon: string; color: string }
interface Props { personId: string; personName: string; categories: Category[] }
type EntryType = 'THEY_OWE_ME' | 'I_OWE_THEM'
type Mode = 'single' | 'parcelado' | 'recorrente'

export function EntryModal({ personId, personName, categories }: Props) {
  const [open, setOpen]           = useState(false)
  const [entryType, setEntryType] = useState<EntryType>('THEY_OWE_ME')
  const [mode, setMode]           = useState<Mode>('single')
  const [installments, setInst]   = useState(2)
  const [alreadyPaid, setAlready] = useState(0)
  const [dayOfMonth, setDay]      = useState(1)
  const [amount, setAmount]       = useState('')
  const [categoryId, setCatId]    = useState('')

  function reset() {
    setOpen(false); setEntryType('THEY_OWE_ME'); setMode('single')
    setInst(2); setAlready(0); setDay(1); setAmount(''); setCatId('')
  }

  const { mutate: mutateEntry, pending: pendingEntry, error: errorEntry } = useMutation(
    (data: Parameters<typeof clientApi.createEntry>[1] & { installments?: number }) =>
      clientApi.createEntry(personId, data),
    { onSuccess: reset },
  )

  const { mutate: mutateRecurring, pending: pendingRecurring, error: errorRecurring } = useMutation(
    (data: Parameters<typeof clientApi.createPersonRecurring>[0]) =>
      clientApi.createPersonRecurring(data),
    { onSuccess: reset },
  )

  const pending = pendingEntry || pendingRecurring
  const error   = errorEntry || errorRecurring
  const mutate  = mode === 'recorrente'
    ? (data: Parameters<typeof clientApi.createEntry>[1] & { installments?: number }) =>
        mutateRecurring({ personId, type: data.type, description: data.description, amount: parseFloat(String(data.amount)), dayOfMonth, notes: data.notes, categoryId: data.categoryId ?? null })
    : mutateEntry

  const today     = new Date().toISOString().split('T')[0]
  const amountNum = parseFloat(amount) || 0

  const effectiveInstallments = mode === 'parcelado' ? installments : 1

  const perMonth = mode === 'parcelado' && effectiveInstallments > 1
    ? Math.round((amountNum / effectiveInstallments) * 100) / 100
    : amountNum

  const submitLabel = mode === 'parcelado' ? `Criar ${installments} parcelas`
    : mode === 'recorrente' ? 'Criar recorrente'
    : 'Registrar'

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shrink-0"
      >
        <Plus className="size-3.5" />
        Novo lançamento
      </button>

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Lançamento — {personName}</ModalTitle>
        </ModalHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            mutate({
              type:         fd.get('type') as EntryType,
              description:  fd.get('description') as string,
              amount:       amountNum, // always per-installment value
              date:         fd.get('date') as string,
              notes:        (fd.get('notes') as string) || null,
              categoryId:   (fd.get('categoryId') as string) || null,
              installments: mode === 'parcelado' ? installments : 1,
              alreadyPaid:  mode === 'parcelado' ? alreadyPaid : 0,
            } as Parameters<typeof clientApi.createEntry>[1] & { installments?: number; alreadyPaid?: number })
          }}
          className="flex flex-col gap-4"
        >
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Direction toggle */}
          <div className="flex gap-2">
            {(['THEY_OWE_ME', 'I_OWE_THEM'] as EntryType[]).map((t) => (
              <button key={t} type="button" onClick={() => setEntryType(t)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
                  entryType === t
                    ? t === 'THEY_OWE_ME' ? 'bg-success/10 border-success/40 text-success' : 'bg-danger/10 border-danger/40 text-danger'
                    : 'bg-ink-800 border-ink-600 text-slate-500 hover:border-ink-500'
                }`}>
                <span className="text-xl">{t === 'THEY_OWE_ME' ? '💸' : '🤝'}</span>
                <span>{t === 'THEY_OWE_ME' ? `${personName} me deve` : `Eu devo a ${personName}`}</span>
              </button>
            ))}
          </div>
          <input type="hidden" name="type" value={entryType} />

          <FormField label="Descrição" htmlFor="description" required>
            <Input id="description" name="description"
              placeholder="Ex: Almoço, empréstimo, pensão..." required />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={mode === 'recorrente' ? 'Valor/mês (R$)' : mode === 'parcelado' ? 'Valor por parcela (R$)' : 'Valor (R$)'} htmlFor="amount" required>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01"
                placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </FormField>
            <FormField label="1ª data" htmlFor="date" required>
              <Input id="date" name="date" type="date" defaultValue={today} required />
            </FormField>
          </div>

          {/* Mode selector */}
          <div className="flex gap-2">
            {([
              { key: 'single',     label: 'Avulso',    icon: '💰' },
              { key: 'parcelado',  label: 'Parcelado', icon: '📅' },
              { key: 'recorrente', label: 'Recorrente', icon: '🔁' },
            ] as { key: Mode; label: string; icon: string }[]).map((m) => (
              <button key={m.key} type="button" onClick={() => setMode(m.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                  mode === m.key
                    ? 'bg-brand-800/60 border-brand-600/50 text-brand-300'
                    : 'bg-ink-800 border-ink-600 text-slate-500 hover:border-ink-500'
                }`}>
                <span>{m.icon}</span>{m.label}
              </button>
            ))}
          </div>

          {/* Parcelado options */}
          {mode === 'parcelado' && (
            <div className="flex flex-col gap-3 p-3 rounded-lg bg-ink-800/60 border border-ink-600">
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Total de parcelas" htmlFor="installments">
                  <div className="flex items-center gap-2">
                    <input type="number" min={2} max={120} value={installments}
                      onChange={(e) => { const v = Number(e.target.value); setInst(v); if (alreadyPaid >= v) setAlready(v - 1) }}
                      className="w-full bg-ink-700 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 text-center focus:outline-none focus:border-brand-500/50 tabular-nums" />
                    <span className="text-xs text-slate-500 shrink-0">parcelas</span>
                  </div>
                </FormField>
                <FormField label="Já pagas" htmlFor="alreadyPaid">
                  <div className="flex items-center gap-2">
                    <input type="number" min={0} max={installments - 1} value={alreadyPaid}
                      onChange={(e) => setAlready(Math.min(Number(e.target.value), installments - 1))}
                      className="w-full bg-ink-700 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 text-center focus:outline-none focus:border-brand-500/50 tabular-nums" />
                    <span className="text-xs text-slate-500 shrink-0">pagas</span>
                  </div>
                </FormField>
              </div>
              {amountNum > 0 && (
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-slate-400">
                    <span className="font-medium text-slate-200">{installments - alreadyPaid} parcelas restantes</span>
                    {' '}× {formatCurrency(amountNum)} = <span className="font-medium text-brand-300">{formatCurrency(amountNum * (installments - alreadyPaid))}</span>
                  </p>
                  {alreadyPaid > 0 && (
                    <p className="text-[11px] text-slate-600">
                      {alreadyPaid} parcela{alreadyPaid > 1 ? 's' : ''} já paga{alreadyPaid > 1 ? 's' : ''} não serão cadastradas
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Recorrente options */}
          {mode === 'recorrente' && (
            <div className="flex flex-col gap-3 p-3 rounded-lg bg-brand-900/30 border border-brand-700/40">
              <div className="flex items-center gap-2">
                <RefreshCw className="size-4 text-brand-400 shrink-0" />
                <p className="text-sm text-brand-300 font-medium">Pagamento mensal recorrente</p>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="size-3.5 text-slate-500 shrink-0" />
                <label className="text-xs text-slate-400 shrink-0">Todo dia</label>
                <input
                  type="number" min={1} max={28} value={dayOfMonth}
                  onChange={e => setDay(Math.min(28, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-16 bg-ink-700 border border-white/8 rounded-lg px-2 py-1 text-sm text-slate-200 text-center focus:outline-none focus:border-brand-500/50"
                />
                <span className="text-xs text-slate-500">de cada mês</span>
              </div>
              {amountNum > 0 && (
                <p className="text-xs text-success">
                  ✓ {formatCurrency(amountNum)}/mês — cria automaticamente todo dia {dayOfMonth}
                </p>
              )}
              <p className="text-[11px] text-slate-500">
                Repete indefinidamente. Para a qualquer momento na página da pessoa.
              </p>
            </div>
          )}

          {/* Category */}
          <FormField label="Categoria" htmlFor="categoryId">
            <CategorySelect categories={categories} value={categoryId} onChange={setCatId} placeholder="Opcional" />
            <input type="hidden" name="categoryId" value={categoryId} />
          </FormField>

          <FormField label="Observações" htmlFor="notes">
            <Textarea id="notes" name="notes" placeholder="Opcional" className="min-h-[56px]" />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending}>{submitLabel}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
