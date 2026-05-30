'use client'

import { useState } from 'react'
import { CategorySelect } from '@/components/ui/category-select'
import { Pencil } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface Category { id: string; name: string; icon: string; color: string }

interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string
  isRecurring: boolean
  notes: string | null
  categoryId: string | null
}

interface Props { bill: Bill; categories: Category[] }

export function EditBillModal({ bill, categories }: Props) {
  const [open, setOpen]        = useState(false)
  const [isRecurring, setRec]  = useState(bill.isRecurring)
  const [categoryId, setCatId] = useState(bill.categoryId ?? '')

  const dateStr = bill.dueDate.slice(0, 10)

  const { mutate, pending, error } = useMutation(
    (data: { name: string; amount: string; dueDate: string; categoryId: string; notes: string; isRecurring: boolean }) =>
      clientApi.updateBill(bill.id, {
        name: data.name,
        amount: parseFloat(data.amount),
        dueDate: data.dueDate,
        categoryId: data.categoryId || undefined,
        notes: data.notes || undefined,
        isRecurring: data.isRecurring,
      }),
    { onSuccess: () => setOpen(false) },
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    mutate({
      name: fd.get('name') as string,
      amount: fd.get('amount') as string,
      dueDate: fd.get('dueDate') as string,
      categoryId,
      notes: fd.get('notes') as string,
      isRecurring,
    })
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button onClick={() => setOpen(true)}
        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-brand-400 hover:bg-brand-400/10"
        title="Editar conta">
        <Pencil className="size-3.5" />
      </button>

      <ModalContent size="sm">
        <ModalHeader><ModalTitle>Editar conta</ModalTitle></ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <FormField label="Nome da conta" htmlFor="name" required>
            <Input id="name" name="name" type="text" defaultValue={bill.name} required />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Valor (R$)" htmlFor="amount" required>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01"
                defaultValue={bill.amount} required />
            </FormField>
            <FormField label="Vencimento" htmlFor="dueDate" required>
              <Input id="dueDate" name="dueDate" type="date" defaultValue={dateStr} required />
            </FormField>
          </div>

          <FormField label="Categoria" htmlFor="categoryId">
            <CategorySelect categories={categories} value={categoryId} onChange={setCatId} placeholder="Opcional" />
          </FormField>

          <FormField label="Observações" htmlFor="notes">
            <Textarea id="notes" name="notes" placeholder="Opcional"
              defaultValue={bill.notes ?? ''} className="min-h-[60px]" />
          </FormField>

          {/* Tipo: Avulso vs Recorrente */}
          <div className="flex gap-2">
            {([
              { val: false, label: 'Avulso',     icon: '💸', desc: 'Pago uma vez' },
              { val: true,  label: 'Recorrente', icon: '🔁', desc: 'Repete todo mês' },
            ]).map(({ val, label, icon, desc }) => (
              <button key={label} type="button" onClick={() => setRec(val)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isRecurring === val
                    ? 'bg-brand-800/60 border-brand-600/50 text-brand-300'
                    : 'bg-ink-800 border-ink-600 text-slate-500 hover:border-ink-500'
                }`}>
                <span className="text-base">{icon}</span>
                <span>{label}</span>
                <span className="text-[10px] text-slate-600">{desc}</span>
              </button>
            ))}
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending}>Salvar</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
