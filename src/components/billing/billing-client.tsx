'use client'

import { useState } from 'react'
import { Crown, Zap, Star, Shield, BarChart3, Bot, Upload, Infinity, CreditCard, Receipt, XCircle, ChevronRight, AlertTriangle } from 'lucide-react'
import { clientApi, type User } from '@/lib/api-client'
import { UsageBar } from '@/components/ui/limit-banner'

const PRO_FEATURES = [
  { icon: Infinity,  label: 'Transações, metas e contas ilimitadas' },
  { icon: BarChart3, label: 'Relatórios avançados e projeção financeira' },
  { icon: Bot,       label: 'Chat com IA — Rookinho responde tudo' },
  { icon: Upload,    label: 'Importação de extratos CSV' },
  { icon: Star,      label: 'Orçamento por categoria' },
  { icon: Shield,    label: 'Suporte prioritário' },
]

interface Props {
  user: User
  hasStripeSubscription?: boolean
  cancelAtPeriodEnd?: boolean
  currentPeriodEnd?: string | null
}

export function BillingClient({ user, hasStripeSubscription = false, cancelAtPeriodEnd = false, currentPeriodEnd = null }: Props) {
  const [annual,      setAnnual]      = useState(false)
  const [loadingUp,   setLoadingUp]   = useState(false)
  const [loadingPort, setLoadingPort] = useState(false)

  const isPro        = user.plan === 'PRO'
  const monthlyPrice = 19.90
  const annualPrice  = 15.90
  const price        = annual ? annualPrice : monthlyPrice

  async function handleUpgrade() {
    setLoadingUp(true)
    try {
      const { url } = await clientApi.createCheckout(annual)
      if (url) window.location.href = url
    } catch {
      alert('Erro ao iniciar checkout. Tente novamente.')
    } finally {
      setLoadingUp(false)
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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
          <Crown className="size-5 text-amber-400" />
          Plano e assinatura
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">Gerencie seu plano e acompanhe seu uso</p>
      </div>

      {/* Current plan status */}
      <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
        isPro
          ? 'bg-amber-400/5 border-amber-400/25'
          : 'bg-ink-800 border-white/6'
      }`}>
        <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${
          isPro ? 'bg-amber-400/15' : 'bg-ink-700'
        }`}>
          {isPro
            ? <Crown className="size-6 text-amber-400 fill-amber-400/30" />
            : <Zap className="size-6 text-brand-400" />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-100">Plano {isPro ? 'PRO' : 'Gratuito'}</p>
            {isPro && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                cancelAtPeriodEnd
                  ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                  : 'bg-amber-400/15 text-amber-400 border-amber-400/30'
              }`}>
                {cancelAtPeriodEnd ? 'CANCELANDO' : 'ATIVO'}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            {isPro
              ? 'Você tem acesso a todos os recursos sem limitações.'
              : 'Upgrade para PRO e desbloqueie tudo.'}
          </p>
        </div>
        {isPro && (
          <button
            onClick={handlePortal}
            disabled={loadingPort}
            className="text-sm text-slate-400 hover:text-slate-200 border border-white/10 hover:border-white/20 px-3 py-2 rounded-lg transition-colors shrink-0"
          >
            {loadingPort ? '...' : 'Gerenciar'}
          </button>
        )}
      </div>

      {/* Cancellation pending banner */}
      {isPro && cancelAtPeriodEnd && currentPeriodEnd && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 flex items-start gap-4">
          <div className="size-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="size-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-300">Cancelamento agendado</p>
            <p className="text-sm text-slate-400 mt-1">
              Seu plano PRO será cancelado em{' '}
              <strong className="text-slate-200">
                {new Date(currentPeriodEnd).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </strong>
              . Até lá, você mantém acesso a todos os recursos.
            </p>
            <button
              onClick={handlePortal}
              disabled={loadingPort}
              className="mt-3 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
              {loadingPort ? '...' : 'Reativar assinatura →'}
            </button>
          </div>
        </div>
      )}

      {/* Usage (Free only) */}
      {!isPro && user.usage && user.limits && (
        <div className="bg-ink-800 border border-white/6 rounded-2xl p-5 flex flex-col gap-3">
          <p className="text-sm font-medium text-slate-300">Uso do plano gratuito</p>
          <div className="flex flex-col gap-2.5">
            <UsageBar used={user.usage.transactionsThisMonth} limit={user.limits.transactionsPerMonth} label="Transações" />
            <UsageBar used={user.usage.bills}                 limit={user.limits.bills}                label="Contas" />
            <UsageBar used={user.usage.goals}                 limit={user.limits.goals}                label="Metas" />
            <UsageBar used={user.usage.people}                limit={user.limits.people}               label="Pessoas" />
            <UsageBar used={user.usage.recurring}             limit={user.limits.recurring}            label="Recorrentes" />
          </div>
        </div>
      )}

      {/* Upgrade section (Free only) */}
      {!isPro && (
        <div className="bg-gradient-to-br from-ink-800 to-[#0d1f50] border border-brand-700/30 rounded-2xl overflow-hidden">
          {/* Glow */}
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="size-4 text-amber-400 fill-amber-400/30" />
                  <span className="text-sm font-bold text-amber-400 uppercase tracking-wide">PRO</span>
                </div>
                <p className="text-2xl font-bold text-slate-100">
                  R${price.toFixed(2).replace('.', ',')}<span className="text-base font-normal text-slate-400">/mês</span>
                </p>
                {annual && <p className="text-xs text-slate-500 mt-0.5">cobrado R$190,80/ano</p>}
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-3 bg-ink-700/60 border border-white/6 rounded-xl p-1">
                <button
                  onClick={() => setAnnual(false)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    !annual ? 'bg-ink-600 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Mensal
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    annual ? 'bg-ink-600 text-slate-200 shadow-sm' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Anual
                  <span className="text-[9px] font-bold bg-amber-400/20 text-amber-400 px-1 py-0.5 rounded">-20%</span>
                </button>
              </div>
            </div>

            {annual && (
              <p className="text-xs text-success -mt-2">
                🎉 Você economiza R${((monthlyPrice - annualPrice) * 12).toFixed(0)} por ano — equivale a 2 meses grátis
              </p>
            )}

            {/* Features */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRO_FEATURES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <div className="size-6 rounded-lg bg-brand-600/20 flex items-center justify-center shrink-0">
                    <Icon className="size-3.5 text-brand-400" />
                  </div>
                  {label}
                </li>
              ))}
            </ul>

            <button
              onClick={handleUpgrade}
              disabled={loadingUp}
              className="w-full bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/25 hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingUp ? 'Redirecionando...' : annual
                ? '⚡ Assinar anual — 2 meses grátis'
                : '⚡ Assinar PRO — R$19,90/mês'}
            </button>

            <p className="text-center text-xs text-slate-600">
              Cancele quando quiser · Sem multa · Cartão ou Pix
            </p>
          </div>
        </div>
      )}

      {/* PRO — manage subscription */}
      {isPro && (
        <div className="bg-ink-800 border border-white/6 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <p className="text-sm font-semibold text-slate-300">Gerenciar assinatura</p>
            <p className="text-xs text-slate-600 mt-0.5">
              {hasStripeSubscription ? 'Tudo é gerenciado de forma segura via Stripe' : 'Plano ativado manualmente pelo administrador'}
            </p>
          </div>

          {hasStripeSubscription ? (
            <>
              <div className="divide-y divide-white/5">
                <button onClick={handlePortal} disabled={loadingPort}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-ink-700/50 transition-colors text-left disabled:opacity-50">
                  <div className="size-9 rounded-xl bg-brand-800/60 flex items-center justify-center shrink-0">
                    <CreditCard className="size-4 text-brand-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">Atualizar forma de pagamento</p>
                    <p className="text-xs text-slate-500">Trocar cartão ou adicionar novo</p>
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
                    <p className="text-xs text-slate-500">Você mantém o PRO até o fim do período pago</p>
                  </div>
                  <ChevronRight className="size-4 text-slate-600 shrink-0" />
                </button>
              </div>
              {loadingPort && (
                <div className="px-5 py-3 border-t border-white/5 text-xs text-slate-500 text-center">
                  Abrindo portal seguro...
                </div>
              )}
            </>
          ) : (
            <div className="px-5 py-6 text-center flex flex-col items-center gap-2">
              <p className="text-sm text-slate-400">Seu plano PRO foi ativado pela equipe Rook Money.</p>
              <p className="text-xs text-slate-600">Para gerenciar cobranças, entre em contato pelo Suporte.</p>
            </div>
          )}
        </div>
      )}

      {/* FAQ rápido */}
      <div className="bg-ink-800 border border-white/6 rounded-2xl p-5 flex flex-col gap-3">
        <p className="text-sm font-medium text-slate-300">Dúvidas frequentes</p>
        {[
          { q: 'Posso cancelar quando quiser?', a: 'Sim, sem multa. Você mantém o acesso PRO até o fim do período pago.' },
          { q: 'Quais formas de pagamento?',    a: 'Cartão de crédito/débito e Pix (via Stripe).' },
          { q: 'O que acontece se eu cancelar?', a: 'Sua conta migra para o plano Free automaticamente, com os limites do plano gratuito.' },
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
    </div>
  )
}
