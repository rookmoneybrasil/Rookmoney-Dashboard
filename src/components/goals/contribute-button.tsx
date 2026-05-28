'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { Plus } from 'lucide-react'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { addContribution } from '@/app/actions/goals'
import { triggerMascot } from '@/lib/mascot'

interface Props {
  goalId: string
  goalName: string
  remaining: number
}

export function ContributeButton({ goalId, goalName, remaining }: Props) {
  const [open, setOpen] = useState(false)
  const boundAction = addContribution.bind(null, goalId)
  const [state, formAction, pending] = useActionState(boundAction, undefined)

  useEffect(() => {
    if (state && !state.error) {
      setOpen(false)
      triggerMascot('celebrating', `Aporte adicionado em "${goalName}"! Continue assim! 💰`)
    }
  }, [state, goalName])

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center size-7 rounded-lg bg-ink-600 hover:bg-ink-500 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
        title="Adicionar contribuição"
      >
        <Plus className="size-3.5" />
      </button>

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>Contribuir para meta</ModalTitle>
          <ModalDescription>
            {goalName} · faltam {fmt(remaining)}
          </ModalDescription>
        </ModalHeader>

        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}

          <FormField label="Valor a adicionar (R$)" htmlFor="amount" required>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              autoFocus
              required
            />
          </FormField>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              Adicionar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
