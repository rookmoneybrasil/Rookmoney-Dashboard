'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  Target,
  PiggyBank,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Zap,
  Shield,
  TrendingUp,
  Wallet,
  Trophy,
  Users,
  Repeat,
  Smartphone,
  Calendar,
  Bell,
  ChevronRight,
  ChevronLeft,
  Lock,
  Eye,
  CheckCircle2,
  Crown,
  Star,
  Heart,
  DollarSign,
  Globe,
  ChevronDown,
} from 'lucide-react'

const TOTAL = 15

export function InstitutionalSlider() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setCurrent(Math.min(idx, TOTAL - 1))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(i, TOTAL - 1))
    containerRef.current?.scrollTo({ left: clamped * containerRef.current.clientWidth, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goTo(current + 1) }
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [current, goTo])

  return (
    <div className="h-dvh bg-ink-900 text-slate-100 overflow-hidden relative select-none">
      {/* Slides */}
      <div
        ref={containerRef}
        className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <Slide01 />
        <Slide02 />
        <Slide03 />
        <Slide04 />
        <Slide05 />
        <Slide06 />
        <Slide07 />
        <Slide08 />
        <Slide09 />
        <Slide10 />
        <Slide11 />
        <Slide12 />
        <Slide13 />
        <Slide14 />
        <Slide15 />
      </div>

      {/* Navigation arrows — hidden on mobile */}
      {current > 0 && (
        <button
          onClick={() => goTo(current - 1)}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 size-12 items-center justify-center rounded-full bg-ink-800/80 border border-white/10 hover:bg-ink-700 transition-colors backdrop-blur-sm"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      {current < TOTAL - 1 && (
        <button
          onClick={() => goTo(current + 1)}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 size-12 items-center justify-center rounded-full bg-ink-800/80 border border-white/10 hover:bg-ink-700 transition-colors backdrop-blur-sm"
        >
          <ChevronRight className="size-5" />
        </button>
      )}

      {/* Bottom bar: dots + counter */}
      <div className="absolute bottom-0 inset-x-0 z-30 pb-4 sm:pb-6 pt-8 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(8,14,29,0.9), transparent)' }}>
        <div className="flex flex-col items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-brand-500' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium tabular-nums">{current + 1} / {TOTAL}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Shared slide wrapper ───────────────────────────────────────────── */

function SlideFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex-shrink-0 w-full h-full snap-start snap-always overflow-hidden relative ${className}`}>
      <div className="h-full w-full overflow-y-auto sm:overflow-y-hidden flex items-start sm:items-center justify-center px-5 py-16 sm:p-12 lg:p-16 scrollbar-hide">
        <div className="w-full max-w-5xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

function BannerSlide({ src, children, position = 'right center' }: { src: string; children: React.ReactNode; position?: string }) {
  return (
    <div className="flex-shrink-0 w-full h-full snap-start snap-always overflow-hidden relative">
      <div aria-hidden className="absolute inset-0">
        <Image src={src} alt="" fill style={{ objectFit: 'cover', objectPosition: position }} unoptimized />
      </div>
      {/* Desktop: solid left where text sits, fade in the middle, Rookinho clear on right */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none hidden sm:block"
        style={{ background: 'linear-gradient(to right, var(--color-ink-900) 0%, var(--color-ink-900) 28%, rgba(8,14,29,0.7) 38%, rgba(8,14,29,0.2) 50%, transparent 62%)' }}
      />
      {/* Mobile: solid top for text, Rookinho visible at bottom */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none sm:hidden"
        style={{ background: 'linear-gradient(to bottom, var(--color-ink-900) 0%, var(--color-ink-900) 40%, rgba(8,14,29,0.5) 55%, rgba(8,14,29,0.15) 70%, transparent 85%)' }}
      />
      <div aria-hidden className="absolute top-0 inset-x-0 h-12 pointer-events-none" style={{ background: 'linear-gradient(to bottom, var(--color-ink-900), transparent)' }} />
      <div aria-hidden className="absolute bottom-0 inset-x-0 h-12 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--color-ink-900), transparent)' }} />

      <div className="relative z-10 h-full w-full overflow-y-auto sm:overflow-y-hidden flex items-start sm:items-center px-5 py-16 sm:px-12 lg:px-16 scrollbar-hide">
        <div className="w-full max-w-5xl mx-auto">
          <div className="sm:max-w-[42%] lg:max-w-[38%] flex flex-col items-center sm:items-start text-center sm:text-left">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

function Badge({ icon: Icon, text, color = 'brand' }: { icon: typeof Zap; text: string; color?: string }) {
  const colors: Record<string, string> = {
    brand:  'bg-brand-800/60 border-brand-700/40 text-brand-400',
    amber:  'bg-amber-400/15 border-amber-400/25 text-amber-400',
    green:  'bg-emerald-400/15 border-emerald-400/25 text-emerald-400',
    red:    'bg-rose-400/15 border-rose-400/25 text-rose-400',
  }
  return (
    <div className={`inline-flex items-center gap-2 ${colors[color] ?? colors.brand} text-xs font-semibold px-3 py-1 rounded-full border uppercase tracking-wider`}>
      <Icon className="size-3" />
      {text}
    </div>
  )
}

function GradientText({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-transparent bg-clip-text"
      style={{ backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)' }}
    >
      {children}
    </span>
  )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: typeof Zap; title: string; desc: string }) {
  return (
    <div className="bg-ink-800 border border-white/6 rounded-xl sm:rounded-2xl p-3 sm:p-5 flex gap-3 sm:gap-4 items-start">
      <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-brand-600/15 border border-brand-600/20 flex items-center justify-center shrink-0">
        <Icon className="size-4 sm:size-5 text-brand-400" />
      </div>
      <div>
        <h4 className="font-semibold text-slate-100 text-xs sm:text-sm mb-0.5 sm:mb-1">{title}</h4>
        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function StatCard({ value, label, color }: { value: string; label: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/8',
    red:   'text-rose-400 border-rose-500/20 bg-rose-500/8',
    blue:  'text-brand-400 border-brand-500/20 bg-brand-500/8',
    amber: 'text-amber-400 border-amber-500/20 bg-amber-500/8',
  }
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 text-center ${colors[color] ?? colors.blue}`}>
      <p className="text-2xl sm:text-3xl font-bold">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  )
}

