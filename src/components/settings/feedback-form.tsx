'use client'

import { useState, useActionState, useRef } from 'react'
import { Bug, Lightbulb, Send, CheckCircle, ImagePlus, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { submitFeedback } from '@/app/actions/feedback'

type FeedbackType = 'bug' | 'suggestion'

const MAX_MB     = 2
const MAX_BYTES  = MAX_MB * 1024 * 1024

export function FeedbackForm() {
  const [type,      setType]      = useState<FeedbackType>('bug')
  const [imageData, setImageData] = useState<string>('')
  const [imgError,  setImgError]  = useState('')
  const [imgName,   setImgName]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [state, action, pending] = useActionState(submitFeedback, undefined)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setImgError('')
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImgError('Só imagens são aceitas (PNG, JPG, GIF, WebP).')
      e.target.value = ''
      return
    }
    if (file.size > MAX_BYTES) {
      setImgError(`Arquivo muito grande. Máximo ${MAX_MB} MB.`)
      e.target.value = ''
      return
    }

    setImgName(file.name)
    const reader = new FileReader()
    reader.onload = () => setImageData(reader.result as string)
    reader.readAsDataURL(file)
  }

  function removeImage() {
    setImageData('')
    setImgName('')
    setImgError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  function handleTypeChange(next: FeedbackType) {
    setType(next)
    if (next !== 'bug') removeImage()
  }

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle className="size-10 text-success" />
        <p className="text-sm font-medium text-slate-200">Obrigado pelo feedback!</p>
        <p className="text-xs text-slate-500">Nossa equipe vai analisar em breve.</p>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="type"      value={type} />
      <input type="hidden" name="imageData" value={imageData} />

      {/* Type selector */}
      <div className="flex gap-2">
        {([
          { key: 'bug',        label: 'Bug',      icon: Bug,       desc: 'Algo não funciona' },
          { key: 'suggestion', label: 'Sugestão', icon: Lightbulb, desc: 'Ideia de melhoria' },
        ] as { key: FeedbackType; label: string; icon: React.ElementType; desc: string }[]).map(({ key, label, icon: Icon, desc }) => (
          <button key={key} type="button" onClick={() => handleTypeChange(key)}
            className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-3 rounded-xl border text-sm font-medium transition-all ${
              type === key
                ? key === 'bug'
                  ? 'bg-danger/10 border-danger/40 text-danger'
                  : 'bg-brand-800/60 border-brand-600/50 text-brand-300'
                : 'bg-ink-800 border-ink-600 text-slate-500 hover:border-ink-500'
            }`}>
            <Icon className="size-4" />
            <span>{label}</span>
            <span className="text-[10px] font-normal opacity-70">{desc}</span>
          </button>
        ))}
      </div>

      {state?.error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{state.error}</p>
      )}

      <FormField label="Título" htmlFor="fb-title" required>
        <Input id="fb-title" name="title"
          placeholder={type === 'bug' ? 'Ex: Botão de salvar não funciona' : 'Ex: Adicionar filtro por categoria'}
          required maxLength={120} />
      </FormField>

      <FormField label="Descrição" htmlFor="fb-body" required>
        <Textarea id="fb-body" name="body"
          placeholder={type === 'bug' ? 'Descreva o que aconteceu e como reproduzir...' : 'Descreva a ideia com mais detalhes...'}
          required className="min-h-[100px]" maxLength={2000} />
      </FormField>

      {/* Image upload — bugs only */}
      {type === 'bug' && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-300">
            Screenshot <span className="text-slate-600 font-normal">(opcional)</span>
          </p>

          {imageData ? (
            <div className="relative group rounded-xl overflow-hidden border border-white/8 bg-ink-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageData} alt="Preview" className="w-full max-h-48 object-contain" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 size-7 rounded-lg bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
                title="Remover imagem"
              >
                <X className="size-4" />
              </button>
              <div className="px-3 py-2 border-t border-white/6 flex items-center justify-between">
                <span className="text-xs text-slate-500 truncate max-w-[200px]">{imgName}</span>
                <span className="text-[10px] text-slate-600 shrink-0">
                  {(imageData.length * 0.75 / 1024).toFixed(0)} KB
                </span>
              </div>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 py-5 px-4 rounded-xl border border-dashed border-ink-500 hover:border-ink-400 bg-ink-800/40 cursor-pointer transition-colors group">
              <ImagePlus className="size-6 text-slate-600 group-hover:text-slate-400 transition-colors" />
              <span className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors text-center">
                Clique para anexar uma imagem<br />
                <span className="text-slate-600">PNG, JPG, WebP · máx {MAX_MB} MB</span>
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="sr-only"
              />
            </label>
          )}

          {imgError && (
            <div className="flex items-center gap-2 text-xs text-danger">
              <AlertCircle className="size-3.5 shrink-0" />
              {imgError}
            </div>
          )}
        </div>
      )}

      <Button type="submit" disabled={pending} className="self-end gap-2">
        <Send className="size-4" />
        {pending ? 'Enviando...' : 'Enviar'}
      </Button>
    </form>
  )
}
