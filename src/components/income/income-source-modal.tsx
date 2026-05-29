'use client'

import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import { triggerMascot } from '@/lib/mascot'

const TYPE_LABELS = {
  EMPLOYMENT: '💼 CLT / PJ',
  FREELANCE:  '🧑‍💻 Freelance',
  RENTAL:     '🏠 Aluguel',
  OTHER:      '💡 Outro',
}

interface Category { id: string; name: string; icon: string; color: string }

interface Source {
  id: string; name: string; type: string; amount: number
  isRecurring: boolean; dayOfMonth: number | null; categoryId: string | null; notes: string | null
}

interface Props { source?: Source; categories?: Category[]; className?: string; title?: string; disabled?: boolean }

export function IncomeSourceModal({ source, categories = [], className, title, disabled }: Props) {
  const isEdit = !!source
  const [open, setOpen]           = useState(false)
  const [type, setType]           = useState(source?.type ?? 'EMPLOYMENT')
  const [isRecurring, setRec]     = useState(source?.isRecurring ?? true)
  const [categoryId, setCatId]    = useState(source?.categoryId ?? '')

  const { mutate, pending, error } = useMutation(
    (data: Parameters<typeof clientApi.createIncomeSource>[0]) =>
      isEdit
        ? clientApi.updateIncomeSource(source.id, data)
        : clientApi.createIncomeSource(data),
    {
      onSuccess: () => {
        setOpen(false)
        if (!isEdit) triggerMascot('happy', 'Nova fonte de renda cadastrada! 💰')
      },
    },
  )

  return (
    <Modal open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <button
          onClick={() => !disabled && setOpen(true)}
          className={className ?? "size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-brand-400 hover:bg-brand-400/10 transition-colors"}
          title={title ?? "Editar"}
          style={disabled ? { cursor: 'not-allowed' } : undefined}
        >
          <Pencil className="size-3.5" />
        </button>
      ) : (
        <button onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shrink-0">
          <Plus className="size-3.5" />
          Nova fonte
        </button>
      )}

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{isEdit ? 'Editar fonte de renda' : 'Nova fonte de renda'}</ModalTitle>
        </ModalHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const dayRaw = fd.get('dayOfMonth') as string
            mutate({
              name:        fd.get('name') as string,
              type:        fd.get('type') as string,
              amount:      parseFloat(fd.get('amount') as string),
              isRecurring: fd.get('isRecurring') === 'true',
              dayOfMonth:  dayRaw ? parseInt(dayRaw, 10) : null,
              notes:       (fd.get('notes') as string) || null,
              categoryId:  (fd.get('categoryId') as string) || null,
            })
          }}
          className="flex flex-col gap-4"
        >
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <FormField label="Nome" htmlFor="name" required>
            <Input id="name" name="name" placeholder="Ex.: Empresa X, Cliente Y" defaultValue={source?.name} required />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tipo" htmlFor="type" required>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="type" value={type} />
            </FormField>

            <FormField label="Valor esperado (R$)" htmlFor="amount" required>
              <Input id="amount" name="amount" type="number" step="0.01" min="0.01"
                placeholder="0,00" defaultValue={source?.amount} required />
            </FormField>
          </div>

          {/* Recorrente toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="hidden" name="isRecurring" value={isRecurring ? 'true' : 'false'} />
            <div onClick={() => setRec(!isRecurring)}
              className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${isRecurring ? 'bg-brand-600' : 'bg-ink-600'}`}>
              <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${isRecurring ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-slate-300">Recorrente (mensal)</span>
          </label>

          {isRecurring && (
            <FormField label="Dia do recebimento" htmlFor="dayOfMonth">
              <Input id="dayOfMonth" name="dayOfMonth" type="number" min={1} max={31}
                placeholder="Ex.: 5 (todo dia 5)" defaultValue={source?.dayOfMonth ?? undefined} />
            </FormField>
          )}

          <FormField label="Categoria padrão" htmlFor="categoryId">
            <Select value={categoryId} onValueChange={setCatId}>
              <SelectTrigger><SelectValue placeholder="Selecionar (para auto-registro)" /></SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" name="categoryId" value={categoryId} />
            {isRecurring && (
              <p className="text-xs text-slate-600 mt-1">Necessário para registro automático mensal.</p>
            )}
          </FormField>

          <FormField label="Observações" htmlFor="notes">
            <Textarea id="notes" name="notes" placeholder="Opcional" className="min-h-[60px]"
              defaultValue={source?.notes ?? ''} />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending}>{isEdit ? 'Salvar' : 'Adicionar'}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
