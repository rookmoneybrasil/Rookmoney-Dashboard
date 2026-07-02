'use client'

import { useState } from 'react'
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
import { CurrencyInput } from '@/components/ui/currency-input'
import { DateInput } from '@/components/ui/date-input'
import { triggerMascot } from '@/lib/mascot'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import { useTranslations } from 'next-intl'

const COLORS = [
  { value: '#3B82F6', label: 'Azul'    },
  { value: '#F59E0B', label: 'Dourado' },
  { value: '#22C55E', label: 'Verde'   },
  { value: '#8B5CF6', label: 'Roxo'    },
  { value: '#F43F5E', label: 'Vermelho'},
  { value: '#06B6D4', label: 'Ciano'   },
]

export function GoalModal() {
  const t = useTranslations('goals')
  const c = useTranslations('common')
  const [open, setOpen]   = useState(false)
  const [color, setColor] = useState(COLORS[0].value)

  const { mutate, pending, error } = useMutation(
    (data: { name: string; targetAmount: string; currentAmount: string; icon: string; deadline: string; description: string; color: string }) =>
      clientApi.createGoal({
        name: data.name,
        targetAmount: parseFloat(data.targetAmount),
        currentAmount: data.currentAmount ? parseFloat(data.currentAmount) : undefined,
        icon: data.icon || undefined,
        deadline: data.deadline || undefined,
        description: data.description || undefined,
        color: data.color,
      }),
    {
      onSuccess: () => {
        setOpen(false)
        setColor(COLORS[0].value)
        triggerMascot('euphoric', 'Nova meta criada! Vamos conquistar isso! 🎯')
      },
    },
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    mutate({
      name: fd.get('name') as string,
      targetAmount: fd.get('targetAmount') as string,
      currentAmount: fd.get('currentAmount') as string,
      icon: fd.get('icon') as string,
      deadline: fd.get('deadline') as string,
      description: fd.get('description') as string,
      color,
    })
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shrink-0"
      >
        <Plus className="size-3.5" />
        {t('new')}
      </button>

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{t('new')}</ModalTitle>
          <ModalDescription>{t('description')}</ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <FormField label={t('goalName')} htmlFor="name" required>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Ex.: Reserva de emergência"
              required
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('targetAmount')} htmlFor="targetAmount" required>
              <CurrencyInput id="targetAmount" name="targetAmount" required />
            </FormField>

            <FormField label={t('currentAmount')} htmlFor="currentAmount">
              <CurrencyInput id="currentAmount" name="currentAmount" />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ícone (emoji)" htmlFor="icon">
              <Input
                id="icon"
                name="icon"
                type="text"
                placeholder="🎯"
                maxLength={2}
              />
            </FormField>

            <FormField label={t('deadline')} htmlFor="deadline">
              <DateInput
                id="deadline"
                name="deadline"
              />
            </FormField>
          </div>

          <FormField label={t('color')}>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setColor(col.value)}
                  className="size-7 rounded-full transition-all focus:outline-none"
                  style={{ backgroundColor: col.value, outline: color === col.value ? `2px solid ${col.value}` : undefined, outlineOffset: '2px' }}
                  title={col.label}
                />
              ))}
            </div>
          </FormField>

          <FormField label={c('description')} htmlFor="description">
            <Input
              id="description"
              name="description"
              type="text"
              placeholder={c('optional')}
            />
          </FormField>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              {c('cancel')}
            </Button>
            <Button type="submit" loading={pending}>
              {t('create')}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
