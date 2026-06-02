'use client'

import { useState, useActionState, useRef } from 'react'
import { Bug, Lightbulb, Ticket, Send, CheckCircle, ImagePlus, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { submitFeedback } from '@/app/actions/feedback'

type SupportType = 'ticket' | 'bug' | 'suggestion'

const MAX_MB    = 2
const MAX_BYTES = MAX_MB * 1024 * 1024

const OPTIONS: { key: SupportType; icon: React.ElementType; label: string; desc: string; color: string }[] = [
  {
    key:   'ticket',
    icon:  Ticket,
    label: 'Abrir ticket',
    desc:  'Precisa de ajuda ou tem uma dúvida?',
    color: 'bg-brand-800/60 border-brand-600/50 text-brand-300',
  },
  {
    key:   'bug',
    icon:  Bug,
    label: 'Relatar bug',
    desc:  'Encontrou algo que não funciona?',
    color: 'bg-danger/10 border-danger/40 text-danger',
  },
  {
    key:   'suggestion',
    icon:  Lightbulb,
    label: 'Sugestão',
    desc:  'Tem uma ideia de melhoria?',
    color: 'bg-amber-900/40 border-amber-700/40 text-amber-400',
  },
]

const PLACEHOLDER: Record<SupportType, { title: string; body: string }> = {
  ticket:     { title: 'Ex: Não consigo importar meu extrato', body: 'Descreva o problema ou dúvida em detalhes...' },
  bug:        { title: 'Ex: Botão de salvar não funciona',     body: 'Descreva o que aconteceu e como reproduzir o erro...' },
  suggestion: { title: 'Ex: Adicionar filtro por período',     body: 'Descreva a melhoria ou funcionalidade que gostaria de ver...' },
}

export default function SupportPage() {
  const [selected, setSelected] = useState<SupportType | null>(null)
  const [imageData, setImageData] = useState('')
  const [imgError,  setImgError]  = useState('')
  const [imgName,   setImgName]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [state, action, pending] = useActionState(submitFeedback, undefined)

  function selectType(t: SupportType) {
    setSelected(t)
    if (t !== 'bug') { setImageData(''); setImgName(''); setImgError('') }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setImgError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setImgError('Só imagens são aceitas.')
      e.target.value = ''
      return
    }
    if (file.size > MAX_BYTES) {
      setImgError(`Máximo ${MAX_MB} MB.`)
      e.target.value = ''
      return
    }
    setImgName(file.name)
    const reader = new FileReader()
    reader.onload = () => setImageData(reader.result as string)
    reader.readAsDataURL(file)
  }

  function removeImage() {
    setImageData(''); setImgName(''); setImgError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center max-w-sm mx-auto">
        <div className="size-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center">
          <CheckCircle className="size-8 text-success" />
        </div>
        <h2 className="text-lg font-semibold text-slate-100">Recebido!</h2>
        <p className="text-sm text-slate-500">Nossa equipe vai analisar em breve.</p>
        <Button variant="secondary" onClick={() => { setSelected(null) }} className="mt-2">
          Enviar outro
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-slate-100">Suporte</h1>
        <p className="text-sm text-slate-500 mt-0.5">Como podemos te ajudar?</p>
      </div>

      {/* Type selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {OPTIONS.map(({ key, icon: Icon, label, desc, color }) => (
          <button
            key={key}
            type="button"
            onClick={() => selectType(key)}
            className={`flex flex-col items-center gap-3 py-6 px-4 rounded-2xl border text-center transition-all ${
              selected === key
                ? color
                : 'bg-ink-800 border-white/6 text-slate-500 hover:border-white/12 hover:text-slate-400'
            }`}
          >
            <Icon className="size-6" />
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs opacity-70 mt-0.5 leading-snug">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Form — shown when a type is selected */}
      {selected && (
        <div className="bg-ink-800 border border-white/8 rounded-2xl p-6">
          <form action={action} className="flex flex-col gap-4">
            <input type="hidden" name="type"      value={selected} />
            <input type="hidden" name="imageData" value={imageData} />

            {state?.error && (
              <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">
                {state.error}
              </p>
            )}

            <FormField label="Título" htmlFor="sup-title" required>
              <Input
                id="sup-title"
                name="title"
                placeholder={PLACEHOLDER[selected].title}
                required
                maxLength={120}
                autoFocus
              />
            </FormField>

            <FormField label="Descrição" htmlFor="sup-body" required>
              <Textarea
                id="sup-body"
                name="body"
                placeholder={PLACEHOLDER[selected].body}
                required
                className="min-h-[120px]"
                maxLength={2000}
              />
            </FormField>

            {/* Screenshot — bugs only */}
            {selected === 'bug' && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-slate-300">
                  Screenshot <span className="text-slate-600 font-normal">(opcional)</span>
                </p>
                {imageData ? (
                  <div className="relative rounded-xl overflow-hidden border border-white/8 bg-ink-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageData} alt="Preview" className="w-full max-h-48 object-contain" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 size-7 rounded-lg bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                    >
                      <X className="size-4" />
                    </button>
                    <div className="px-3 py-2 border-t border-white/6 flex items-center justify-between">
                      <span className="text-xs text-slate-500 truncate max-w-[200px]">{imgName}</span>
                      <span className="text-[10px] text-slate-600">
                        {(imageData.length * 0.75 / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center gap-2 py-5 px-4 rounded-xl border border-dashed border-ink-500 hover:border-ink-400 bg-ink-800/40 cursor-pointer transition-colors group">
                    <ImagePlus className="size-6 text-slate-600 group-hover:text-slate-400 transition-colors" />
                    <span className="text-xs text-slate-500 text-center">
                      Clique para anexar uma imagem<br />
                      <span className="text-slate-600">PNG, JPG, WebP · máx {MAX_MB} MB</span>
                    </span>
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="sr-only" />
                  </label>
                )}
                {imgError && (
                  <div className="flex items-center gap-2 text-xs text-danger">
                    <AlertCircle className="size-3.5 shrink-0" /> {imgError}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-sm text-slate-600 hover:text-slate-400 transition-colors"
              >
                ← Voltar
              </button>
              <Button type="submit" disabled={pending} className="gap-2">
                <Send className="size-4" />
                {pending ? 'Enviando...' : 'Enviar'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
