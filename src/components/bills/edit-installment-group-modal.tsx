'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { CategorySelect } from '@/components/ui/category-select'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface Category { id: string; name: string; icon: string; color: string }

interface Props {
  groupId: string
  name: string
  amount: number
  categoryId: string | null
  notes: string | null
  total: number
  paidCount: number
  categories: Category[]
}

export function EditInstallmentGroupModal({ groupId, name, amount, categoryId, notes, total, paidCount, categories }: Props) {
  const [open, setOpen]      = useState(false)
  const [catId, setCatId]    = useState(categoryId ?? '')
  const remaining = total - paidCount

  const { mutate, pending, error } = useMutation(
    (data: { name: string; amount: string; categoryId: string; notes: string }) =>
      clientApi.updateBillGroup(groupId, {
        name: data.name,
        amount: parseFloat(data.amount),
        categoryId: data.categoryId || undefined,
        notes: data.notes || undefined,
      }),
    { onSuccess: () => setOpen(false) },
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    mutate({
      name: fd.get('name') as string,
      amount: fd.get('amount') as string,
      categoryId: catId,
      notes: fd.get('notes') as string,
    })
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button onClick={() => setOpen(true)}
        className="size-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-brand-400 hover:bg-brand-400/10 transition-colors"
        title="Editar parcelamento">
        <Pencil className="size-3.5" />
      </button>

      <ModalContent size="sm">
        <ModalHeader><ModalTitle>Editar parcelamento</ModalTitle></ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="bg-brand-900/20 border border-brand-700/30 rounded-lg px-3 py-2 text-xs text-slate-400">
            As alterações de valor e categoria serão aplicadas nas <strong className="text-slate-200">{remaining} parcelas pendentes</strong>.
            {paidCount > 0 && <> As {paidCount} já pagas mantêm o valor original.</>}
          </div>

          <FormField label="Nome" htmlFor="name" required>
            <Input id="name" name="name" type="text" defaultValue={name} required />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Valor por parcela" htmlFor="amount" required>
              <CurrencyInput id="amount" name="amount" defaultValue={amount} required />
            </FormField>
            <div className="flex flex-col gap-1 justify-end">
              <span className="text-xs text-slate-600">{total}x parcelas</span>
              <span className="text-xs text-slate-500">{paidCount} paga{paidCount !== 1 ? 's' : ''} · {remaining} pendente{remaining !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <FormField label="Categoria" htmlFor="categoryId">
            <CategorySelect categories={categories} value={catId} onChange={setCatId} placeholder="Opcional" />
          </FormField>

          <FormField label="Observações" htmlFor="notes">
            <Textarea id="notes" name="notes" placeholder="Opcional"
              defaultValue={notes ?? ''} className="min-h-[60px]" />
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
