'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

const COLOR_PRESETS = [
  '#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981',
  '#EF4444','#F97316','#06B6D4','#84CC16','#6366F1',
]

const EMOJI_GROUPS = [
  { label: 'Finanças',     emojis: ['💰','💵','💳','🏦','💸','🪙','💎','📈','📉','🧾','💹','🏧'] },
  { label: 'Casa',         emojis: ['🏠','🏡','🛋️','🔑','💡','🚿','🧹','🛁','🪟','🪴','🔧','🧰'] },
  { label: 'Alimentação',  emojis: ['🍔','🍕','☕','🛒','🍽️','🥗','🍱','🧃','🥩','🍳','🥐','🧁'] },
  { label: 'Transporte',   emojis: ['🚗','⛽','🚌','✈️','🚲','🛵','🚕','🚂','⚓','🛻','🏎️','🚘'] },
  { label: 'Saúde',        emojis: ['💊','🏥','🩺','🧬','🦷','👓','🏃','🧘','💪','🩹','🩻','🫀'] },
  { label: 'Educação',     emojis: ['📚','🎓','✏️','🖥️','🎒','📝','🔬','🧪','📐','📏','🗂️','📖'] },
  { label: 'Lazer',        emojis: ['🎮','🎬','🎵','🏖️','🎯','🎲','🎭','📷','🏋️','⚽','🎸','🎨'] },
  { label: 'Compras',      emojis: ['🛍️','👗','👟','💄','⌚','📱','💻','🖨️','📺','🎁','🧴','🪒'] },
  { label: 'Trabalho',     emojis: ['💼','🏢','📊','📋','🖊️','📌','📎','🗃️','📤','📥','🤝','👔'] },
  { label: 'Pets',         emojis: ['🐶','🐱','🐟','🐰','🐦','🐹','🐢','🦮','🐾','🦴','🐾','🏡'] },
]

interface Category { id: string; name: string; icon: string; color: string }
interface Props { category?: Category }

export function CategoryModal({ category }: Props) {
  const isEdit = !!category
  const [open, setOpen]         = useState(false)
  const [color, setColor]       = useState(category?.color ?? '#3B82F6')
  const [icon, setIcon]         = useState(category?.icon ?? '')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch]     = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [pickerOpen])

  const { mutate, pending, error } = useMutation(
    (data: { name: string }) =>
      isEdit
        ? clientApi.updateCategory(category!.id, { name: data.name, icon, color })
        : clientApi.createCategory({ name: data.name, icon, color }),
    {
      onSuccess: () => {
        setOpen(false)
        if (!isEdit) { setColor('#3B82F6'); setIcon('') }
      },
    },
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    mutate({ name: fd.get('name') as string })
  }

  const searchLower = search.toLowerCase()
  const filteredGroups = search
    ? [{ label: 'Resultados', emojis: EMOJI_GROUPS.flatMap((g) => g.emojis).filter((_, i, arr) => arr.indexOf(_) === i) }]
    : EMOJI_GROUPS

  return (
    <Modal open={open} onOpenChange={(v) => { setOpen(v); if (!v) setPickerOpen(false) }}>
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

          <div className="grid grid-cols-[1fr_80px] gap-3">
            <FormField label="Nome" htmlFor="name" required>
              <Input id="name" name="name" placeholder="Ex.: Streaming" defaultValue={category?.name} required />
            </FormField>

            <FormField label="Ícone" required>
              <div className="relative" ref={pickerRef}>
                <button
                  type="button"
                  onClick={() => setPickerOpen((v) => !v)}
                  className={`w-full h-10 rounded-lg border flex items-center justify-center text-2xl transition-colors ${
                    pickerOpen
                      ? 'border-brand-500 bg-ink-700'
                      : icon
                        ? 'border-ink-600 bg-ink-800 hover:border-ink-500'
                        : 'border-dashed border-ink-500 bg-ink-800/60 hover:border-ink-400'
                  }`}
                >
                  {icon || <span className="text-slate-600 text-sm">+</span>}
                </button>
                {!icon && <span className="absolute -bottom-4 left-0 right-0 text-center text-[10px] text-danger">Obrigatório</span>}

                {/* Emoji picker dropdown */}
                {pickerOpen && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-72 bg-ink-800 border border-ink-600 rounded-xl shadow-2xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-ink-700">
                      <input
                        type="text"
                        placeholder="Buscar emoji..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-ink-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder-slate-600 outline-none border border-ink-600 focus:border-brand-500"
                        autoFocus
                      />
                    </div>

                    {/* Groups */}
                    <div className="max-h-56 overflow-y-auto p-2 flex flex-col gap-3">
                      {filteredGroups.map((group) => {
                        const visible = search
                          ? group.emojis
                          : group.emojis
                        return (
                          <div key={group.label}>
                            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-1 px-1">{group.label}</p>
                            <div className="grid grid-cols-8 gap-0.5">
                              {visible.map((e) => (
                                <button
                                  key={e}
                                  type="button"
                                  onClick={() => { setIcon(e); setPickerOpen(false); setSearch('') }}
                                  className={`size-8 rounded-lg flex items-center justify-center text-lg hover:bg-ink-600 transition-colors ${icon === e ? 'bg-brand-800/60 ring-1 ring-brand-500' : ''}`}
                                >
                                  {e}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
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
              {icon || '?'}
            </div>
            <span className="text-sm text-slate-400">{icon ? 'Pré-visualização' : 'Selecione um ícone acima'}</span>
          </div>

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending} disabled={!icon}>{isEdit ? 'Salvar' : 'Criar'}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
