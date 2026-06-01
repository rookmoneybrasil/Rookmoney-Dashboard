'use client'

import { useState, useActionState } from 'react'
import { Bug, Lightbulb, Send, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { submitFeedback } from '@/app/actions/feedback'

type FeedbackType = 'bug' | 'suggestion'

export function FeedbackForm() {
  const [type, setType] = useState<FeedbackType>('bug')
  const [state, action, pending] = useActionState(submitFeedback, undefined)

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
      <input type="hidden" name="type" value={type} />

      {/* Type selector */}
      <div className="flex gap-2">
        {([
          { key: 'bug',        label: 'Bug',       icon: Bug,        desc: 'Algo não funciona' },
          { key: 'suggestion', label: 'Sugestão',  icon: Lightbulb,  desc: 'Ideia de melhoria' },
        ] as { key: FeedbackType; label: string; icon: React.ElementType; desc: string }[]).map(({ key, label, icon: Icon, desc }) => (
          <button key={key} type="button" onClick={() => setType(key)}
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
        <Input id="fb-title" name="title" placeholder={type === 'bug' ? 'Ex: Botão de salvar não funciona' : 'Ex: Adicionar filtro por categoria'} required maxLength={120} />
      </FormField>

      <FormField label="Descrição" htmlFor="fb-body" required>
        <Textarea id="fb-body" name="body"
          placeholder={type === 'bug' ? 'Descreva o que aconteceu e como reproduzir...' : 'Descreva a ideia com mais detalhes...'}
          required className="min-h-[100px]" maxLength={2000} />
      </FormField>

      <Button type="submit" disabled={pending} className="self-end gap-2">
        <Send className="size-4" />
        {pending ? 'Enviando...' : 'Enviar'}
      </Button>
    </form>
  )
}
