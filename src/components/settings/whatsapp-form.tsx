'use client'

import { useState } from 'react'
import { MessageCircle, Smartphone, CheckCircle2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface Props { currentPhone: string | null }

const SANDBOX_NUMBER = process.env.NEXT_PUBLIC_TWILIO_SANDBOX_NUMBER ?? '+1 415 523 8886'

export function WhatsAppForm({ currentPhone }: Props) {
  const [phone] = useState(currentPhone)

  const { mutate: save, pending: saving, error } = useMutation(
    (p: string) => clientApi.updateProfile({ whatsappPhone: p || '' }),
    { onSuccess: () => window.location.reload() },
  )

  const displayPhone = phone
    ? phone.replace(/^\+55/, '').replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    : null

  if (phone) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl bg-success/10 border border-success/20 px-4 py-3">
          <CheckCircle2 className="size-4 text-success shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-200">WhatsApp vinculado</p>
            <p className="text-xs text-slate-500 mt-0.5">{displayPhone}</p>
          </div>
        </div>
        <div className="rounded-xl bg-ink-700/50 border border-white/6 p-4 text-sm text-slate-400 leading-relaxed">
          <p className="font-medium text-slate-300 mb-2">Como usar:</p>
          <ol className="flex flex-col gap-1.5 list-decimal list-inside">
            <li>Abra o WhatsApp e fale com <span className="text-brand-400 font-medium">{SANDBOX_NUMBER}</span></li>
            <li>Tire uma foto do comprovante e envie</li>
            <li>O Rook lê e salva automaticamente ✅</li>
          </ol>
        </div>
        <button
          onClick={() => save('')}
          disabled={saving}
          className="flex items-center gap-1.5 text-xs text-danger/70 hover:text-danger transition-colors disabled:opacity-50"
        >
          <Trash2 className="size-3.5" />
          {saving ? 'Removendo...' : 'Desvincular número'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-brand-900/20 border border-brand-500/20 p-4">
        <p className="text-xs font-semibold text-brand-400 uppercase tracking-wide mb-2">Como funciona</p>
        <ol className="flex flex-col gap-1.5 text-sm text-slate-400 list-decimal list-inside">
          <li>Vincule seu número abaixo</li>
          <li>Salve o número do Rook no WhatsApp</li>
          <li>Mande foto de qualquer comprovante</li>
          <li>O Rook lê e registra automaticamente 🪄</li>
        </ol>
      </div>
      <form
        onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); save(fd.get('phone') as string) }}
        className="flex flex-col gap-3"
      >
        {error && <p className="text-sm text-danger">{error}</p>}
        <FormField label="Seu número de WhatsApp" htmlFor="phone">
          <Input id="phone" name="phone" type="tel" placeholder="(11) 99999-9999" autoComplete="tel" leftIcon={<Smartphone className="size-4" />} />
        </FormField>
        <Button type="submit" loading={saving} className="w-full">
          <MessageCircle className="size-4 mr-1.5" />
          Vincular WhatsApp
        </Button>
      </form>
    </div>
  )
}
