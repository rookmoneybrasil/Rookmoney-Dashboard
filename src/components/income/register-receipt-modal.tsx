'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { ArrowDownToLine } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { registerReceipt } from '@/app/actions/income-sources'
import { triggerMascot } from '@/lib/mascot'

interface Category { id: string; name: string; icon: string; color: string }
interface Source { id: string; name: string; amount: number }
interface Props { source: Source; categories: Category[]; label?: string }

function getNthBusinessDay(n: number, ref = new Date()): string {
  const year  = ref.getFullYear()
  const month = ref.getMonth()
  let count = 0, day = 1
  while (count < n) {
    const dow = new Date(year, month, day).getDay()
    if (dow !== 0 && dow !== 6) count++
    if (count < n) day++
  }
  return new Date(year, month, day).toISOString().split('T')[0]
}

function formatShortDate(iso: string) {
  const [, m, d] = iso.split('-')
  return `${d}/${m}`
}

type DateOption = 'today' | 'bu1' | 'bu5' | 'bu10' | 'custom'

export function RegisterReceiptModal({ source, categories, label = 'Recebi' }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [open, setOpen]         = useState(false)
  const [categoryId, setCat]    = useState('')
  const [dateOpt, setDateOpt]   = useState<DateOption>('today')
  const [customDate, setCustom] = useState(today)
  const [state, formAction, pending] = useActionState(registerReceipt, undefined)

  const resolvedDate: Record<DateOption, string> = {
    today:  today,
    bu1:    getNthBusinessDay(1),
    bu5:    getNthBusinessDay(5),
    bu10:   getNthBusinessDay(10),
    custom: customDate,
  }
  const date = resolvedDate[dateOpt]

  useEffect(() => {
    if (state && !state.error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- useActionState has no completion callback; close modal and reset form after successful submission
      setOpen(false)
      setCat('')
      setDateOpt('today')
      triggerMascot('euphoric', `${source.name} recebido! Dinheiro na conta! 🎉`)
    }
  }, [state, source.name])

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-success/15 hover:bg-success/25 text-success text-sm font-medium transition-colors border border-success/20 shrink-0">
        <ArrowDownToLine className="size-3.5" />
        {label}
      </button>

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Registrar recebimento</ModalTitle>
        </ModalHeader>

        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          <div className="flex items-center gap-2 p-3 rounded-lg bg-ink-800/60">
            <ArrowDownToLine className="size-4 text-success shrink-0" />
            <span className="text-sm text-slate-300">{source.name}</span>
          </div>

          <input type="hidden" name="description" value={source.name} />
          <input type="hidden" name="sourceId" value={source.id} />

          <FormField label="Valor (R$)" htmlFor="amount" required>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01"
              defaultValue={source.amount} required />
          </FormField>

          {/* Date with business-day options */}
          <FormField label="Data do recebimento" htmlFor="date" required>
            <input type="hidden" name="date" value={date} />
            <div className="flex flex-col gap-2">
              {([
                { id: 'today', label: 'Hoje',         sub: formatShortDate(today) },
                { id: 'bu1',   label: '1º dia útil',  sub: formatShortDate(getNthBusinessDay(1)) },
                { id: 'bu5',   label: '5º dia útil',  sub: formatShortDate(getNthBusinessDay(5)) },
                { id: 'bu10',  label: '10º dia útil', sub: formatShortDate(getNthBusinessDay(10)) },
                { id: 'custom',label: 'Outra data',   sub: null },
              ] as { id: DateOption; label: string; sub: string | null }[]).map(({ id, label, sub }) => (
                <label key={id} className="flex items-center gap-3 cursor-pointer group/opt">
                  <div
                    onClick={() => setDateOpt(id)}
                    className={`size-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      dateOpt === id ? 'border-brand-500 bg-brand-500' : 'border-ink-500 group-hover/opt:border-ink-400'
                    }`}
                  >
                    {dateOpt === id && <div className="size-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm text-slate-300 flex-1">{label}</span>
                  {sub && <span className="text-xs text-slate-600 tabular-nums">{sub}</span>}
                </label>
              ))}
              {dateOpt === 'custom' && (
                <DateInput
                  id="date"
                  value={customDate}
                  onValueChange={setCustom}
                  className="mt-1"
                  required
                />
              )}
            </div>
          </FormField>

          <FormField label="Categoria" htmlFor="categoryId" required>
            <Select value={categoryId} onValueChange={setCat}>
              <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="categoryId" value={categoryId} />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending} disabled={!categoryId}>Confirmar</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
