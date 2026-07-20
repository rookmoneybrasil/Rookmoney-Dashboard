'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { CategorySelect } from '@/components/ui/category-select'
import { AccountPicker } from '@/components/ui/account-picker'
import { clientApi, type PersonEntryRecurringItem } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface Category { id: string; name: string; icon: string; color: string }
interface Props { item: PersonEntryRecurringItem; categories: Category[] }

export function EditRecurringModal({ item, categories }: Props) {
  const [open, setOpen]       = useState(false)
  const [categoryId, setCatId] = useState(item.categoryId ?? '')
  const [accountId,  setAccId] = useState<string | null>(item.accountId ?? null)

  const { mutate, pending, error } = useMutation(
    (data: { description: string; amount: string; dayOfMonth: string; notes: string }) =>
      clientApi.updatePersonRecurring(item.id, {
        description: data.description,
        amount:      parseFloat(data.amount),
        dayOfMonth:  parseInt(data.dayOfMonth) || item.dayOfMonth,
        categoryId:  categoryId || null,
        accountId,
        notes:       data.notes || null,
      }),
    { onSuccess: () => setOpen(false) },
  )

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-ink-700 transition-colors"
        title="Editar recorrente"
      >
        <Pencil className="size-3.5" />
      </button>

      <ModalContent size="sm">
        <ModalHeader><ModalTitle>Editar recorrente</ModalTitle></ModalHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            mutate({
              description: fd.get('description') as string,
              amount:      fd.get('amount')      as string,
              dayOfMonth:  fd.get('dayOfMonth')  as string,
              notes:       fd.get('notes')       as string,
            })
          }}
          className="flex flex-col gap-4"
        >
          {error && <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>}

          <FormField label="Descrição" htmlFor="er-desc" required>
            <Input id="er-desc" name="description" defaultValue={item.description} required />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Valor (R$)" htmlFor="er-amount" required>
              <CurrencyInput id="er-amount" name="amount" defaultValue={item.amount} required />
            </FormField>
            <FormField label="Todo dia" htmlFor="er-day" required>
              <Input id="er-day" name="dayOfMonth" type="number" min={1} max={31} defaultValue={item.dayOfMonth} required />
            </FormField>
          </div>

          <FormField label="Categoria" htmlFor="er-cat">
            <CategorySelect categories={categories} value={categoryId} onChange={setCatId} placeholder="Opcional" />
          </FormField>
          <AccountPicker value={accountId} onChange={setAccId} />

          <FormField label="Observações" htmlFor="er-notes">
            <Textarea id="er-notes" name="notes" defaultValue={item.notes ?? ''} className="min-h-[56px]" />
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
