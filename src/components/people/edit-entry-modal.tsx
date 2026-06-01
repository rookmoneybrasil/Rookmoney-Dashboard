'use client'

import { useState } from 'react'
import { Pencil, TrendingUp, TrendingDown } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { CategorySelect } from '@/components/ui/category-select'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import type { PersonEntryRow } from '@/lib/api-client'

interface Category { id: string; name: string; icon: string; color: string }

interface Props {
  entry:      PersonEntryRow
  categories: Category[]
  isGroup?:   boolean
  groupSize?: number
}

export function EditEntryModal({ entry, categories, isGroup, groupSize }: Props) {
  const [open,       setOpen]    = useState(false)
  const [categoryId, setCatId]   = useState(entry.categoryId ?? '')
  const [entryType,  setType]    = useState(entry.type)

  const dateStr  = entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  const baseDesc = entry.description.replace(/\s*\(\d+\/\d+\)$/, '')

  const { mutate, pending, error } = useMutation(
    (data: Record<string, string>) =>
      clientApi.editEntry(entry.id, {
        type:         entryType,
        description:  data.description,
        amount:       parseFloat(data.amount),
        date:         data.date || undefined,
        categoryId:   categoryId || null,
        notes:        data.notes || null,
        applyToGroup: isGroup,
      }),
    { onSuccess: () => { setOpen(false); window.location.reload() } },
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    mutate({
      description: fd.get('description') as string,
      amount:      fd.get('amount') as string,
      date:        fd.get('date') as string,
      notes:       fd.get('notes') as string,
    })
  }

  const personName = entry.description // fallback — idealmente viria do parent

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button onClick={() => setOpen(true)} title="Editar"
        className="flex items-center justify-center size-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-ink-600 transition-colors shrink-0">
        <Pencil className="size-3.5" />
      </button>

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>
            {isGroup ? `Editar grupo (${groupSize} parcelas)` : 'Editar lançamento'}
          </ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          {isGroup && (
            <p className="text-xs text-slate-500 bg-ink-700/60 border border-white/6 rounded-lg px-3 py-2">
              💡 Alterações serão aplicadas a todas as {groupSize} parcelas pendentes.
            </p>
          )}

          {/* Direção: quem deve a quem */}
          <div className="flex gap-2">
            <button type="button" onClick={() => setType('THEY_OWE_ME')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                entryType === 'THEY_OWE_ME'
                  ? 'bg-success/10 border-success/40 text-success'
                  : 'bg-ink-800 border-ink-600 text-slate-500 hover:border-ink-500'
              }`}>
              <TrendingUp className="size-4" />
              Me deve
            </button>
            <button type="button" onClick={() => setType('I_OWE_THEM')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                entryType === 'I_OWE_THEM'
                  ? 'bg-danger/10 border-danger/40 text-danger'
                  : 'bg-ink-800 border-ink-600 text-slate-500 hover:border-ink-500'
              }`}>
              <TrendingDown className="size-4" />
              Eu devo
            </button>
          </div>

          <FormField label="Descrição" htmlFor="description" required>
            <Input id="description" name="description" defaultValue={baseDesc} required />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={isGroup ? 'Valor por parcela (R$)' : 'Valor (R$)'} htmlFor="amount" required>
              <CurrencyInput id="amount" name="amount" defaultValue={Number(entry.amount)} required />
            </FormField>
            <FormField label={isGroup ? 'Data da próxima' : 'Data'} htmlFor="date">
              <Input id="date" name="date" type="date" defaultValue={dateStr} />
            </FormField>
          </div>

          <FormField label="Categoria" htmlFor="categoryId">
            <CategorySelect categories={categories} value={categoryId} onChange={setCatId} placeholder="Sem categoria" />
          </FormField>

          <FormField label="Observações" htmlFor="notes">
            <Textarea id="notes" name="notes" defaultValue={entry.notes ?? ''} className="min-h-[56px]" placeholder="Opcional" />
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
