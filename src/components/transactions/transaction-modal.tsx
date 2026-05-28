'use client'

import { useState } from 'react'
import { Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getServiceBrand, QUICK_SERVICES } from '@/lib/service-brands'
import { triggerMascot } from '@/lib/mascot'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
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
  id: string
  name: string
  icon: string
  color: string
}

interface Props {
  categories: Category[]
}

export function TransactionModal({ categories }: Props) {
  const [open, setOpen]        = useState(false)
  const [type, setType]        = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [categoryId, setCatId] = useState('')
  const [description, setDesc] = useState('')

  const detectedBrand = getServiceBrand(description, undefined)

  const { mutate, pending, error } = useMutation(
    (data: { amount: string; type: 'INCOME' | 'EXPENSE'; description: string; date: string; categoryId: string }) =>
      clientApi.createTransaction({
        amount: parseFloat(data.amount),
        type: data.type,
        description: data.description,
        date: data.date,
        categoryId: data.categoryId,
      }),
    {
      onSuccess: () => {
        setOpen(false)
        setType('EXPENSE')
        setCatId('')
        setDesc('')
        if (type === 'INCOME') {
          triggerMascot('happy', 'Receita registrada! Dinheiro entrando! 💵')
        } else {
          triggerMascot('counting', 'Despesa registrada! Fique de olho no saldo. 📝')
        }
      },
    },
  )

  const today = new Date().toISOString().split('T')[0]

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
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shrink-0"
      >
        <Plus className="size-3.5" />
        Nova transação
      </button>

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Nova transação</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-ink-900 p-1">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
                type === 'EXPENSE'
                  ? 'bg-danger/15 text-danger border border-danger/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <ArrowDownRight className="size-4" />
              Despesa
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md text-sm font-medium transition-colors ${
                type === 'INCOME'
                  ? 'bg-success/15 text-success border border-success/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <ArrowUpRight className="size-4" />
              Receita
            </button>
          </div>

          <FormField label="Valor (R$)" htmlFor="amount" required>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              required
            />
          </FormField>

          <FormField label="Descrição" htmlFor="description">
            <div className="flex flex-col gap-2">
              {/* Quick-pick service chips */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SERVICES.map(({ key, label, brand }) => {
                  const active = description.toLowerCase() === label.toLowerCase()
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDesc(active ? '' : label)}
                      className="flex items-center gap-1.5 h-7 px-2 rounded-lg text-xs font-medium transition-all border"
                      style={
                        active
                          ? { backgroundColor: brand.color, color: brand.text, borderColor: brand.color }
                          : { backgroundColor: brand.color + '18', color: brand.color, borderColor: brand.color + '40' }
                      }
                    >
                      <span
                        className="size-4 rounded flex items-center justify-center text-[9px] font-bold"
                        style={{ backgroundColor: brand.color, color: brand.text }}
                      >
                        {brand.short}
                      </span>
                      {label}
                    </button>
                  )
                })}
              </div>

              {/* Manual description input */}
              <div className="relative">
                <Input
                  id="description"
                  name="description"
                  type="text"
                  placeholder="Ou digite o nome do serviço..."
                  value={description}
                  onChange={(e) => setDesc(e.target.value)}
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
            <FormField label="Data" htmlFor="date" required>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={today}
                required
              />
            </FormField>

            <FormField label="Categoria" htmlFor="categoryId" required>
              <Select value={categoryId} onValueChange={setCatId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={pending} disabled={!categoryId}>
              Adicionar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
