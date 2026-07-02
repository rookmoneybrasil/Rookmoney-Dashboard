'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import {
  Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { FormField, Textarea } from '@/components/ui/input'
import { clientApi } from '@/lib/api-client'
import { isPro } from '@/lib/plans'

interface Props {
  plan?: string | null
  subscriptionSource?: string | null
}

const REASONS = [
  'Não uso mais / não preciso',
  'Está muito caro',
  'Faltam funcionalidades que preciso',
  'Encontrei um app melhor',
  'Tive problemas técnicos / bugs',
  'Prefiro não dizer',
  'Outro motivo',
]

// Account-cancellation form. The user must pick a reason and explicitly agree
// before we do anything. On submit the API cancels the paid plan FIRST (and
// aborts the whole deletion if that fails) and only then deletes the data —
// see DELETE /settings. IAP subscriptions (Google Play / App Store) can't be
// cancelled server-side, so we warn the user to cancel in the store too.
export function DeleteAccountButton({ plan, subscriptionSource }: Props) {
  const [open, setOpen]         = useState(false)
  const [reason, setReason]     = useState('')
  const [feedback, setFeedback] = useState('')
  const [agreed, setAgreed]     = useState(false)
  const [pending, setPending]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const paid    = isPro(plan)
  const isStore = subscriptionSource === 'google_play' || subscriptionSource === 'apple'
  const storeName = subscriptionSource === 'apple' ? 'App Store' : 'Google Play'
  const canSubmit = !!reason && agreed && !pending

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) return
    setPending(true)
    setError(null)
    try {
      await clientApi.deleteAccount({ reason, feedback: feedback.trim() || undefined })
      window.location.href = '/login'
    } catch (err) {
      // e.g. plan cancellation failed → account was NOT deleted, let them retry
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a conta. Tente novamente.')
      setPending(false)
    }
  }

  return (
    <Modal open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setError(null) } }}>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger font-medium px-4 py-2 rounded-xl text-sm transition-colors"
      >
        <Trash2 className="size-3.5" />
        Excluir minha conta
      </button>

      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="size-5" />
            Cancelar e excluir conta
          </ModalTitle>
          <ModalDescription>
            Esta ação é <strong className="text-slate-300">permanente e irreversível</strong>. Todos os seus dados serão
            apagados e não poderão ser recuperados.
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Plan cancellation notice */}
          {paid && !isStore && (
            <div className="flex gap-2.5 p-3 rounded-lg bg-brand-900/40 border border-brand-700/30 text-xs text-slate-400 leading-relaxed">
              <span>Sua assinatura <strong className="text-slate-300">{plan}</strong> será cancelada automaticamente antes da exclusão. Você não será cobrado novamente.</span>
            </div>
          )}
          {paid && isStore && (
            <div className="flex gap-2.5 p-3 rounded-lg bg-warning/10 border border-warning/25 text-xs text-slate-300 leading-relaxed">
              <AlertTriangle className="size-4 text-warning shrink-0 mt-0.5" />
              <span>Sua assinatura foi contratada pela <strong>{storeName}</strong>. Excluir a conta aqui <strong>não cancela</strong> a cobrança da loja — cancele também a assinatura diretamente na {storeName}, senão você continuará sendo cobrado.</span>
            </div>
          )}

          {/* Reason */}
          <FormField label="Por que está saindo?" htmlFor="reason" required>
            <div className="flex flex-col gap-1.5">
              {REASONS.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                    reason === r
                      ? 'bg-brand-900/40 border-brand-600/50 text-slate-200'
                      : 'bg-ink-800 border-ink-600 text-slate-400 hover:border-ink-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="accent-brand-500"
                  />
                  {r}
                </label>
              ))}
            </div>
          </FormField>

          {/* Optional feedback */}
          <FormField label="Quer nos contar mais? (opcional)" htmlFor="feedback">
            <Textarea
              id="feedback"
              name="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              maxLength={1000}
              placeholder="Seu feedback nos ajuda a melhorar o Rook Money."
              className="min-h-[70px]"
            />
          </FormField>

          {/* Consent */}
          <label className="flex items-start gap-2.5 p-3 rounded-lg bg-danger/5 border border-danger/20 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 accent-danger size-4 shrink-0"
            />
            <span className="text-xs text-slate-400 leading-relaxed">
              Entendo que esta ação é permanente, que {paid && !isStore ? 'minha assinatura será cancelada e ' : ''}
              todos os meus dados serão excluídos e <strong className="text-slate-300">não poderão ser recuperados</strong>.
            </span>
          </label>

          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Manter minha conta</Button>
            <Button type="submit" variant="destructive" loading={pending} disabled={!canSubmit}>
              Cancelar e excluir
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
