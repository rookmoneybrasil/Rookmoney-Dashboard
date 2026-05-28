'use client'

import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

const COLOR_PRESETS = [
  '#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981',
  '#EF4444','#F97316','#06B6D4','#84CC16','#6366F1',
]

interface Category { id: string; name: string; icon: string; color: string }
interface Props { category?: Category }

export function CategoryModal({ category }: Props) {
  const isEdit = !!category
  const [open, setOpen]   = useState(false)
  const [color, setColor] = useState(category?.color ?? '#3B82F6')

  const { mutate, pending, error } = useMutation(
    (data: { name: string; icon: string; color: string }) =>
      isEdit
        ? clientApi.updateCategory(category!.id, { name: data.name, icon: data.icon, color: data.color })
        : clientApi.createCategory({ name: data.name, icon: data.icon, color: data.color }),
    {
      onSuccess: () => {
        setOpen(false)
        if (!isEdit) setColor('#3B82F6')
      },
    },
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    mutate({
      name: fd.get('name') as string,
      icon: fd.get('icon') as string,
      color,
    })
  }

  return (
    <Modal open={open} onOpenChange={setOpen}>
      {isEdit ? (
        <button onClick={() => setOpen(true)}
          className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-brand-400 hover:bg-brand-400/10"
          title="Editar categoria">
          <Pencil className="size-3.5" />
        </button>
      ) : (
        <button onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors shrink-0">
          <Plus className="size-3.5" />
          Nova categoria
        </button>
      )}

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{isEdit ? 'Editar categoria' : 'Nova categoria'}</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="grid grid-cols-[1fr_72px] gap-3">
            <FormField label="Nome" htmlFor="name" required>
              <Input id="name" name="name" type="text" placeholder="Ex.: Streaming" defaultValue={category?.name} required />
            </FormField>
            <FormField label="Ícone" htmlFor="icon" required>
              <Input id="icon" name="icon" type="text" placeholder="🎬" defaultValue={category?.icon}
                className="text-center text-xl" required />
            </FormField>
          </div>

          <FormField label="Cor">
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_PRESETS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`size-7 rounded-lg transition-all ${color === c ? 'scale-110 ring-2 ring-offset-1 ring-offset-ink-800 ring-white/40' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </FormField>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-ink-800/60">
            <div className="size-9 rounded-xl flex items-center justify-center text-lg"
              style={{ backgroundColor: color + '22', color }}>
              <span id="icon-preview">?</span>
            </div>
            <span className="text-sm text-slate-400">Pré-visualização</span>
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending}>{isEdit ? 'Salvar' : 'Criar'}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
