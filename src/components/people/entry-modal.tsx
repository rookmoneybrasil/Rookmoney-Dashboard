'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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

interface Category {
  id: string; name: string; icon: string; color: string
}

interface Props {
  personId:   string
  personName: string
  categories: Category[]
}

type EntryType = 'THEY_OWE_ME' | 'I_OWE_THEM'

export function EntryModal({ personId, personName, categories }: Props) {
  const [open, setOpen]              = useState(false)
  const [entryType, setEntryType]    = useState<EntryType>('THEY_OWE_ME')
  const [isParcelado, setParcelado]  = useState(false)
  const [installments, setInst]      = useState(2)
  const [amount, setAmount]          = useState('')
  const [categoryId, setCatId]       = useState('')

  const { mutate, pending, error } = useMutation(
    (data: Parameters<typeof clientApi.createEntry>[1] & { installments?: number }) =>
      clientApi.createEntry(personId, data),
    {
      onSuccess: () => {
        setOpen(false)
        setEntryType('THEY_OWE_ME')
        setParcelado(false)
        setInst(2)
        setAmount('')
        setCatId('')
      },
    },
  )

  const today         = new Date().toISOString().split('T')[0]
  const amountNum     = parseFloat(amount) || 0
  const perInst       = isParcelado && installments > 1
    ? Math.round((amountNum / installments) * 100) / 100
    : amountNum

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
              amount:       parseFloat(fd.get('amount') as string),
              date:         fd.get('date') as string,
              notes:        (fd.get('notes') as string) || null,
              categoryId:   (fd.get('categoryId') as string) || null,
              installments: parseInt(fd.get('installments') as string, 10) || 1,
            })
          }}
          className="flex flex-col gap-4"
        >
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Direction toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEntryType('THEY_OWE_ME')}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
                entryType === 'THEY_OWE_ME'
                  ? 'bg-success/10 border-success/40 text-success'
                  : 'bg-ink-800 border-ink-600 text-slate-500 hover:border-ink-500'
              }`}
            >
              <span className="text-xl">💸</span>
              <span>{personName} me deve</span>
            </button>
            <button
              type="button"
              onClick={() => setEntryType('I_OWE_THEM')}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
                entryType === 'I_OWE_THEM'
                  ? 'bg-danger/10 border-danger/40 text-danger'
                  : 'bg-ink-800 border-ink-600 text-slate-500 hover:border-ink-500'
              }`}
            >
              <span className="text-xl">🤝</span>
              <span>Eu devo a {personName}</span>
            </button>
          </div>
          <input type="hidden" name="type" value={entryType} />

          <FormField label="Descrição" htmlFor="description" required>
            <Input
              id="description"
              name="description"
              placeholder="Ex: Almoço, empréstimo, divisão de conta..."
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={isParcelado ? 'Valor total (R$)' : 'Valor (R$)'} htmlFor="amount" required>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </FormField>

            <FormField label="1ª data" htmlFor="date" required>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={today}
                required
              />
            </FormField>
          </div>

          {/* Parcelado toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => { setParcelado(!isParcelado); setInst(2) }}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none ${
                isParcelado ? 'bg-brand-600' : 'bg-ink-600'
              }`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                isParcelado ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
              }`} />
            </div>
            <span className="text-sm text-slate-300">Parcelado</span>
          </label>

          {isParcelado && (
            <div className="flex flex-col gap-3 p-3 rounded-lg bg-ink-800/60 border border-ink-600">
              <FormField label="Número de parcelas" htmlFor="installments">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={2}
                    max={48}
                    value={installments}
                    onChange={(e) => setInst(Number(e.target.value))}
                    className="flex-1 accent-brand-500"
                  />
                  <span className="text-sm font-semibold text-brand-400 w-12 text-center tabular-nums">
                    {installments}x
                  </span>
                </div>
              </FormField>
              {amountNum > 0 && (
                <p className="text-xs text-slate-500">
                  {installments}× <span className="text-slate-300 font-medium">{formatCurrency(perInst)}</span>
                  {' '}= {formatCurrency(amountNum)} total · datas mensais automáticas
                </p>
              )}
            </div>
          )}
          <input type="hidden" name="installments" value={isParcelado ? installments : 1} />

          {/* Category */}
          <FormField label="Categoria" htmlFor="categoryId">
            <Select value={categoryId} onValueChange={setCatId}>
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="categoryId" value={categoryId} />
          </FormField>

          <FormField label="Observações" htmlFor="notes">
            <Textarea
              id="notes"
              name="notes"
              placeholder="Opcional"
              className="min-h-[56px]"
            />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              {isParcelado ? `Criar ${installments} parcelas` : 'Registrar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
