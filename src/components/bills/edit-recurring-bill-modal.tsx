'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { CategorySelect } from '@/components/ui/category-select'
import { AccountPicker } from '@/components/ui/account-picker'
import { clientApi, type RecurringBill, type Category } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface Props { bill: RecurringBill; categories: Category[] }

export function EditRecurringBillModal({ bill, categories }: Props) {
  const [open, setOpen] = useState(false)
  const [categoryId, setCatId] = useState(bill.categoryId ?? '')
  const [accountId, setAccId]  = useState(bill.accountId ?? '')

  const { mutate, pending, error } = useMutation(
    (data: { name: string; amount: string; dayOfMonth: string; notes: string }) =>
      clientApi.updateRecurringBill(bill.id, {
        name:       data.name,
        amount:     parseFloat(data.amount),
        dayOfMonth: parseInt(data.dayOfMonth) || bill.dayOfMonth,
        categoryId: categoryId || null,
        accountId:  accountId || null,
        notes:      data.notes || null,
      }),
    { onSuccess: () => setOpen(false) },
  )

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="size-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors"
        title="Editar"
      >
        <Pencil className="size-3.5" />
      </button>

      <ModalContent size="sm">
        <ModalHeader><ModalTitle>Editar conta fixa</ModalTitle></ModalHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            mutate({
              name:       fd.get('name') as string,
              amount:     fd.get('amount') as string,
              dayOfMonth: fd.get('dayOfMonth') as string,
              notes:      fd.get('notes') as string,
            })
          }}
          className="flex flex-col gap-4"
        >
          {error && <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>}

          <FormField label="Nome" htmlFor="rb-name" required>
            <Input id="rb-name" name="name" defaultValue={bill.name} required />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Valor (R$)" htmlFor="rb-amount" required>
              <CurrencyInput id="rb-amount" name="amount" defaultValue={bill.amount} required />
            </FormField>
            <FormField label="Todo dia" htmlFor="rb-day" required>
              <Input id="rb-day" name="dayOfMonth" type="number" min={1} max={31}
                defaultValue={bill.dayOfMonth} required />
            </FormField>
          </div>

          <FormField label="Categoria" htmlFor="rb-cat">
            <CategorySelect categories={categories} value={categoryId} onChange={setCatId} placeholder="Opcional" />
          </FormField>

          <AccountPicker value={accountId} onChange={setAccId} />

          <FormField label="Observações" htmlFor="rb-notes">
            <Textarea id="rb-notes" name="notes" defaultValue={bill.notes ?? ''} className="min-h-[56px]" />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending}>Salvar</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
