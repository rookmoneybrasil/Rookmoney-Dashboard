'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import Image from 'next/image'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { MASCOT_SRCS } from '@/lib/mascot'
import {
  createOnboardingIncome,
  createOnboardingGoal,
  markOnboarded,
} from '@/app/actions/onboarding'

const TOTAL_STEPS = 2

interface Props { firstName: string }

export function OnboardingWizard({ firstName }: Props) {
  const [step, setStep] = useState(0)

  const [incomeState, incomeAction, incomePending] = useActionState(createOnboardingIncome, undefined)
  const [goalState,   goalAction,   goalPending]   = useActionState(createOnboardingGoal,  undefined)

  useEffect(() => { if (incomeState && !incomeState.error) setStep(2) }, [incomeState])
  useEffect(() => { if (goalState   && !goalState.error)   setStep(3) }, [goalState])

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Progress bar */}
        {step > 0 && step < 3 && (
          <div className="flex gap-1.5 mb-8">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < step ? 'bg-brand-500' : 'bg-ink-600'
                }`}
              />
            ))}
          </div>
        )}

        {/* ── Step 0: Welcome ── */}
        {step === 0 && (
          <div className="flex flex-col items-center text-center gap-6">
            <div className="relative size-36 mascot-float">
              <Image src={MASCOT_SRCS.happy} alt="Rook" fill className="object-contain" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-slate-100">
                Olá, {firstName}! 👋
              </h1>
              <p className="text-slate-500 text-sm leading-relaxed">
                Vamos configurar seu Rook Money em 2 passos rápidos.
                Pode pular qualquer etapa — dá pra configurar depois.
              </p>
            </div>
            <Button onClick={() => setStep(1)} className="w-full gap-2">
              Vamos lá
              <ArrowRight className="size-4" />
            </Button>
            <button
              onClick={() => setStep(3)}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              Pular tudo e ir direto ao dashboard
            </button>
          </div>
        )}

        {/* ── Step 1: Income ── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
                Passo 1 de {TOTAL_STEPS}
              </p>
              <h2 className="text-xl font-bold text-slate-100">Qual é sua renda principal?</h2>
              <p className="text-slate-500 text-sm mt-1">
                Seu salário ou principal fonte de renda recorrente.
              </p>
            </div>

            {incomeState?.error && (
              <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">
                {incomeState.error}
              </p>
            )}

            <form action={incomeAction} className="flex flex-col gap-4">
              <FormField label="Nome (ex.: Empresa X, Freelas)" htmlFor="name" required>
                <Input id="name" name="name" placeholder="Empresa X" autoFocus required />
              </FormField>
              <FormField label="Valor mensal (R$)" htmlFor="amount" required>
                <Input
                  id="amount" name="amount"
                  type="number" step="0.01" min="1"
                  placeholder="3000,00" required
                />
              </FormField>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1">
                  Pular
                </Button>
                <Button type="submit" loading={incomePending} className="flex-1 gap-2">
                  Adicionar
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 2: Goal ── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
                Passo 2 de {TOTAL_STEPS}
              </p>
              <h2 className="text-xl font-bold text-slate-100">Tem alguma meta financeira?</h2>
              <p className="text-slate-500 text-sm mt-1">
                Reserva de emergência, viagem, compra planejada — qualquer objetivo.
              </p>
            </div>

            {goalState?.error && (
              <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">
                {goalState.error}
              </p>
            )}

            <form action={goalAction} className="flex flex-col gap-4">
              <FormField label="Nome da meta" htmlFor="goalName" required>
                <Input id="goalName" name="name" placeholder="Ex.: Reserva de emergência" autoFocus required />
              </FormField>
              <FormField label="Valor alvo (R$)" htmlFor="targetAmount" required>
                <Input
                  id="targetAmount" name="targetAmount"
                  type="number" step="0.01" min="1"
                  placeholder="10000,00" required
                />
              </FormField>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setStep(3)} className="flex-1">
                  Pular
                </Button>
                <Button type="submit" loading={goalPending} className="flex-1 gap-2">
                  Criar meta
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* ── Step 3: Done ── */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center gap-6">
            <div className="relative size-36 mascot-bounce">
              <Image src={MASCOT_SRCS.celebrating} alt="Rook" fill className="object-contain" />
            </div>
            <div className="flex flex-col gap-2">
              <CheckCircle2 className="size-8 text-success mx-auto" />
              <h2 className="text-2xl font-bold text-slate-100">Tudo pronto!</h2>
              <p className="text-slate-500 text-sm">
                Seu Rook Money está configurado. Vamos ver como tá seu dinheiro.
              </p>
            </div>
            <form action={markOnboarded} className="w-full">
              <Button type="submit" className="w-full gap-2">
                Ir pro Dashboard
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
