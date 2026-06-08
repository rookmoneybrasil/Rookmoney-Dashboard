'use client'

import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { CategorySelect } from '@/components/ui/category-select'
import { triggerMascot } from '@/lib/mascot'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface Category { id: string; name: string; icon: string; color: string }

interface BudgetEntry {
  id: string
  amount: number
  categoryId: string
  category: { name: string; icon: string; color: string }
}

interface Props {
  categories: Category[]
  month: string
  budget?: BudgetEntry
}

export function BudgetModal({ categories, month, budget }: Props) {
  const isEdit = !!budget
  const [open, setOpen]      = useState(false)
  const [categoryId, setCat] = useState(budget?.categoryId ?? '')

  const { mutate, pending, error } = useMutation(
    (data: { categoryId: string; amount: string; month: string }) =>
      clientApi.upsertBudget({
        categoryId: data.categoryId,
        amount: parseFloat(data.amount),
        month: data.month,
      }),
    {
      onSuccess: () => {
        setOpen(false)
        if (!isEdit) {
          setCat('')
          triggerMascot('determined', 'Orçamento definido! Planejamento é tudo! 💪')
        }
      },
    },
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    mutate({
      categoryId: isEdit ? budget!.categoryId : categoryId,
      amount: fd.get('amount') as string,
      month,
    })
  }

  return (
    <Modal open={open} onOpenChange={(v) => { setOpen(v); if (!v && !isEdit) setCat('') }}>
      {isEdit ? (
        <button onClick={() => setOpen(true)}
          className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-brand-400 hover:bg-brand-400/10 transition-colors"
          title="Editar orçamento">
          <Pencil className="size-3.5" />
        </button>
      ) : (
        <button onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shrink-0">
          <Plus className="size-3.5" />
          Definir orçamento
        </button>
      )}

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{isEdit ? 'Editar orçamento' : 'Definir orçamento'}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          {isEdit ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-ink-800/60">
              <div className="size-9 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: budget!.category.color + '22', color: budget!.category.color }}>
                {budget!.category.icon}
              </div>
              <span className="text-sm text-slate-300">{budget!.category.name}</span>
            </div>
          ) : (
            <FormField label="Categoria" htmlFor="categoryId" required>
              <CategorySelect categories={categories} value={categoryId} onChange={setCat} placeholder="Selecionar categoria" />
            </FormField>
          )}

          <FormField label="Limite mensal (R$)" htmlFor="amount" required>
            <CurrencyInput id="amount" name="amount" defaultValue={budget?.amount} required />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending} disabled={!isEdit && !categoryId}>
              {isEdit ? 'Salvar' : 'Definir'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
