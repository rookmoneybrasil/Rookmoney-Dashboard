'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Crown, Zap } from 'lucide-react'
import { BorderGlow } from '@/components/ui/border-glow'
import { FadeIn } from '@/components/ui/fade-in'

const freePlan = [
  'Dashboard completo',
  'Até 50 transações/mês',
  '2 metas financeiras',
  'Até 5 contas a pagar',
  '2 pessoas (controle de dívidas)',
  'Calendário financeiro',
  'Categorias padrão',
]

const proPlan = [
  'Tudo do plano gratuito',
  'Transações ilimitadas',
  'Metas e contas ilimitadas',
  'Projeção financeira',
  'Orçamento por categoria',
  'Relatórios avançados',
  'Importação de extratos CSV',
  'Chat com IA (Rookinho)',
  'Scanner de recibos',
  'Categorias personalizadas',
]

export function PricingSection() {
  const [annual, setAnnual] = useState(false)

  const monthlyPrice = 19.90
  const annualPrice  = 15.90
  const price        = annual ? annualPrice : monthlyPrice

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <FadeIn className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">Planos simples e transparentes</h2>
          <p className="mt-3 text-slate-400">Comece grátis. Faça upgrade quando precisar.</p>
        </FadeIn>

        {/* Toggle mensal/anual */}
        <FadeIn className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-sm font-medium transition-colors ${!annual ? 'text-slate-100' : 'text-slate-500'}`}>Mensal</span>
          <button
            onClick={() => setAnnual(a => !a)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${annual ? 'bg-brand-600' : 'bg-ink-600'}`}
          >
            <span className={`absolute top-1 size-4 rounded-full bg-white shadow transition-transform duration-300 ${annual ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-medium transition-colors flex items-center gap-2 ${annual ? 'text-slate-100' : 'text-slate-500'}`}>
            Anual
            <span className="bg-amber-400/15 border border-amber-400/30 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              -20%
            </span>
          </span>
        </FadeIn>

        {annual && (
          <FadeIn className="text-center mb-6">
            <p className="text-sm text-success">🎉 Você economiza R${((monthlyPrice - annualPrice) * 12).toFixed(0).replace('.', ',')} por ano — equivale a 2 meses grátis!</p>
          </FadeIn>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* ── Free ── */}
          <FadeIn from="left">
            <BorderGlow
              glowColor="215 20 55"
              colors={['#334155', '#475569', '#1e293b']}
              borderRadius={20}
              glowIntensity={0.7}
              fillOpacity={0.12}
              backgroundColor="#0C1628"
            >
              <div className="p-8 flex flex-col gap-6">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Gratuito</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-slate-100">R$&nbsp;0</span>
                    <span className="text-slate-500 mb-1">/mês</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">Para quem está começando a organizar as finanças.</p>
                </div>

                <ul className="flex flex-col gap-3">
                  {freePlan.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-400">
                      <Check className="size-4 text-slate-600 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="block text-center border border-white/10 hover:border-white/20 text-slate-300 hover:text-slate-100 font-medium py-3 rounded-xl transition-colors"
                >
                  Criar conta grátis
                </Link>
              </div>
            </BorderGlow>
          </FadeIn>

          {/* ── PRO ── */}
          <FadeIn from="right" delay={100}>
            <BorderGlow
              glowColor="234 80 65"
              colors={['#6366f1', '#818cf8', '#4f46e5']}
              borderRadius={20}
              glowIntensity={1.2}
              fillOpacity={0.25}
              backgroundColor="#0D1F50"
              animated
            >
              <div className="relative p-8 flex flex-col gap-6 overflow-hidden">
                {/* Glow backdrop */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse 100% 60% at 50% -20%, rgba(99,102,241,0.22) 0%, transparent 70%)' }}
                />

                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Crown className="size-4 text-amber-400 fill-amber-400/30" />
                      <p className="text-sm font-bold text-amber-400 uppercase tracking-wider">PRO</p>
                    </div>
                    <span className="text-xs font-semibold bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Zap className="size-3 fill-amber-300" />
                      Recomendado
                    </span>
                  </div>

                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-slate-100">
                      R$&nbsp;{price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-slate-400 mb-1">/mês</span>
                  </div>

                  {annual && (
                    <p className="text-xs text-slate-500 mt-1">cobrado R$&nbsp;190,80/ano</p>
                  )}

                  <p className="text-sm text-slate-400 mt-2">
                    Controle total das suas finanças, sem limites.
                  </p>
                </div>

                <ul className="relative flex flex-col gap-3">
                  {proPlan.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-200">
                      <div className="size-4 rounded-full bg-brand-600/30 flex items-center justify-center shrink-0">
                        <Check className="size-2.5 text-brand-300" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className="relative block text-center bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 hover:to-indigo-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-500/40 hover:scale-[1.01]"
                >
                  {annual ? 'Assinar anual — 2 meses grátis' : 'Começar com PRO'}
                </Link>

                <p className="text-center text-xs text-slate-600">Cancele quando quiser · Sem multa</p>
              </div>
            </BorderGlow>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
