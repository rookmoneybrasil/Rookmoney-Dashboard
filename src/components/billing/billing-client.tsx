'use client'

import { useState } from 'react'
import { Crown, Zap, Star, Shield, BarChart3, Bot, Upload, Infinity, CreditCard, Receipt, XCircle, ChevronRight, AlertTriangle, Check, Sparkles } from 'lucide-react'
import { clientApi, type User } from '@/lib/api-client'
import { UsageBar } from '@/components/ui/limit-banner'
import { useDashboardTheme } from '@/components/layout/dashboard-shell'

interface Props {
  user: User
  hasStripeSubscription?: boolean
  cancelAtPeriodEnd?: boolean
  currentPeriodEnd?: string | null
}

const PLANS = [
  {
    id: 'FREE' as const,
    name: 'Gratuito',
    price: 0,
    annualPrice: 0,
    icon: Zap,
    color: 'slate',
    features: [
      { text: '50 transações/mês', included: true },
      { text: '5 contas a pagar', included: true },
      { text: '2 metas', included: true },
      { text: '2 pessoas', included: true },
      { text: 'Rookinho IA', included: false },
      { text: 'Relatórios e projeção', included: false },
      { text: 'Orçamento por categoria', included: false },
      { text: 'Importação CSV', included: false },
    ],
  },
  {
    id: 'PRO' as const,
    name: 'Pro',
    price: 19.90,
    annualPrice: 15.90,
    icon: Crown,
    color: 'brand',
    popular: true,
    features: [
      { text: 'Tudo ilimitado', included: true },
      { text: 'Rookinho IA — 30 msgs/mês', included: true },
      { text: '4 análises financeiras/mês', included: true },
      { text: '10 arquivos no chat/mês', included: true },
      { text: 'Relatórios e projeção', included: true },
      { text: 'Orçamento por categoria', included: true },
      { text: 'Importação CSV', included: true },
      { text: 'Scanner de comprovantes', included: true },
    ],
  },
  {
    id: 'PRO_PLUS' as const,
    name: 'Pro+',
    price: 34.90,
    annualPrice: 27.90,
    icon: Sparkles,
    color: 'amber',
    features: [
      { text: 'Tudo do Pro, mais:', included: true },
      { text: 'Rookinho IA ilimitado', included: true, highlight: true },
      { text: 'Análises financeiras ilimitadas', included: true, highlight: true },
      { text: 'Arquivos no chat ilimitados', included: true, highlight: true },
      { text: 'Scanner ilimitado', included: true, highlight: true },
      { text: 'Rookinho no WhatsApp', included: true, highlight: true },
      { text: 'Suporte prioritário', included: true },
    ],
  },
] as const

