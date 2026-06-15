'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { FormField } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { triggerMascot } from '@/lib/mascot'
import { playGoalComplete } from '@/lib/sounds'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface Category { id: string; name: string; icon: string; color: string }

interface Props {
  goalId:    string
  goalName:  string
  remaining: number
  current:   number
  categories: Category[]
}

export function ContributeButton({ goalId, goalName, remaining, current, categories }: Props) {
  const [open, setOpen]           = useState(false)
  const [mode, setMode]           = useState<'contribute' | 'withdraw'>('contribute')
  const [categoryId, setCatId]    = useState('')

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const { mutate: contribute, pending: pendingC, error: errC } = useMutation(
    (data: { amount: string }) =>
      clientApi.contributeToGoal(goalId, parseFloat(data.amount), categoryId || undefined),
    {
      onSuccess: () => {
        setOpen(false)
        playGoalComplete()
        triggerMascot('celebrating', `Aporte adicionado em "${goalName}"! Continue assim! 💰`)
      },
    },
  )

  const { mutate: withdraw, pending: pendingW, error: errW } = useMutation(
    (data: { amount: string }) =>
      clientApi.withdrawFromGoal(goalId, parseFloat(data.amount), categoryId || undefined),
    {
      onSuccess: () => {
        setOpen(false)
        triggerMascot('sad', `Retirada de "${goalName}" registrada.`)
      },
    },
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (mode === 'contribute') contribute({ amount: fd.get('amount') as string })
    else                       withdraw({ amount: fd.get('amount') as string })
  }

  const pending = pendingC || pendingW
  const error   = errC || errW

  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center size-7 rounded-lg bg-ink-600 hover:bg-ink-500 text-slate-400 hover:text-slate-200 transition-colors shrink-0"
        title="Adicionar ou retirar"
      >
        <Plus className="size-3.5" />
      </button>

      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{mode === 'contribute' ? 'Contribuir para meta' : 'Retirar da meta'}</ModalTitle>
          <ModalDescription>
            {goalName} · {mode === 'contribute' ? `faltam ${fmt(remaining)}` : `disponível ${fmt(current)}`}
          </ModalDescription>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Mode toggle */}
          <div className="flex gap-2 p-1 bg-ink-700 rounded-xl">
            <button type="button" onClick={() => setMode('contribute')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'contribute' ? 'bg-success/20 text-success' : 'text-slate-500 hover:text-slate-300'
              }`}>
              <Plus className="size-3.5" /> Aportar
            </button>
            <button type="button" onClick={() => setMode('withdraw')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'withdraw' ? 'bg-danger/20 text-danger' : 'text-slate-500 hover:text-slate-300'
              }`}>
              <Minus className="size-3.5" /> Retirar
            </button>
          </div>

          {error && <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>}

          <FormField label="Valor (R$)" htmlFor="amount" required>
            <CurrencyInput id="amount" name="amount" required />
          </FormField>

          <FormField label="Categoria" htmlFor="categoryId">
            <Select value={categoryId} onValueChange={setCatId}>
              <SelectTrigger><SelectValue placeholder="Metas / Poupança" /></SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {mode === 'withdraw' && (
            <p className="text-xs text-slate-500 bg-ink-700/60 border border-white/6 rounded-lg px-3 py-2">
              💡 A retirada cria uma receita revertendo a despesa do aporte original.
            </p>
          )}

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending} variant={mode === 'withdraw' ? 'danger' as never : undefined}>
              {mode === 'contribute' ? 'Adicionar aporte' : 'Confirmar retirada'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