/* ── Slides ─────────────────────────────────────────────────────────── */

function Slide01() {
  return (
    <SlideFrame>
      <div className="flex flex-col items-center text-center gap-6 sm:gap-8">
        <Image src="/SVG/logo branco.svg" alt="Rook Money" width={200} height={50} className="h-10 sm:h-12 w-auto" />
        <div className="relative w-48 sm:w-64 lg:w-72">
          <div
            aria-hidden
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-16 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.4) 0%, transparent 70%)', filter: 'blur(20px)' }}
          />
          <Image
            src="/ROOKINHO FLUTUANDO.png"
            alt="Rookinho"
            width={300}
            height={300}
            className="object-contain w-full h-auto drop-shadow-2xl mascot-float"
            priority
          />
        </div>
        <div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Controle financeiro
            <br />
            <GradientText>simples e inteligente</GradientText>
          </h1>
          <p className="mt-4 text-slate-400 text-base sm:text-lg max-w-lg mx-auto">
            Apresentação Institucional
          </p>
        </div>
        <div className="flex items-center gap-2 text-brand-400 text-sm animate-pulse mt-2">
          <span>Deslize para conhecer</span>
          <ArrowRight className="size-4" />
        </div>
      </div>
    </SlideFrame>
  )
}

function Slide02() {
  return (
    <BannerSlide src="/apresentacao/fugindo-contas.png">
      <Badge icon={TrendingUp} text="Cenário" color="red" />
      <h2 className="text-2xl sm:text-4xl font-bold mt-3 sm:mt-4 mb-2 sm:mb-4">
        O desafio financeiro<br />
        <GradientText>do brasileiro</GradientText>
      </h2>
      <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-5 sm:mb-6">
        A maioria dos brasileiros não controla suas finanças. O resultado? Dívidas, estresse e falta de perspectiva para o futuro.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
        <StatCard value="78%" label="não controlam gastos mensais" color="red" />
        <StatCard value="72M" label="de inadimplentes no Brasil" color="red" />
        <StatCard value="63%" label="não têm reserva de emergência" color="amber" />
        <StatCard value="45%" label="já perderam o sono por dívidas" color="amber" />
      </div>
    </BannerSlide>
  )
}

