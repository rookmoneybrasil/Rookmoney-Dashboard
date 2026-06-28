'use client'

import { useState } from 'react'
import { MessageCircle, Smartphone, CheckCircle2, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface Props { currentPhone: string | null; plan?: string }

const ROOKINHO_NUMBER = '5513991117381'

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11) return `+55${digits}`
  if (digits.length === 12 || digits.length === 13) return `+${digits}`
  return null
}

export function WhatsAppForm({ currentPhone, plan }: Props) {
  const [phone] = useState(currentPhone)

  const { mutate: save, pending: saving, error } = useMutation(
    (p: string) => {
      if (!p) return clientApi.updateProfile({ whatsappPhone: '' })
      const normalized = normalizePhone(p)
      if (!normalized) throw new Error('Número inválido. Use o formato: (11) 99999-9999')
      return clientApi.updateProfile({ whatsappPhone: normalized })
    },
    { onSuccess: () => window.location.reload() },
  )

  const isProPlus = plan === 'PRO_PLUS'

  const displayPhone = phone
    ? phone.replace(/^\+55/, '').replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    : null

  if (!isProPlus) {
    return (
      <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4 text-sm text-slate-400">
        <p className="font-medium text-amber-400 mb-1">Exclusivo do plano PRO+</p>
        <p>Faça upgrade para o PRO+ e converse com o Rookinho direto no WhatsApp.</p>
      </div>
    )
  }

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

        <a
          href={`https://wa.me/${ROOKINHO_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20BD5A] text-white transition-colors"
        >
          <MessageCircle className="size-4" />
          Falar com Rookinho no WhatsApp
          <ExternalLink className="size-3.5" />
        </a>

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
          <li>Clique no botão para abrir o WhatsApp</li>
          <li>Converse com o Rookinho — contas, gastos, fotos de boleto</li>
          <li>Tudo é registrado automaticamente na sua conta</li>
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
