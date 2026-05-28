'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { Pencil } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { updateGoal } from '@/app/actions/goals'

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

  const boundAction = updateGoal.bind(null, goal.id)
  const [state, formAction, pending] = useActionState(boundAction, undefined)

  const deadlineStr = goal.deadline
    ? (typeof goal.deadline === 'string' ? goal.deadline : new Date(goal.deadline).toISOString()).slice(0, 10)
    : ''

  useEffect(() => {
    if (state && !state.error) setOpen(false)
  }, [state])

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button onClick={() => setOpen(true)}
        className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity size-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-brand-400 hover:bg-brand-400/10"
        title="Editar meta">
        <Pencil className="size-3.5" />
      </button>

      <ModalContent size="sm">
        <ModalHeader><ModalTitle>Editar meta</ModalTitle></ModalHeader>

        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{state.error}</p>
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
            <input type="hidden" name="color" value={color} />
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
