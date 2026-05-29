'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import type { PersonEntryRow } from '@/lib/api-client'

interface Category { id: string; name: string; icon: string; color: string }

interface Props {
  entry:        PersonEntryRow
  categories:   Category[]
  isGroup?:     boolean   // true when editing all installments in a group
  groupSize?:   number
}

export function EditEntryModal({ entry, categories, isGroup, groupSize }: Props) {
  const [open, setOpen]         = useState(false)
  const [categoryId, setCatId]  = useState(entry.categoryId ?? '')
  const router = useRouter()

  const dateStr = entry.date
    ? new Date(entry.date).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0]

  const { mutate, pending, error } = useMutation(
    (data: Record<string, string>) =>
      clientApi.editEntry(entry.id, {
        description:  data.description,
        amount:       parseFloat(data.amount),
        date:         isGroup ? undefined : data.date,
        categoryId:   categoryId || null,
        notes:        data.notes || null,
        applyToGroup: isGroup,
      }),
    { onSuccess: () => { setOpen(false); router.refresh() } },
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

  // Strip "(X/Y)" suffix from description for editing
  const baseDesc = entry.description.replace(/\s*\(\d+\/\d+\)$/, '')

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        title="Editar"
        className="flex items-center justify-center size-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-ink-600 transition-colors shrink-0"
      >
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
              💡 Alterações de descrição, categoria e valor serão aplicadas a todas as {groupSize} parcelas.
            </p>
          )}

          <FormField label="Descrição" htmlFor="description" required>
            <Input id="description" name="description" defaultValue={baseDesc} required />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={isGroup ? 'Valor por parcela (R$)' : 'Valor (R$)'} htmlFor="amount" required>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01"
                defaultValue={Number(entry.amount).toFixed(2)} required />
            </FormField>
            {!isGroup && (
              <FormField label="Data" htmlFor="date" required>
                <Input id="date" name="date" type="date" defaultValue={dateStr} required />
              </FormField>
            )}
          </div>

          <FormField label="Categoria" htmlFor="categoryId">
            <Select value={categoryId} onValueChange={setCatId}>
              <SelectTrigger><SelectValue placeholder="Sem categoria" /></SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {!isGroup && (
            <FormField label="Observações" htmlFor="notes">
              <Textarea id="notes" name="notes" defaultValue={entry.notes ?? ''} className="min-h-[56px]" />
            </FormField>
          )}

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending}>Salvar</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
