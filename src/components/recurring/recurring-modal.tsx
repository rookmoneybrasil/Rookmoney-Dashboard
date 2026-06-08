'use client'

import { useState, useEffect } from 'react'
import { CategorySelect } from '@/components/ui/category-select'
import { Plus, Pencil } from 'lucide-react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface Category {
  id:    string
  name:  string
  icon:  string
  color: string
}

interface RecurringItem {
  id:          string
  name:        string
  type:        string
  amount:      number
  categoryId:  string
  frequency:   string
  dayOfMonth:  number | null
  description: string | null
}

interface Props {
  categories: Category[]
  item?:      RecurringItem
}

export function RecurringModal({ categories, item }: Props) {
  const isEdit = !!item

  const [open, setOpen]            = useState(false)
  const [type, setType]            = useState(item?.type ?? 'EXPENSE')
  const [categoryId, setCatId]     = useState(item?.categoryId ?? '')
  const [frequency, setFrequency]  = useState(item?.frequency ?? 'MONTHLY')

  const { mutate, pending, error } = useMutation(
    (data: Parameters<typeof clientApi.createRecurring>[0]) =>
      isEdit
        ? clientApi.updateRecurring(item.id, data)
        : clientApi.createRecurring(data),
    { onSuccess: () => setOpen(false) },
  )

  // Re-init state when item changes
  useEffect(() => {
    if (item) {
      setType(item.type)
      setCatId(item.categoryId)
      setFrequency(item.frequency)
    }
  }, [item])

  return (
    <Modal open={open} onOpenChange={(v) => { setOpen(v); if (!v && !isEdit) { setType('EXPENSE'); setCatId(''); setFrequency('MONTHLY') } }}>
      {isEdit ? (
        <button
          onClick={() => setOpen(true)}
          className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors"
          title="Editar"
        >
          <Pencil className="size-3.5" />
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="size-3.5" />
          Nova recorrência
        </button>
      )}

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{isEdit ? 'Editar recorrência' : 'Nova recorrência'}</ModalTitle>
        </ModalHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const dayRaw = fd.get('dayOfMonth') as string
            mutate({
              name:        fd.get('name') as string,
              type:        fd.get('type') as 'INCOME' | 'EXPENSE',
              amount:      parseFloat(fd.get('amount') as string),
              frequency:   fd.get('frequency') as string,
              dayOfMonth:  dayRaw ? parseInt(dayRaw, 10) : null,
              description: (fd.get('description') as string) || null,
              categoryId:  fd.get('categoryId') as string,
            })
          }}
          className="flex flex-col gap-4"
        >
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <FormField label="Nome" htmlFor="name" required>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ex: Netflix, Aluguel..."
              defaultValue={item?.name}
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tipo" htmlFor="type" required>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXPENSE">Despesa</SelectItem>
                  <SelectItem value="INCOME">Receita</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="type" value={type} />
            </FormField>

            <FormField label="Valor (R$)" htmlFor="amount" required>
              <CurrencyInput id="amount" name="amount" defaultValue={item?.amount} required />
            </FormField>
          </div>

          <FormField label="Categoria" htmlFor="categoryId" required>
            <CategorySelect categories={categories} value={categoryId} onChange={setCatId} placeholder="Opcional" />
            <input type="hidden" name="categoryId" value={categoryId} />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Frequência" htmlFor="frequency">
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Mensal</SelectItem>
                  <SelectItem value="WEEKLY">Semanal</SelectItem>
                  <SelectItem value="YEARLY">Anual</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="frequency" value={frequency} />
            </FormField>

            {frequency === 'MONTHLY' && (
              <FormField label="Dia do mês" htmlFor="dayOfMonth">
                <Input
                  id="dayOfMonth"
                  name="dayOfMonth"
                  type="number"
                  min={1}
                  max={31}
                  placeholder="Ex: 15"
                  defaultValue={item?.dayOfMonth ?? undefined}
                />
              </FormField>
            )}
          </div>

          <FormField label="Descrição" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              placeholder="Opcional"
              className="min-h-[60px]"
              defaultValue={item?.description ?? undefined}
            />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending} disabled={!categoryId}>
              {isEdit ? 'Salvar' : 'Criar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
