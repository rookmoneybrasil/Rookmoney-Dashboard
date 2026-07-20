'use client'

import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { DateInput } from '@/components/ui/date-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { CategorySelect } from '@/components/ui/category-select'
import { AccountPicker } from '@/components/ui/account-picker'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import { triggerMascot } from '@/lib/mascot'

const TYPES = [
  { val: 'EMPLOYMENT', label: 'CLT / PJ',  icon: '💼' },
  { val: 'FREELANCE',  label: 'Freelance',  icon: '🧑‍💻' },
  { val: 'RENTAL',     label: 'Aluguel',    icon: '🏠' },
  { val: 'OTHER',      label: 'Outro',      icon: '💡' },
]

interface Category { id: string; name: string; icon: string; color: string }
interface Source {
  id: string; name: string; type: string; amount: number
  isRecurring: boolean; dayOfMonth: number | null; startDate?: string | null
  categoryId: string | null; notes: string | null; accountId?: string | null
}
interface Props { source?: Source; categories?: Category[]; className?: string; title?: string; disabled?: boolean }

export function IncomeSourceModal({ source, categories = [], className, title, disabled }: Props) {
  const isEdit      = !!source
  const [open,        setOpen]    = useState(false)
  const [type,        setType]    = useState(source?.type ?? 'EMPLOYMENT')
  const [isRecurring, setRec]     = useState(source?.isRecurring ?? true)
  const [categoryId,  setCatId]   = useState(source?.categoryId ?? '')
  const [accountId,   setAccId]   = useState(source?.accountId ?? '')

  const { mutate, pending, error } = useMutation(
    (data: Parameters<typeof clientApi.createIncomeSource>[0]) =>
      isEdit ? clientApi.updateIncomeSource(source.id, data) : clientApi.createIncomeSource(data),
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
        <button onClick={() => !disabled && setOpen(true)}
          className={className ?? "size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-brand-400 hover:bg-brand-400/10 transition-colors"}
          title={title ?? "Editar"} style={disabled ? { cursor: 'not-allowed' } : undefined}>
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
            const dayRaw       = fd.get('dayOfMonth') as string
            const startDateRaw = fd.get('startDate')  as string
            mutate({
              name:        fd.get('name') as string,
              type,
              amount:      parseFloat(fd.get('amount') as string),
              isRecurring,
              dayOfMonth:  dayRaw       ? parseInt(dayRaw, 10) : null,
              startDate:   startDateRaw || null,
              notes:       (fd.get('notes') as string) || null,
              categoryId:  categoryId || null,
              accountId:   accountId || null,
            })
          }}
          className="flex flex-col gap-4"
        >
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Tipo: Avulso vs Recorrente */}
          <div className="flex gap-2">
            {([
              { val: true,  label: 'Recorrente', icon: '🔁', desc: 'Entra todo mês' },
              { val: false, label: 'Eventual',   icon: '💡', desc: 'Renda pontual' },
            ]).map(({ val, label, icon, desc }) => (
              <button key={label} type="button" onClick={() => setRec(val)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isRecurring === val
                    ? 'bg-brand-800/60 border-brand-600/50 text-brand-300'
                    : 'bg-ink-800 border-ink-600 text-slate-500 hover:border-ink-500'
                }`}>
                <span className="text-base">{icon}</span>
                <span>{label}</span>
                <span className="text-[10px] text-slate-600">{desc}</span>
              </button>
            ))}
          </div>

          <FormField label="Nome" htmlFor="name" required>
            <Input id="name" name="name" placeholder="Ex.: Empresa X, Cliente Y"
              defaultValue={source?.name} required />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tipo" htmlFor="type">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map(({ val, label, icon }) => (
                    <SelectItem key={val} value={val}>{icon} {label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Valor (R$)" htmlFor="amount" required>
              <CurrencyInput id="amount" name="amount" defaultValue={source?.amount} required />
            </FormField>
          </div>

          {isRecurring && (
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Dia do recebimento" htmlFor="dayOfMonth">
                <Input id="dayOfMonth" name="dayOfMonth" type="number" min={1} max={31}
                  placeholder="Ex.: 5"
                  defaultValue={source?.dayOfMonth ?? undefined} />
              </FormField>
              <FormField
                label="Primeiro pagamento"
                htmlFor="startDate"
                hint="Deixe vazio para começar este mês"
              >
                <DateInput
                  id="startDate"
                  name="startDate"
                  defaultValue={source?.startDate
                    ? new Date(source.startDate).toISOString().slice(0, 10)
                    : undefined}
                />
              </FormField>
            </div>
          )}

          <FormField label="Categoria" htmlFor="categoryId">
            <CategorySelect categories={categories} value={categoryId} onChange={setCatId}
              placeholder="Selecionar" />
            {isRecurring && (
              <p className="text-[11px] text-slate-600 mt-1">Necessária para registro automático mensal.</p>
            )}
          </FormField>

          <AccountPicker value={accountId} onChange={setAccId} />

          <FormField label="Observações" htmlFor="notes">
            <Textarea id="notes" name="notes" placeholder="Opcional" className="min-h-[56px]"
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