export function BillingClient({ user, hasStripeSubscription = false, cancelAtPeriodEnd = false, currentPeriodEnd = null }: Props) {
  const [annual,      setAnnual]      = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [loadingPort, setLoadingPort] = useState(false)
  const { theme } = useDashboardTheme()

  const currentPlan = user.plan as 'FREE' | 'PRO' | 'PRO_PLUS'
  const isPro       = currentPlan === 'PRO' || currentPlan === 'PRO_PLUS'

  async function handleUpgrade(plan: 'PRO' | 'PRO_PLUS') {
    setLoadingPlan(plan)
    try {
      const { url } = await clientApi.createCheckout(plan, annual)
      if (url) window.location.href = url
    } catch {
      alert('Erro ao iniciar checkout. Tente novamente.')
    } finally {
      setLoadingPlan(null)
    }
  }

  async function handlePortal() {
    setLoadingPort(true)
    try {
      const { url } = await clientApi.createPortal()
      if (url) window.location.href = url
    } catch {
      alert('Erro ao acessar portal. Tente novamente.')
    } finally {
      setLoadingPort(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <Crown className="size-5 text-amber-400" />
          Planos e assinatura
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Escolha o plano ideal para suas finanças</p>
      </div>

      {/* Cancellation banner */}
      {isPro && cancelAtPeriodEnd && currentPeriodEnd && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex items-start gap-4">
          <div className="size-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="size-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">Cancelamento agendado</p>
            <p className="text-sm text-slate-400 mt-1">
              Seu plano será cancelado em{' '}
              <strong className="text-slate-200">
                {new Date(currentPeriodEnd).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </strong>
              . Até lá, você mantém acesso a todos os recursos.
            </p>
            <button onClick={handlePortal} disabled={loadingPort}
              className="mt-3 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors">
              {loadingPort ? '...' : 'Reativar assinatura →'}
            </button>
          </div>
        </div>
      )}

      {/* Annual toggle */}
      <div className="flex justify-center">
        <div className="flex items-center gap-3 bg-ink-800 border border-white/6 rounded-xl p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
              !annual ? 'bg-ink-600 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Mensal
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              annual ? 'bg-ink-600 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Anual
            <span className="text-[10px] font-bold bg-amber-400/20 text-amber-400 px-1.5 py-0.5 rounded">-20%</span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map(plan => {
          const isCurrent = currentPlan === plan.id
          const isDowngrade = (currentPlan === 'PRO_PLUS' && plan.id === 'PRO') || (isPro && plan.id === 'FREE')
          const canUpgrade = !isCurrent && !isDowngrade && plan.id !== 'FREE'
          const price = annual ? plan.annualPrice : plan.price

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-5 transition-all ${
                isCurrent
                  ? theme === 'light'
                    ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-100 ring-1 ring-indigo-200'
                    : 'border-brand-500/40 bg-brand-600/5 ring-1 ring-brand-500/20'
                  : 'popular' in plan && plan.popular
                    ? theme === 'light'
                      ? 'border-blue-300 bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100'
                      : 'border-brand-700/30 bg-gradient-to-b from-ink-800 to-[#0d1f50]/50'
                    : 'border-white/6 bg-ink-800'
              }`}
            >
              {'popular' in plan && plan.popular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  MAIS POPULAR
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                  SEU PLANO
                </div>
              )}

              <div className="flex items-center gap-2 mb-3 mt-1">
                <plan.icon className={`size-5 ${
                  plan.color === 'amber' ? 'text-amber-400' : plan.color === 'brand' ? 'text-brand-400' : 'text-slate-400'
                }`} />
                <span className="text-base font-bold text-slate-100">{plan.name}</span>
              </div>

              <div className="mb-4">
                {price > 0 ? (
                  <>
                    <span className="text-2xl font-bold text-slate-100">
                      R$ {price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-sm text-slate-500">/mês</span>
                    {annual && (
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        cobrado R$ {(price * 12).toFixed(2).replace('.', ',')}/ano
                      </p>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-bold text-slate-100">Grátis</span>
                )}
              </div>

              <ul className="flex-1 flex flex-col gap-2 mb-5">
                {plan.features.map(f => (
                  <li key={f.text} className="flex items-start gap-2 text-sm">
                    {f.included ? (
                      <Check className={`size-4 shrink-0 mt-0.5 ${'highlight' in f && f.highlight ? 'text-amber-400' : 'text-emerald-400'}`} />
                    ) : (
                      <span className="size-4 shrink-0 mt-0.5 text-center text-slate-600">—</span>
                    )}
                    <span className={f.included ? 'text-slate-300' : 'text-slate-600'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              {canUpgrade && (
                <button
                  onClick={() => handleUpgrade(plan.id as 'PRO' | 'PRO_PLUS')}
                  disabled={!!loadingPlan}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${
                    plan.color === 'amber'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/20'
                      : 'bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white shadow-lg shadow-brand-600/20'
                  }`}
                >
                  {loadingPlan === plan.id ? 'Redirecionando...' : `Assinar ${plan.name}`}
                </button>
              )}

              {isCurrent && isPro && (
                <button onClick={handlePortal} disabled={loadingPort}
                  className="w-full py-3 rounded-xl font-medium text-sm border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors">
                  {loadingPort ? '...' : 'Gerenciar assinatura'}
                </button>
              )}

              {isCurrent && !isPro && (
                <div className="w-full py-3 rounded-xl text-sm text-center text-slate-600">
                  Plano atual
                </div>
              )}

              {isDowngrade && (
                <div className="w-full py-3 rounded-xl text-sm text-center text-slate-600">
                  —
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Usage (Free only) */}
      {!isPro && user.usage && user.limits && (
        <div className="bg-ink-800 border border-white/6 rounded-2xl p-5 flex flex-col gap-3">
          <p className="text-sm font-medium text-slate-300">Uso do plano gratuito</p>
          <div className="flex flex-col gap-2.5">
            <UsageBar used={user.usage.transactionsThisMonth} limit={user.limits.transactionsPerMonth} label="Transações" />
            <UsageBar used={user.usage.bills}                 limit={user.limits.bills}                label="Contas" />
            <UsageBar used={user.usage.goals}                 limit={user.limits.goals}                label="Metas" />
            <UsageBar used={user.usage.people}                limit={user.limits.people}               label="Pessoas" />
          </div>
        </div>
      )}

      {/* Manage subscription (PRO users) */}
      {isPro && hasStripeSubscription && (
        <div className="bg-ink-800 border border-white/6 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-sm font-semibold text-slate-300">Gerenciar assinatura</p>
          </div>
          <div className="divide-y divide-white/5">
            <button onClick={handlePortal} disabled={loadingPort}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-ink-700/50 transition-colors text-left disabled:opacity-50">
              <div className="size-9 rounded-xl bg-brand-800/60 flex items-center justify-center shrink-0">
                <CreditCard className="size-4 text-brand-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">Forma de pagamento</p>
                <p className="text-xs text-slate-500">Trocar cartão ou dados</p>
              </div>
              <ChevronRight className="size-4 text-slate-600 shrink-0" />
            </button>
            <button onClick={handlePortal} disabled={loadingPort}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-ink-700/50 transition-colors text-left disabled:opacity-50">
              <div className="size-9 rounded-xl bg-ink-700 flex items-center justify-center shrink-0">
                <Receipt className="size-4 text-slate-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">Histórico de cobranças</p>
                <p className="text-xs text-slate-500">Ver faturas e comprovantes</p>
              </div>
              <ChevronRight className="size-4 text-slate-600 shrink-0" />
            </button>
            <button onClick={handlePortal} disabled={loadingPort}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-danger/5 transition-colors text-left disabled:opacity-50">
              <div className="size-9 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
                <XCircle className="size-4 text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-danger">Cancelar assinatura</p>
                <p className="text-xs text-slate-500">Mantém acesso até o fim do período</p>
              </div>
              <ChevronRight className="size-4 text-slate-600 shrink-0" />
            </button>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="bg-ink-800 border border-white/6 rounded-2xl p-5 flex flex-col gap-3">
        <p className="text-sm font-medium text-slate-300">Dúvidas frequentes</p>
        {[
          { q: 'Posso cancelar quando quiser?', a: 'Sim, sem multa. Você mantém o acesso até o fim do período pago.' },
          { q: 'Quais formas de pagamento?',    a: 'Cartão de crédito/débito e Pix (via Stripe).' },
          { q: 'Posso trocar de plano depois?',  a: 'Sim! Você pode fazer upgrade ou downgrade a qualquer momento.' },
          { q: 'O que é o Rookinho IA?',         a: 'Assistente financeiro com IA que registra transações, analisa comprovantes, e dá dicas personalizadas sobre suas finanças.' },
        ].map(({ q, a }) => (
          <details key={q} className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none text-sm text-slate-400 hover:text-slate-200 transition-colors py-2 border-t border-white/5 first:border-0">
              {q}
              <span className="text-slate-600 group-open:rotate-180 transition-transform text-lg leading-none">›</span>
            </summary>
            <p className="text-xs text-slate-500 pb-2 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>

      <p className="text-center text-xs text-slate-600 pb-4">
        Cancele quando quiser · Sem multa · Cartão ou Pix
      </p>
    </div>
  )
}