function Slide03() {
  return (
    <SlideFrame>
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
          <Badge icon={Zap} text="A Solução" />
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
            Conheça o<br />
            <GradientText>Rook Money</GradientText>
          </h2>
          <p className="text-slate-400 leading-relaxed max-w-md mx-auto lg:mx-0 mb-6">
            Uma plataforma completa de controle financeiro pessoal. Intuitiva, bonita e poderosa — para quem quer sair do caos e entrar no controle.
          </p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto lg:mx-0">
            {[
              { icon: CheckCircle2, text: 'Gratuito para começar' },
              { icon: CheckCircle2, text: 'Web e mobile (Android e iOS)' },
              { icon: CheckCircle2, text: 'Dashboard inteligente em tempo real' },
              { icon: CheckCircle2, text: 'Gamificação com 61 conquistas' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <Icon className="size-4 text-emerald-400 shrink-0" />
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="order-1 lg:order-2 shrink-0">
          <Image
            src="/SVG/ESTADO - DETERMINADO.svg"
            alt="Rookinho determinado"
            width={260}
            height={260}
            className="w-44 sm:w-56 lg:w-64 h-auto drop-shadow-xl"
          />
        </div>
      </div>
    </SlideFrame>
  )
}

function Slide04() {
  return (
    <SlideFrame>
      <div className="flex flex-col items-center text-center gap-6">
        <Badge icon={LayoutDashboard} text="Dashboard" />
        <h2 className="text-3xl sm:text-4xl font-bold">
          Tudo num só lugar.{' '}
          <GradientText>Sem complicação.</GradientText>
        </h2>
        <p className="text-slate-400 max-w-lg">
          Receitas, gastos, saldo, contas em atraso e categorias — tudo visível de relance no seu painel.
        </p>
        <div className="relative w-full max-w-2xl">
          <div
            aria-hidden
            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-20 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(24px)' }}
          />
          <Image
            src="/rookinho/rookinho-dashboard.png"
            alt="Dashboard do Rook Money"
            width={960}
            height={620}
            className="object-contain w-full h-auto rounded-2xl drop-shadow-2xl"
          />
        </div>
      </div>
    </SlideFrame>
  )
}

function Slide05() {
  return (
    <BannerSlide src="/apresentacao/organizando-contas.png">
      <Badge icon={FileText} text="Contas" />
      <h2 className="text-2xl sm:text-4xl font-bold mt-3 sm:mt-4 mb-2 sm:mb-4">
        Nunca mais esqueça<br />
        <GradientText>uma conta</GradientText>
      </h2>
      <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4 sm:mb-6">
        Cadastre suas contas, parcele, organize por categorias e receba alertas antes do vencimento.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
        <FeatureCard icon={Bell} title="Alertas automáticos" desc="Notificações antes do vencimento" />
        <FeatureCard icon={Repeat} title="Contas recorrentes" desc="Cadastre uma vez, gera todo mês" />
        <FeatureCard icon={Calendar} title="Parcelas" desc="Controle de parcelas e prestações" />
        <FeatureCard icon={CheckCircle2} title="Marcar como pago" desc="Um clique para registrar pagamento" />
      </div>
    </BannerSlide>
  )
}

function Slide06() {
  return (
    <SlideFrame>
      <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-8 lg:gap-12">
        <div className="flex-1 text-center lg:text-left">
          <Badge icon={Wallet} text="Rendas" color="green" />
          <h2 className="text-2xl sm:text-4xl font-bold mt-3 sm:mt-4 mb-2 sm:mb-4">
            Suas rendas<br />
            <GradientText>sob controle</GradientText>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-4 sm:mb-6 max-w-md mx-auto lg:mx-0">
            Registre todas as fontes de receita — salário, freelance, investimentos. Rendas recorrentes são geradas automaticamente todo mês.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md mx-auto lg:mx-0">
            <FeatureCard icon={DollarSign} title="Múltiplas fontes" desc="Salário, freelance, aluguel e mais" />
            <FeatureCard icon={Repeat} title="Rendas recorrentes" desc="Automático todo mês, sem esforço" />
            <FeatureCard icon={TrendingUp} title="Evolução mensal" desc="Acompanhe o crescimento da receita" />
            <FeatureCard icon={BarChart3} title="Receita vs gastos" desc="Compare e entenda seu saldo real" />
          </div>
        </div>
        <div className="shrink-0 hidden sm:block">
          <Image
            src="/SVG/CONTANDO DINHEIRO.svg"
            alt="Rookinho contando dinheiro"
            width={260}
            height={260}
            className="w-44 sm:w-56 lg:w-64 h-auto drop-shadow-xl"
          />
        </div>
      </div>
    </SlideFrame>
  )
}

function Slide07() {
  return (
    <BannerSlide src="/apresentacao/comprando.png">
      <Badge icon={PiggyBank} text="Orçamento" />
      <h2 className="text-2xl sm:text-4xl font-bold mt-3 sm:mt-4 mb-2 sm:mb-4">
        Orçamento por<br />
        <GradientText>categoria</GradientText>
      </h2>
      <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4 sm:mb-6">
        Defina limites de gastos por categoria e saiba exatamente quanto pode gastar. Alertas visuais avisam quando está chegando no limite.
      </p>
      <div className="flex flex-col gap-3 sm:gap-4 w-full">
        {[
          { label: 'Alimentação', pct: 73, color: 'bg-amber-500' },
          { label: 'Transporte', pct: 45, color: 'bg-brand-500' },
          { label: 'Lazer', pct: 92, color: 'bg-rose-500' },
          { label: 'Saúde', pct: 30, color: 'bg-emerald-500' },
        ].map(({ label, pct, color }) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-200">{label}</span>
              <span className={pct > 80 ? 'text-rose-400 font-semibold' : 'text-slate-400'}>{pct}%</span>
            </div>
            <div className="h-2.5 bg-ink-700/80 rounded-full overflow-hidden backdrop-blur-sm">
              <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </BannerSlide>
  )
}

function Slide08() {
  return (
    <BannerSlide src="/apresentacao/metas-foco.png">
      <Badge icon={Target} text="Metas" color="green" />
      <h2 className="text-2xl sm:text-4xl font-bold mt-3 sm:mt-4 mb-2 sm:mb-4">
        Defina metas e<br />
        <GradientText>conquiste sonhos</GradientText>
      </h2>
      <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4 sm:mb-6">
        Quer uma viagem? Um carro novo? Reserva de emergência? Crie metas, faça depósitos e acompanhe o progresso até chegar lá.
      </p>
      <div className="flex flex-col gap-3 w-full">
        {[
          { label: 'Viagem Europa', current: 8500, target: 15000, emoji: '✈️' },
          { label: 'Reserva de emergência', current: 12000, target: 20000, emoji: '🛡️' },
          { label: 'MacBook Pro', current: 6800, target: 8000, emoji: '💻' },
        ].map(({ label, current, target, emoji }) => (
          <div key={label} className="bg-ink-800/80 backdrop-blur-sm border border-white/6 rounded-xl p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <span>{emoji}</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200">{label}</span>
            </div>
            <div className="h-2 sm:h-2.5 bg-ink-700 rounded-full overflow-hidden mb-2">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${(current / target) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-brand-400 font-semibold">R$ {current.toLocaleString('pt-BR')}</span>
              <span className="text-slate-400">de R$ {target.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        ))}
      </div>
    </BannerSlide>
  )
}

function Slide09() {
  return (
    <SlideFrame>
      <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-8 lg:gap-12">
        <div className="shrink-0 order-1 hidden sm:block">
          <Image
            src="/SVG/CONTANDO ORGANIZANDO DINHEIRO.svg"
            alt="Rookinho organizando"
            width={260}
            height={260}
            className="w-44 sm:w-56 lg:w-64 h-auto drop-shadow-xl"
          />
        </div>
        <div className="flex-1 text-center lg:text-left order-2">
          <Badge icon={Users} text="Pessoas" />
          <h2 className="text-2xl sm:text-4xl font-bold mt-3 sm:mt-4 mb-2 sm:mb-4">
            Quem te deve?<br />
            <GradientText>Quanto você deve?</GradientText>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-4 sm:mb-6 max-w-md mx-auto lg:mx-0">
            Registre empréstimos, dívidas compartilhadas e acompanhe tudo com clareza. Saiba exatamente quem deve o quê a qualquer momento.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md mx-auto lg:mx-0">
            <FeatureCard icon={Users} title="Perfis de pessoas" desc="Cadastre amigos, familiares, colegas" />
            <FeatureCard icon={DollarSign} title="Empréstimos" desc="Quem te deve e quanto você deve" />
            <FeatureCard icon={FileText} title="Histórico completo" desc="Todas as transações por pessoa" />
            <FeatureCard icon={CheckCircle2} title="Quitação fácil" desc="Marque como resolvido em um clique" />
          </div>
        </div>
      </div>
    </SlideFrame>
  )
}

function Slide10() {
  return (
    <SlideFrame>
      <div className="flex flex-col items-center text-center gap-6">
        <Badge icon={Trophy} text="Gamificação" color="amber" />
        <h2 className="text-3xl sm:text-4xl font-bold">
          <GradientText>61 conquistas</GradientText> para desbloquear
        </h2>
        <p className="text-slate-400 max-w-lg">
          Organize suas finanças e ganhe badges exclusivos. Cada marco financeiro te dá uma conquista com o Rookinho. Motive-se a manter o controle!
        </p>

        <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3 max-w-2xl">
          {[
            'welcome','first-transaction','first-goal','positive-balance','clean-month',
            'debt-free','autopilot','investor','golden-semester','legendary',
            'achiever','dedicated','dream-collector','economist','first-account',
            'first-bill','first-income','goal-reached','dream-machine','punctual',
          ].map((s) => (
            <div key={s} className="rounded-xl overflow-hidden border border-white/6 bg-ink-800">
              <Image src={`/achievements/${s}.png`} alt={s} width={80} height={80} className="w-full h-auto" />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-6 mt-2">
          <Image
            src="/rookinho/rookinho-thumbsup.png"
            alt="Rookinho aprovando"
            width={100}
            height={120}
            className="w-16 sm:w-20 h-auto drop-shadow-xl"
          />
          <div className="text-left">
            <p className="text-sm text-slate-300 font-semibold">De &quot;Primeiro Passo&quot; a &quot;Lendário&quot;</p>
            <p className="text-xs text-slate-500">Conquistas para iniciantes, intermediários e experts financeiros</p>
          </div>
        </div>
      </div>
    </SlideFrame>
  )
}

function Slide11() {
  return (
    <BannerSlide src="/apresentacao/usando-app.png">
      <Badge icon={BarChart3} text="Relatórios" />
      <h2 className="text-2xl sm:text-4xl font-bold mt-3 sm:mt-4 mb-2 sm:mb-4">
        Insights que fazem<br />
        <GradientText>diferença</GradientText>
      </h2>
      <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-4 sm:mb-6">
        Gráficos e tabelas que revelam padrões de consumo. Entenda pra onde vai cada centavo e tome decisões mais inteligentes.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
        <FeatureCard icon={BarChart3} title="Gráficos detalhados" desc="Gastos por categoria, evolução mensal" />
        <FeatureCard icon={TrendingUp} title="Tendências" desc="Compare meses e identifique padrões" />
        <FeatureCard icon={FileText} title="Exportar CSV" desc="Baixe seus dados para planilhas" />
        <FeatureCard icon={Eye} title="Visão 360°" desc="Receitas, gastos e saldo consolidados" />
      </div>
    </BannerSlide>
  )
}

function Slide12() {
  return (
    <SlideFrame>
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="shrink-0 order-1">
          <Image
            src="/SVG/ESTADO - FELIZ.svg"
            alt="Rookinho feliz"
            width={260}
            height={260}
            className="w-44 sm:w-56 lg:w-64 h-auto drop-shadow-xl"
          />
        </div>
        <div className="flex-1 text-center lg:text-left order-2">
          <Badge icon={Calendar} text="Calendário" />
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
            Calendário<br />
            <GradientText>financeiro</GradientText>
          </h2>
          <p className="text-slate-400 leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
            Visualize todas as suas contas e rendas num calendário. Saiba exatamente o que entra e sai em cada dia do mês.
          </p>

          {/* Mini calendar mockup */}
          <div className="bg-ink-800 border border-white/6 rounded-2xl p-4 sm:p-5 max-w-sm mx-auto lg:mx-0">
            <div className="text-center mb-3">
              <p className="text-sm font-semibold text-slate-200">Junho 2026</p>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {['D','S','T','Q','Q','S','S'].map((d, i) => (
                <span key={i} className="text-slate-600 font-medium py-1">{d}</span>
              ))}
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                const hasBill = [5, 10, 15, 20, 25].includes(day)
                const hasIncome = [1, 15].includes(day)
                return (
                  <div
                    key={day}
                    className={`py-1 rounded-md text-xs ${
                      hasBill ? 'bg-rose-500/20 text-rose-400 font-semibold' :
                      hasIncome ? 'bg-emerald-500/20 text-emerald-400 font-semibold' :
                      'text-slate-400'
                    }`}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/6 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-emerald-400" />
                <span className="text-slate-500">Receitas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-rose-400" />
                <span className="text-slate-500">Contas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SlideFrame>
  )
}

function Slide13() {
  return (
    <SlideFrame>
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        <div className="flex-1 text-center lg:text-left">
          <Badge icon={Globe} text="Multiplataforma" />
          <h2 className="text-3xl sm:text-4xl font-bold mt-4 mb-4">
            Suas finanças em<br />
            <GradientText>qualquer lugar</GradientText>
          </h2>
          <p className="text-slate-400 leading-relaxed mb-6 max-w-md mx-auto lg:mx-0">
            Acesse pelo computador, tablet ou celular. O app mobile sincroniza automaticamente com a versão web — seus dados sempre atualizados.
          </p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto lg:mx-0 mb-6">
            {[
              { icon: Smartphone, text: 'App nativo para Android e iOS' },
              { icon: LayoutDashboard, text: 'Dashboard web completo' },
              { icon: Zap, text: 'Sincronização em tempo real' },
              { icon: Bell, text: 'Notificações push no celular' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-brand-600/15 border border-brand-600/20 flex items-center justify-center shrink-0">
                  <Icon className="size-4 text-brand-400" />
                </div>
                <span className="text-sm text-slate-300">{text}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <Image src="/rookinho/badge-appstore.png" alt="App Store" width={130} height={40} className="h-10 w-auto opacity-90" />
            <Image src="/rookinho/badge-googleplay.png" alt="Google Play" width={130} height={40} className="h-10 w-auto opacity-90" />
          </div>
        </div>
        <div className="shrink-0">
          <div className="relative">
            <div
              aria-hidden
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-16 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(20px)' }}
            />
            <Image
              src="/rookinho/rookinho-phone.png"
              alt="Rookinho com o app mobile"
              width={400}
              height={480}
              className="w-56 sm:w-72 lg:w-80 h-auto drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </SlideFrame>
  )
}

function Slide14() {
  return (
    <SlideFrame>
      <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-8 lg:gap-12">
        <div className="shrink-0 order-1 hidden sm:block">
          <div className="relative w-44 sm:w-56 lg:w-64 flex items-center justify-center">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)' }}
            />
            <div className="relative z-10 size-32 sm:size-40 lg:size-48 rounded-3xl bg-ink-800 border border-white/6 flex items-center justify-center">
              <Shield className="size-16 sm:size-20 lg:size-24 text-brand-400" />
            </div>
          </div>
        </div>
        <div className="flex-1 text-center lg:text-left order-2">
          <Badge icon={Lock} text="Segurança" color="green" />
          <h2 className="text-2xl sm:text-4xl font-bold mt-3 sm:mt-4 mb-2 sm:mb-4">
            Seus dados<br />
            <GradientText>protegidos</GradientText>
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed mb-4 sm:mb-6 max-w-md mx-auto lg:mx-0">
            Privacidade e segurança são prioridade. Seus dados financeiros são seus — nunca compartilhamos nem vendemos informações.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 max-w-md mx-auto lg:mx-0">
            <FeatureCard icon={Lock} title="Criptografia TLS 256" desc="Dados protegidos em trânsito e em repouso" />
            <FeatureCard icon={Shield} title="Conformidade LGPD" desc="Respeito total à lei de proteção de dados" />
            <FeatureCard icon={Eye} title="Transparência total" desc="Você decide o que compartilhar" />
            <FeatureCard icon={Heart} title="Sem venda de dados" desc="Seu dinheiro, suas informações" />
          </div>
        </div>
      </div>
    </SlideFrame>
  )
}

function Slide15() {
  return (
    <SlideFrame>
      <div className="flex flex-col items-center text-center gap-3 sm:gap-8">
        <Image
          src="/rookinho/rookinho-board.png"
          alt="Rookinho"
          width={200}
          height={240}
          className="w-24 sm:w-40 h-auto drop-shadow-xl"
        />
        <div>
          <h2 className="text-2xl sm:text-5xl font-bold leading-tight">
            Comece agora.<br />
            <GradientText>É grátis.</GradientText>
          </h2>
          <p className="mt-2 sm:mt-4 text-sm sm:text-lg text-slate-400 max-w-lg mx-auto">
            Crie sua conta em segundos e comece a organizar suas finanças hoje. Sem cartão de crédito, sem compromisso.
          </p>
        </div>

        {/* Plan comparison */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg w-full">
          <div className="bg-ink-800 border border-white/6 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center">
            <p className="text-xs sm:text-sm font-semibold text-slate-300 mb-0.5 sm:mb-1">Gratuito</p>
            <p className="text-xl sm:text-3xl font-bold text-white">R$ 0</p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Para sempre</p>
            <div className="flex flex-col gap-1 sm:gap-1.5 mt-2 sm:mt-4 text-[10px] sm:text-xs text-left">
              {['Dashboard completo', 'Até 15 contas/mês', 'Metas e conquistas', 'Relatórios básicos'].map((f) => (
                <div key={f} className="flex items-center gap-1.5 sm:gap-2">
                  <CheckCircle2 className="size-3 sm:size-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-400">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-ink-800 border border-brand-600/40 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-600 to-indigo-500" />
            <div className="flex items-center justify-center gap-1 mb-0.5 sm:mb-1">
              <Crown className="size-3 sm:size-3.5 text-amber-400" />
              <p className="text-xs sm:text-sm font-semibold text-brand-400">Pro</p>
            </div>
            <p className="text-xl sm:text-3xl font-bold text-white">R$ 9<span className="text-sm sm:text-lg">,90</span></p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">/mês</p>
            <div className="flex flex-col gap-1 sm:gap-1.5 mt-2 sm:mt-4 text-[10px] sm:text-xs text-left">
              {['Tudo do Gratuito', 'Contas ilimitadas', 'Relatórios avançados', 'Suporte prioritário'].map((f) => (
                <div key={f} className="flex items-center gap-1.5 sm:gap-2">
                  <Star className="size-3 sm:size-3.5 text-brand-400 shrink-0" />
                  <span className="text-slate-400">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-500/35"
          >
            Criar conta grátis
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Voltar ao site
          </Link>
        </div>

        <Image src="/SVG/logo branco.svg" alt="Rook Money" width={120} height={30} className="h-6 w-auto opacity-40 mt-4" />
      </div>
    </SlideFrame>
  )
}
