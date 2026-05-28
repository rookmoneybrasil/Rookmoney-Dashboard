'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { setBudget } from '@/app/actions/budgets'
import { triggerMascot } from '@/lib/mascot'

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
  const [state, formAction, pending] = useActionState(setBudget, undefined)

  useEffect(() => {
    if (state && !state.error) {
      setOpen(false)
      if (!isEdit) {
        setCat('')
        triggerMascot('determined', 'Orçamento definido! Planejamento é tudo! 💪')
      }
    }
  }, [state, isEdit])

  return (
    <Modal open={open} onOpenChange={setOpen}>
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

        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          <input type="hidden" name="month" value={month} />

          {isEdit ? (
            <>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-ink-800/60">
                <div className="size-9 rounded-xl flex items-center justify-center text-lg"
                  style={{ backgroundColor: budget!.category.color + '22', color: budget!.category.color }}>
                  {budget!.category.icon}
                </div>
                <span className="text-sm text-slate-300">{budget!.category.name}</span>
              </div>
              <input type="hidden" name="categoryId" value={budget!.categoryId} />
            </>
          ) : (
            <FormField label="Categoria" htmlFor="categoryId" required>
              <Select value={categoryId} onValueChange={setCat}>
                <SelectTrigger><SelectValue placeholder="Selecionar categoria" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="categoryId" value={categoryId} />
            </FormField>
          )}

          <FormField label="Limite mensal (R$)" htmlFor="amount" required>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01"
              placeholder="0,00" defaultValue={budget?.amount} required />
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
