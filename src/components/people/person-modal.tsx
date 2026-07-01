'use client'

import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import { useDashboardTheme } from '@/components/layout/dashboard-shell'

const AVATAR_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#6366f1', '#64748b',
]

interface Person {
  id:    string
  name:  string
  notes: string | null
  color: string | null
}

interface Props {
  person?: Person
  trigger?: React.ReactNode
}

export function PersonModal({ person, trigger }: Props) {
  const [open, setOpen]     = useState(false)
  const [color, setColor]   = useState(person?.color ?? AVATAR_COLORS[0])
  const { theme } = useDashboardTheme()

  const { mutate, pending, error } = useMutation(
    (data: { name: string; color: string; notes: string }) =>
      person
        ? clientApi.updatePerson(person.id, data)
        : clientApi.createPerson(data),
    { onSuccess: () => setOpen(false) },
  )

  return (
    <Modal open={open} onOpenChange={setOpen}>
      {trigger ? (
        <span onClick={() => { setColor(person?.color ?? AVATAR_COLORS[0]); setOpen(true) }}>{trigger}</span>
      ) : (
        <button
          onClick={() => { setColor(person?.color ?? AVATAR_COLORS[0]); setOpen(true) }}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shrink-0"
        >
          <Plus className="size-3.5" />
          Nova pessoa
        </button>
      )}

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{person ? 'Editar pessoa' : 'Nova pessoa'}</ModalTitle>
        </ModalHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            mutate({
              name:  fd.get('name') as string,
              color: fd.get('color') as string,
              notes: fd.get('notes') as string,
            })
          }}
          className="flex flex-col gap-4"
        >
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <FormField label="Nome" htmlFor="name" required>
            <Input
              id="name"
              name="name"
              placeholder="Ex: João Silva"
              defaultValue={person?.name}
              required
            />
          </FormField>

          <FormField label="Cor do avatar" htmlFor="color">
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="size-7 rounded-full border-2 transition-all focus:outline-none"
                  style={theme === 'light' ? {
                    backgroundColor: c,
                    outline: color === c ? `2px solid ${c}` : undefined,
                    outlineOffset: '2px',
                    borderColor: 'transparent',
                    transform: color === c ? 'scale(1.1)' : 'scale(1)',
                  } : {
                    backgroundColor: c,
                    borderColor: color === c ? 'white' : 'transparent',
                    transform: color === c ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
            <input type="hidden" name="color" value={color} />
          </FormField>

          <FormField label="Observações" htmlFor="notes">
            <Textarea
              id="notes"
              name="notes"
              placeholder="Opcional"
              className="min-h-[60px]"
              defaultValue={person?.notes ?? ''}
            />
          </FormField>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={pending}>
              {person ? 'Salvar' : 'Criar'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}

export function EditPersonButton({ person }: { person: Person }) {
  return (
    <PersonModal
      person={person}
      trigger={
        <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-ink-700 hover:bg-ink-600 text-slate-300 text-sm font-medium transition-colors border border-ink-600">
          <Pencil className="size-3.5" />
          Editar
        </button>
      }
    />
  )
}
