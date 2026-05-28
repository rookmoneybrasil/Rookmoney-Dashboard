'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

const COLOR_PRESETS = ['#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981','#EF4444']

interface Goal {
  id: string
  name: string
  targetAmount: string | number
  currentAmount: string | number
  deadline: Date | string | null
  description: string | null
  icon: string | null
  color: string | null
}

interface Props { goal: Goal }

export function EditGoalModal({ goal }: Props) {
  const [open, setOpen]   = useState(false)
  const [color, setColor] = useState(goal.color ?? '#3B82F6')

  const deadlineStr = goal.deadline
    ? (typeof goal.deadline === 'string' ? goal.deadline : new Date(goal.deadline).toISOString()).slice(0, 10)
    : ''

  const { mutate, pending, error } = useMutation(
    (data: { name: string; targetAmount: string; deadline: string; color: string; icon: string }) =>
      clientApi.updateGoal(goal.id, {
        name: data.name,
        targetAmount: parseFloat(data.targetAmount),
        deadline: data.deadline || undefined,
        color: data.color,
        icon: data.icon || undefined,
      }),
    { onSuccess: () => setOpen(false) },
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    mutate({
      name: fd.get('name') as string,
      targetAmount: fd.get('targetAmount') as string,
      deadline: fd.get('deadline') as string,
      color,
      icon: fd.get('icon') as string,
    })
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button onClick={() => setOpen(true)}
        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity size-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-brand-400 hover:bg-brand-400/10"
        title="Editar meta">
        <Pencil className="size-3.5" />
      </button>

      <ModalContent size="sm">
        <ModalHeader><ModalTitle>Editar meta</ModalTitle></ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="grid grid-cols-[1fr_80px] gap-3">
            <FormField label="Nome da meta" htmlFor="name" required>
              <Input id="name" name="name" type="text" defaultValue={goal.name} required />
            </FormField>
            <FormField label="Ícone" htmlFor="icon">
              <Input id="icon" name="icon" type="text" defaultValue={goal.icon ?? ''} placeholder="🎯" className="text-center text-lg" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Valor alvo (R$)" htmlFor="targetAmount" required>
              <Input id="targetAmount" name="targetAmount" type="number" step="0.01" min="0.01"
                defaultValue={Number(goal.targetAmount)} required />
            </FormField>
            <FormField label="Prazo" htmlFor="deadline">
              <Input id="deadline" name="deadline" type="date" defaultValue={deadlineStr} />
            </FormField>
          </div>

          <FormField label="Cor">
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`size-7 rounded-lg transition-transform ${color === c ? 'scale-110 ring-2 ring-white/30' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
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
