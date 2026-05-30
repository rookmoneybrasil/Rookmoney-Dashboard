'use client'

import { useState } from 'react'
import { CategorySelect } from '@/components/ui/category-select'
import { Pencil, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { getServiceBrand, QUICK_SERVICES } from '@/lib/service-brands'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface Category { id: string; name: string; icon: string; color: string }

interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  amount: string | number
  description: string | null
  date: Date | string
  categoryId: string
}

interface Props {
  transaction: Transaction
  categories: Category[]
}

export function EditTransactionModal({ transaction, categories }: Props) {
  const [open, setOpen]        = useState(false)
  const [type, setType]        = useState<'INCOME' | 'EXPENSE'>(transaction.type)
  const [categoryId, setCatId] = useState(transaction.categoryId)
  const [description, setDesc] = useState(transaction.description ?? '')

  const detectedBrand = getServiceBrand(description, undefined)

  const dateStr = typeof transaction.date === 'string'
    ? transaction.date.slice(0, 10)
    : new Date(transaction.date).toISOString().slice(0, 10)

  const { mutate, pending, error } = useMutation(
    (data: { amount: string; type: 'INCOME' | 'EXPENSE'; description: string; date: string; categoryId: string }) =>
      clientApi.updateTransaction(transaction.id, {
        amount: parseFloat(data.amount),
        type: data.type,
        description: data.description,
        date: data.date,
        categoryId: data.categoryId,
      }),
    { onSuccess: () => setOpen(false) },
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    mutate({
      amount: fd.get('amount') as string,
      type,
      description: fd.get('description') as string,
      date: fd.get('date') as string,
      categoryId,
    })
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-brand-400 hover:bg-brand-400/10"
        title="Editar"
      >
        <Pencil className="size-3.5" />
      </button>

      <ModalContent size="sm">
        <ModalHeader><ModalTitle>Editar transação</ModalTitle></ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="grid grid-cols-2 gap-1 rounded-lg bg-ink-900 p-1">
            {(['EXPENSE', 'INCOME'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
                  type === t
                    ? t === 'EXPENSE' ? 'bg-danger/15 text-danger border border-danger/20' : 'bg-success/15 text-success border border-success/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t === 'EXPENSE' ? <ArrowDownRight className="size-4" /> : <ArrowUpRight className="size-4" />}
                {t === 'EXPENSE' ? 'Despesa' : 'Receita'}
              </button>
            ))}
          </div>

          <FormField label="Valor (R$)" htmlFor="amount" required>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01"
              defaultValue={Number(transaction.amount)} required />
          </FormField>

          <FormField label="Descrição" htmlFor="description">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SERVICES.map(({ key, label, brand }) => {
                  const active = description.toLowerCase() === label.toLowerCase()
                  return (
                    <button key={key} type="button" onClick={() => setDesc(active ? '' : label)}
                      className="flex items-center gap-1.5 h-7 px-2 rounded-lg text-xs font-medium transition-all border"
                      style={active
                        ? { backgroundColor: brand.color, color: brand.text, borderColor: brand.color }
                        : { backgroundColor: brand.color + '18', color: brand.color, borderColor: brand.color + '40' }}
                    >
                      <span className="size-4 rounded flex items-center justify-center text-[9px] font-bold"
                        style={{ backgroundColor: brand.color, color: brand.text }}>
                        {brand.short}
                      </span>
                      {label}
                    </button>
                  )
                })}
              </div>
              <div className="relative">
                <Input id="description" name="description" type="text"
                  placeholder="Ou digite o nome do serviço..." value={description}
                  onChange={(e) => setDesc(e.target.value)} />
                {detectedBrand && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="size-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: detectedBrand.color, color: detectedBrand.text }}>
                      {detectedBrand.short}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Data" htmlFor="date" required>
              <Input id="date" name="date" type="date" defaultValue={dateStr} required />
            </FormField>
            <FormField label="Categoria" htmlFor="categoryId" required>
              <CategorySelect categories={categories} value={categoryId} onChange={setCatId} placeholder="Opcional" />
            </FormField>
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending} disabled={!categoryId}>Salvar</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
