'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import Image from 'next/image'
import { ArrowRight, ArrowLeft, CheckCircle2, Banknote, FileText, Target, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input, FormField, Textarea } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { MASCOT_SRCS } from '@/lib/mascot'
import { getServiceBrand, QUICK_BILL_SERVICES } from '@/lib/service-brands'
import { formatCurrency } from '@/lib/utils'
import {
  createOnboardingIncome,
  createOnboardingBill,
  createOnboardingGoal,
  markOnboarded,
} from '@/app/actions/onboarding'
import { useTranslations } from 'next-intl'

interface Props { firstName: string }

const INCOME_TYPES = [
  { value: 'EMPLOYMENT', label: 'CLT / Emprego', emoji: '💼' },
  { value: 'FREELANCE',  label: 'Freelance',     emoji: '🧑‍💻' },
  { value: 'RENTAL',     label: 'Aluguel',        emoji: '🏠' },
  { value: 'OTHER',      label: 'Outro',          emoji: '💡' },
]

export function OnboardingWizard({ firstName }: Props) {
  const t = useTranslations('onboarding')
  const [step, setStep] = useState(0)

  // Income state
  const [incomeIsRecurring, setIncomeRecurring] = useState(true)
  const [incomeType,        setIncomeType]      = useState('EMPLOYMENT')

  // Bill state
  type BillMode = 'avulso' | 'parcelado' | 'recorrente'
  const [billMode,         setBillMode]         = useState<BillMode>('avulso')
  const [billAmountNum,    setBillAmountNum]    = useState(0)
  const [billInstallments, setBillInstallments] = useState(2)
  const [billAlreadyPaid,  setBillAlreadyPaid]  = useState(0)
  const [billName,         setBillName]         = useState('')
  const [showBillServices, setShowBillSvc]      = useState(false)

  const [incomeState, incomeAction, incomePending] = useActionState(createOnboardingIncome, undefined)
  const [billState,   billAction,   billPending]   = useActionState(createOnboardingBill,   undefined)
  const [goalState,   goalAction,   goalPending]   = useActionState(createOnboardingGoal,   undefined)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- useActionState has no completion callback; advance wizard step on successful submission
  useEffect(() => { if (incomeState && !incomeState.error) setStep(2) }, [incomeState])
  // eslint-disable-next-line react-hooks/set-state-in-effect -- useActionState has no completion callback; advance wizard step on successful submission
  useEffect(() => { if (billState   && !billState.error)   setStep(3) }, [billState])
  // eslint-disable-next-line react-hooks/set-state-in-effect -- useActionState has no completion callback; advance wizard step on successful submission
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
                  <input type="hidden" name="type" value={incomeType} />
                  <input type="hidden" name="isRecurring" value={String(incomeIsRecurring)} />

                  {/* Recorrente / Eventual */}
                  <div className="flex gap-2">
                    {([
                      { val: true,  label: 'Recorrente', icon: '🔁', desc: 'Entra todo mês' },
                      { val: false, label: 'Eventual',   icon: '💡', desc: 'Renda pontual' },
                    ]).map(({ val, label, icon, desc }) => (
                      <button key={label} type="button" onClick={() => setIncomeRecurring(val)}
                        className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                          incomeIsRecurring === val
                            ? 'bg-brand-800/60 border-brand-600/50 text-brand-300'
                            : 'bg-ink-800 border-ink-600 text-slate-500 hover:border-ink-500'
                        }`}>
                        <span className="text-base">{icon}</span>
                        <span>{label}</span>
                        <span className="text-[10px] text-slate-600">{desc}</span>
                      </button>
                    ))}
                  </div>

                  <FormField label="Nome" htmlFor="name" required>
                    <Input id="name" name="name" placeholder="Ex.: Empresa X, Cliente Y" autoFocus required />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Tipo" htmlFor="type">
                      <Select value={incomeType} onValueChange={setIncomeType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {INCOME_TYPES.map(({ value, label, emoji }) => (
                            <SelectItem key={value} value={value}>{emoji} {label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    <FormField label="Valor (R$)" htmlFor="amount" required>
                      <CurrencyInput id="amount" name="amount" required />
                    </FormField>
                  </div>

                  {incomeIsRecurring && (
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Dia do recebimento" htmlFor="dayOfMonth">
                        <Input id="dayOfMonth" name="dayOfMonth" type="number" min={1} max={28}
                          placeholder="Ex.: 5" />
                      </FormField>
                      <FormField label="Primeiro pagamento" htmlFor="startDate"
                        hint="Deixe vazio para começar este mês">
                        <Input id="startDate" name="startDate" type="date"
                          defaultValue={new Date().toISOString().split('T')[0]} />
                      </FormField>
                    </div>
                  )}

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
                  <input type="hidden" name="mode" value={billMode} />
                  <input type="hidden" name="isRecurring" value={String(billMode === 'recorrente')} />

                  {/* Mode tabs */}
                  <div className="flex gap-2">
                    {([
                      { key: 'avulso' as BillMode,     label: 'Avulso',     icon: '💸' },
                      { key: 'parcelado' as BillMode,  label: 'Parcelado',  icon: '📅' },
                      { key: 'recorrente' as BillMode, label: 'Recorrente', icon: '🔁' },
                    ]).map((m) => (
                      <button key={m.key} type="button" onClick={() => setBillMode(m.key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                          billMode === m.key
                            ? 'bg-brand-800/60 border-brand-600/50 text-brand-300'
                            : 'bg-ink-800 border-ink-600 text-slate-500 hover:border-ink-500'
                        }`}>
                        <span>{m.icon}</span>{m.label}
                      </button>
                    ))}
                  </div>

                  {/* Name field with service quick-select */}
                  <FormField label={t('step2.nameLabel')} htmlFor="billName" required>
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBillSvc(!showBillServices)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-ink-700 border border-ink-600 hover:border-ink-500 text-xs text-slate-400 transition-colors"
                      >
                        <span>{billName ? billName : 'Selecionar serviço rápido...'}</span>
                        {showBillServices ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                      </button>

                      {showBillServices && (
                        <div className="flex flex-wrap gap-1.5 p-2 bg-ink-800/60 border border-ink-600 rounded-xl max-h-32 overflow-y-auto">
                          {QUICK_BILL_SERVICES.map(({ key, label, brand }) => {
                            const active = billName.toLowerCase() === label.toLowerCase()
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => { setBillName(active ? '' : label); setShowBillSvc(false) }}
                                className="flex items-center gap-1.5 h-7 px-2 rounded-lg text-xs font-medium transition-all border shrink-0"
                                style={
                                  active
                                    ? { backgroundColor: brand.color, color: brand.text, borderColor: brand.color }
                                    : { backgroundColor: brand.color + '18', color: brand.color, borderColor: brand.color + '40' }
                                }
                              >
                                <span className="size-4 rounded flex items-center justify-center text-[9px] font-bold shrink-0"
                                  style={{ backgroundColor: brand.color, color: brand.text }}>
                                  {brand.short}
                                </span>
                                {label}
                              </button>
                            )
                          })}
                        </div>
                      )}

                      <div className="relative">
                        <Input id="billName" name="name" type="text"
                          placeholder={t('step2.namePlaceholder')}
                          value={billName} onChange={(e) => setBillName(e.target.value)} autoFocus required />
                        {(() => { const b = getServiceBrand(billName, undefined); return b ? (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none">
                            <div className="size-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                              style={{ backgroundColor: b.color, color: b.text }}>
                              {b.short}
                            </div>
                          </div>
                        ) : null })()}
                      </div>
                    </div>
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label={billMode === 'parcelado' ? 'Valor da parcela (R$)' : t('step2.amountLabel')} htmlFor="billAmount" required>
                      <CurrencyInput id="billAmount" name="amount" required onValueChange={setBillAmountNum} />
                    </FormField>
                    {billMode === 'recorrente' ? (
                      <FormField label="Dia do vencimento" htmlFor="dayOfMonth" required>
                        <Input id="dayOfMonth" name="dayOfMonth" type="number" min={1} max={28}
                          defaultValue={1} placeholder="1-28" required />
                      </FormField>
                    ) : (
                      <FormField label="1º vencimento" htmlFor="dueDate" required>
                        <Input id="dueDate" name="dueDate" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                      </FormField>
                    )}
                  </div>

                  {billMode === 'recorrente' && (
                    <div className="flex flex-col gap-1 p-3 rounded-lg bg-brand-900/30 border border-brand-700/40">
                      <p className="text-sm text-brand-300 font-medium">Conta fixa mensal</p>
                      {billAmountNum > 0 && (
                        <p className="text-xs text-slate-400">{formatCurrency(billAmountNum)} será gerado automaticamente todo mês</p>
                      )}
                    </div>
                  )}

                  {/* Parcelado options */}
                  {billMode === 'parcelado' && (
                    <div className="flex flex-col gap-3 p-3 rounded-lg bg-ink-800/60 border border-ink-600">
                      <div className="grid grid-cols-2 gap-3">
                        <FormField label="Total de parcelas" htmlFor="installments">
                          <div className="flex items-center gap-2">
                            <input type="number" name="installments" min={2} max={120} value={billInstallments}
                              onChange={(e) => { const v = Number(e.target.value); setBillInstallments(v); if (billAlreadyPaid >= v) setBillAlreadyPaid(v - 1) }}
                              className="w-full bg-ink-700 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 text-center focus:outline-none focus:border-brand-500/50" />
                            <span className="text-xs text-slate-500 shrink-0">parcelas</span>
                          </div>
                        </FormField>
                        <FormField label="Já pagas" htmlFor="alreadyPaid">
                          <div className="flex items-center gap-2">
                            <input type="number" name="alreadyPaid" min={0} max={billInstallments - 1} value={billAlreadyPaid}
                              onChange={(e) => setBillAlreadyPaid(Math.min(Number(e.target.value), billInstallments - 1))}
                              className="w-full bg-ink-700 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 text-center focus:outline-none focus:border-brand-500/50" />
                            <span className="text-xs text-slate-500 shrink-0">pagas</span>
                          </div>
                        </FormField>
                      </div>
                      {billAmountNum > 0 && (
                        <div className="flex flex-col gap-1">
                          <p className="text-xs text-slate-400">
                            <span className="font-medium text-slate-200">{billInstallments - billAlreadyPaid} restantes</span>
                            {' '}× {formatCurrency(billAmountNum)} = <span className="font-medium text-brand-300">{formatCurrency(billAmountNum * (billInstallments - billAlreadyPaid))}</span>
                          </p>
                          {billAlreadyPaid > 0 && (
                            <p className="text-[11px] text-slate-600">{billAlreadyPaid} parcela{billAlreadyPaid > 1 ? 's' : ''} já paga{billAlreadyPaid > 1 ? 's' : ''} não serão cadastradas</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setStep(3)} className="flex-1">{t('skip2')}</Button>
                    <Button type="submit" loading={billPending} disabled={!billName.trim()} className="flex-1 gap-2">
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
