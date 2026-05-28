'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { Pencil } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { updateBill } from '@/app/actions/bills'

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
  const [open, setOpen]          = useState(false)
  const [isRecurring, setRec]    = useState(bill.isRecurring)
  const [categoryId, setCatId]   = useState(bill.categoryId ?? '')

  const boundAction = updateBill.bind(null, bill.id)
  const [state, formAction, pending] = useActionState(boundAction, undefined)

  const dateStr = bill.dueDate.slice(0, 10)

  useEffect(() => {
    if (state && !state.error) setOpen(false)
  }, [state])

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button onClick={() => setOpen(true)}
        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-brand-400 hover:bg-brand-400/10"
        title="Editar conta">
        <Pencil className="size-3.5" />
      </button>

      <ModalContent size="sm">
        <ModalHeader><ModalTitle>Editar conta</ModalTitle></ModalHeader>

        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{state.error}</p>
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
            <Select value={categoryId} onValueChange={setCatId}>
              <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="categoryId" value={categoryId} />
          </FormField>

          <FormField label="Observações" htmlFor="notes">
            <Textarea id="notes" name="notes" placeholder="Opcional"
              defaultValue={bill.notes ?? ''} className="min-h-[60px]" />
          </FormField>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="hidden" name="isRecurring" value={isRecurring ? 'true' : 'false'} />
            <div onClick={() => setRec(!isRecurring)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${isRecurring ? 'bg-brand-600' : 'bg-ink-600'}`}>
              <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${isRecurring ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-slate-300">Recorrente (mensal)</span>
          </label>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending}>Salvar</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
