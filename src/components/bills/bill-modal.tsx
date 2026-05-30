'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { triggerMascot } from '@/lib/mascot'
import { formatCurrency } from '@/lib/utils'
import { getServiceBrand, QUICK_BILL_SERVICES } from '@/lib/service-brands'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

interface Props {
  categories: Category[]
}

export function BillModal({ categories }: Props) {
  const [open, setOpen]             = useState(false)
  const [isRecurring, setRec]       = useState(false)
  const [categoryId, setCatId]      = useState('')
  const [isParcelado, setParcelado] = useState(false)
  const [installments, setInst]     = useState(2)
  const [amount, setAmount]         = useState('')
  const [name, setName]             = useState('')

  const detectedBrand = getServiceBrand(name, undefined)

  const { mutate, pending, error } = useMutation(
    (data: { name: string; amount: string; dueDate: string; isRecurring: boolean; categoryId: string; installments?: number; notes: string }) =>
      clientApi.createBill({
        name: data.name,
        amount: parseFloat(data.amount),
        dueDate: data.dueDate,
        isRecurring: data.isRecurring,
        categoryId: data.categoryId || undefined,
        installments: data.installments,
        notes: data.notes || undefined,
      }),
    {
      onSuccess: () => {
        setOpen(false)
        setRec(false)
        setCatId('')
        setParcelado(false)
        setInst(2)
        setAmount('')
        setName('')
        triggerMascot('determined', 'Conta registrada! Não esqueça de pagar no prazo. 📅')
      },
    },
  )

  const today          = new Date().toISOString().split('T')[0]
  const amountNum      = parseFloat(amount) || 0
  const perInstallment = isParcelado && installments > 1 ? amountNum / installments : amountNum

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    mutate({
      name,
      amount,
      dueDate: fd.get('dueDate') as string,
      isRecurring,
      categoryId,
      installments: isParcelado ? installments : undefined,
      notes: fd.get('notes') as string,
    })
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shrink-0"
      >
        <Plus className="size-3.5" />
        Nova conta
      </button>

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Nova conta a pagar</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Name field with quick-pick chips */}
          <FormField label="Nome da conta" htmlFor="name" required>
            <div className="flex flex-col gap-2">
              {/* Service chips */}
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {QUICK_BILL_SERVICES.map(({ key, label, brand }) => {
                  const active = name.toLowerCase() === label.toLowerCase()
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setName(active ? '' : label)}
                      className="flex items-center gap-1.5 h-7 px-2 rounded-lg text-xs font-medium transition-all border shrink-0"
                      style={
                        active
                          ? { backgroundColor: brand.color, color: brand.text, borderColor: brand.color }
                          : { backgroundColor: brand.color + '18', color: brand.color, borderColor: brand.color + '40' }
                      }
                    >
                      <span
                        className="size-4 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                        style={{ backgroundColor: brand.color, color: brand.text }}
                      >
                        {brand.short}
                      </span>
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Manual input */}
              <div className="relative">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Ou digite o nome da conta..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                {detectedBrand && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                    <div
                      className="size-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: detectedBrand.color, color: detectedBrand.text }}
                    >
                      {detectedBrand.short}
                    </div>
                  </div>
                )}
              </div>
            </div>
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

            <FormField label="1º vencimento" htmlFor="dueDate" required>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                defaultValue={today}
                required
              />
            </FormField>
          </div>

          {/* Parcelado toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => { setParcelado(!isParcelado); setRec(false) }}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none ${
                isParcelado ? 'bg-brand-600' : 'bg-ink-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                  isParcelado ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className="text-sm text-slate-300">Parcelado</span>
          </label>

          {isParcelado && (
            <div className="flex flex-col gap-3 p-3 rounded-lg bg-ink-800/60 border border-ink-600">
              <FormField label="Número de parcelas" htmlFor="installments">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    id="installments"
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
                  {installments}× <span className="text-slate-300 font-medium">{formatCurrency(perInstallment)}</span> ={' '}
                  {formatCurrency(amountNum)} total
                </p>
              )}
            </div>
          )}

          {/* Recorrente toggle */}
          {!isParcelado && (
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => setRec(!isRecurring)}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none ${
                  isRecurring ? 'bg-brand-600' : 'bg-ink-600'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                    isRecurring ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-sm text-slate-300">Recorrente (mensal)</span>
            </label>
          )}

          <FormField label="Categoria" htmlFor="categoryId">
            <CategorySelect categories={categories} value={categoryId} onChange={setCatId} placeholder="Opcional" />
          </FormField>

          <FormField label="Observações" htmlFor="notes">
            <Textarea
              id="notes"
              name="notes"
              placeholder="Opcional"
              className="min-h-[60px]"
            />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending} disabled={!name.trim()}>
              {isParcelado ? `Criar ${installments} parcelas` : 'Adicionar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
