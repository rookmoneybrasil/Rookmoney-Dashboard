'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import Image from 'next/image'
import { ArrowRight, ArrowLeft, CheckCircle2, Banknote, FileText, Target, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { MASCOT_SRCS } from '@/lib/mascot'
import {
  createOnboardingIncome,
  createOnboardingBill,
  createOnboardingGoal,
  markOnboarded,
} from '@/app/actions/onboarding'
import { useTranslations } from 'next-intl'

interface Props { firstName: string }

export function OnboardingWizard({ firstName }: Props) {
  const t = useTranslations('onboarding')
  const [step, setStep] = useState(0)

  const [incomeState, incomeAction, incomePending] = useActionState(createOnboardingIncome, undefined)
  const [billState,   billAction,   billPending]   = useActionState(createOnboardingBill,   undefined)
  const [goalState,   goalAction,   goalPending]   = useActionState(createOnboardingGoal,   undefined)

  useEffect(() => { if (incomeState && !incomeState.error) setStep(2) }, [incomeState])
  useEffect(() => { if (billState   && !billState.error)   setStep(3) }, [billState])
  useEffect(() => { if (goalState   && !goalState.error)   setStep(4) }, [goalState])

  const STEPS = [
    { icon: Banknote,  label: t('stepLabels.0'), color: 'text-success' },
    { icon: FileText,  label: t('stepLabels.1'), color: 'text-danger'  },
    { icon: Target,    label: t('stepLabels.2'), color: 'text-brand-400' },
  ]

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* ── Welcome ─────────────────────────────────────── */}
        {step === 0 && (
          <div className="flex flex-col items-center text-center gap-8 animate-in fade-in duration-300">
            <div className="relative size-40 mascot-float">
              <Image src={MASCOT_SRCS.happy} alt="Rook" fill className="object-contain" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="size-5 text-brand-400" />
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-widest">{t('welcome')}</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-100">
                {t('hello', { name: firstName })}
              </h1>
              <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                {t('setup3steps', { steps: STEPS.length })}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-ink-800 border border-white/6 rounded-2xl px-6 py-4 w-full">
              {STEPS.map((s, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`size-9 rounded-xl bg-ink-700 flex items-center justify-center ${s.color}`}>
                    <s.icon className="size-4" />
                  </div>
                  <span className="text-xs text-slate-500">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 w-full">
              <Button onClick={() => setStep(1)} className="w-full gap-2 h-11 text-base">
                {t('letsGo')}
                <ArrowRight className="size-4" />
              </Button>
              <button onClick={() => setStep(4)} className="text-xs text-slate-600 hover:text-slate-400 transition-colors py-1">
                {t('skipFull')}
              </button>
            </div>
          </div>
        )}

        {/* ── Steps 1-3 ──────────────────────────────────── */}
        {step >= 1 && step <= 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setStep(s => s - 1)} className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors">
                <ArrowLeft className="size-4" />
              </button>
              <div className="flex gap-2 flex-1">
                {STEPS.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i < step ? 'bg-brand-500' : i === step - 1 ? 'bg-brand-400' : 'bg-ink-600'}`} />
                ))}
              </div>
              <span className="text-xs text-slate-600 tabular-nums">{step}/{STEPS.length}</span>
            </div>

            {/* ── Step 1: Income ── */}
            {step === 1 && (
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center shrink-0">
                    <Banknote className="size-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-success uppercase tracking-wider mb-1">{t('step1.label')}</p>
                    <h2 className="text-xl font-bold text-slate-100">{t('step1.title')}</h2>
                    <p className="text-slate-500 text-sm mt-1">{t('step1.desc')}</p>
                  </div>
                </div>

                {incomeState?.error && (
                  <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{incomeState.error}</p>
                )}

                <form action={incomeAction} className="flex flex-col gap-4">
                  <FormField label={t('step1.sourceLabel')} htmlFor="name" required>
                    <Input id="name" name="name" placeholder={t('step1.sourcePlaceholder')} autoFocus required />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label={t('step1.amountLabel')} htmlFor="amount" required>
                      <Input id="amount" name="amount" type="number" step="0.01" min="1" placeholder="3.000,00" required />
                    </FormField>
                    <FormField label={t('step1.dayLabel')} htmlFor="dayOfMonth">
                      <Input id="dayOfMonth" name="dayOfMonth" type="number" min="1" max="31" placeholder="1" />
                    </FormField>
                  </div>

                  <div className="bg-success/5 border border-success/10 rounded-xl px-4 py-3 flex items-start gap-2">
                    <span className="text-success text-sm mt-0.5">💡</span>
                    <p className="text-xs text-slate-400 leading-relaxed">{t('step1.tip')}</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setStep(2)} className="flex-1">{t('skip2')}</Button>
                    <Button type="submit" loading={incomePending} className="flex-1 gap-2">
                      {t('add')} <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Step 2: Bills ── */}
            {step === 2 && (
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center shrink-0">
                    <FileText className="size-5 text-danger" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-danger uppercase tracking-wider mb-1">{t('step2.label')}</p>
                    <h2 className="text-xl font-bold text-slate-100">{t('step2.title')}</h2>
                    <p className="text-slate-500 text-sm mt-1">{t('step2.desc')}</p>
                  </div>
                </div>

                {billState?.error && (
                  <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{billState.error}</p>
                )}

                <form action={billAction} className="flex flex-col gap-4">
                  <FormField label={t('step2.nameLabel')} htmlFor="billName" required>
                    <Input id="billName" name="name" placeholder={t('step2.namePlaceholder')} autoFocus required />
                  </FormField>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label={t('step2.amountLabel')} htmlFor="billAmount" required>
                      <Input id="billAmount" name="amount" type="number" step="0.01" min="1" placeholder="1.200,00" required />
                    </FormField>
                    <FormField label={t('step2.dayLabel')} htmlFor="day">
                      <Input id="day" name="day" type="number" min="1" max="28" placeholder="10" />
                    </FormField>
                  </div>

                  <div className="bg-warning/5 border border-warning/10 rounded-xl px-4 py-3 flex items-start gap-2">
                    <span className="text-warning text-sm mt-0.5">💡</span>
                    <p className="text-xs text-slate-400 leading-relaxed">{t('step2.tip')}</p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setStep(3)} className="flex-1">{t('skip2')}</Button>
                    <Button type="submit" loading={billPending} className="flex-1 gap-2">
                      {t('add')} <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Step 3: Goal ── */}
            {step === 3 && (
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="size-12 rounded-2xl bg-brand-400/10 border border-brand-400/20 flex items-center justify-center shrink-0">
                    <Target className="size-5 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">{t('step3.label')}</p>
                    <h2 className="text-xl font-bold text-slate-100">{t('step3.title')}</h2>
                    <p className="text-slate-500 text-sm mt-1">{t('step3.desc')}</p>
                  </div>
                </div>

                {goalState?.error && (
                  <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{goalState.error}</p>
                )}

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: '🏖️', label: t('stepLabels.0') === 'Renda' ? 'Viagem' : 'Trip' },
                    { icon: '🏠', label: t('stepLabels.0') === 'Renda' ? 'Imóvel' : 'Housing' },
                    { icon: '🛡️', label: t('stepLabels.0') === 'Renda' ? 'Reserva' : 'Emergency' },
                  ].map(g => (
                    <button key={g.label} type="button"
                      className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-ink-800 border border-ink-600 hover:border-brand-500/40 hover:bg-brand-900/20 transition-colors text-xs text-slate-400">
                      <span className="text-xl">{g.icon}</span>
                      {g.label}
                    </button>
                  ))}
                </div>

                <form action={goalAction} className="flex flex-col gap-4">
                  <FormField label={t('step3.nameLabel')} htmlFor="goalName" required>
                    <Input id="goalName" name="name" placeholder={t('step3.namePlaceholder')} autoFocus required />
                  </FormField>
                  <FormField label={t('step3.amountLabel')} htmlFor="targetAmount" required>
                    <Input id="targetAmount" name="targetAmount" type="number" step="0.01" min="1" placeholder="10.000,00" required />
                  </FormField>

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setStep(4)} className="flex-1">{t('skip2')}</Button>
                    <Button type="submit" loading={goalPending} className="flex-1 gap-2">
                      {t('step3.createGoal')} <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ── Done ────────────────────────────────────────── */}
        {step === 4 && (
          <div className="flex flex-col items-center text-center gap-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative size-44 mascot-bounce">
              <Image src={MASCOT_SRCS.celebrating} alt="Rook" fill className="object-contain" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="size-6 text-success" />
                <span className="text-success font-semibold">{t('setupComplete')}</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-100">{t('allSet')}</h2>
              <p className="text-slate-400 text-base leading-relaxed max-w-sm">{t('allSetDesc')}</p>
            </div>

            <div className="bg-ink-800 border border-white/6 rounded-2xl px-6 py-4 w-full flex flex-col gap-2 text-left">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{t('whatNow')}</p>
              {(t.raw('nextSteps') as string[]).map((tip: string) => (
                <p key={tip} className="text-sm text-slate-400">{tip}</p>
              ))}
            </div>

            <form action={markOnboarded} className="w-full">
              <Button type="submit" className="w-full gap-2 h-11 text-base">
                {t('goToDashboard')}
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
