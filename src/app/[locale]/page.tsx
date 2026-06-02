import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import {
  LayoutDashboard,
  FileText,
  Target,
  Banknote,
  PiggyBank,
  BarChart3,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { BorderGlow } from '@/components/ui/border-glow'
import { GlassIcon } from '@/components/ui/glass-icons'
import DarkVeil from '@/components/ui/dark-veil'
import CardSwap, { Card } from '@/components/ui/card-swap'
import LaserFlow from '@/components/ui/laser-flow'
import { FadeIn } from '@/components/ui/fade-in'
import { PricingSection } from '@/components/landing/pricing-section'
import { LanguageSwitcher } from '@/components/ui/language-switcher'

// ─── Data ──────────────────────────────────────────────────────────────────────

const BRAND_GLOW  = '213 80 60'
const BRAND_COLORS = ['#3b82f6', '#6366f1', '#2563eb']

const features = [
  {
    icon:  LayoutDashboard,
    title: 'Dashboard inteligente',
    description: 'Visão completa das suas finanças em tempo real. Receitas, despesas, saldo e tendências num só lugar.',
  },
  {
    icon:  FileText,
    title: 'Contas a pagar',
    description: 'Nunca mais esqueça uma conta. Cadastre vencimentos e receba alertas automáticos.',
  },
  {
    icon:  Target,
    title: 'Metas financeiras',
    description: 'Defina objetivos, acompanhe o progresso e comemore cada conquista no seu caminho à independência financeira.',
  },
  {
    icon:  Banknote,
    title: 'Rendas automáticas',
    description: 'Registre fontes de renda recorrentes e deixe o Rook calcular automaticamente suas entradas mensais.',
  },
  {
    icon:  PiggyBank,
    title: 'Orçamento por categoria',
    description: 'Estabeleça limites de gastos por categoria e mantenha o controle com alertas visuais em tempo real.',
  },
  {
    icon:  BarChart3,
    title: 'Relatórios detalhados',
    description: 'Gráficos e tabelas que revelam padrões de consumo. Exporte em CSV e tome decisões embasadas.',
  },
]



// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const t = await getTranslations('landing')
  return (
    <div className="min-h-screen bg-ink-900 text-slate-100 flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/6 bg-ink-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="relative h-8 w-32 shrink-0">
            <Image src="/SVG/logo branco.svg" alt="Rook Money" fill className="object-contain object-left" priority />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features"   className="text-sm text-slate-400 hover:text-slate-100 transition-colors">{t('nav.features')}</a>
            <a href="#pricing"    className="text-sm text-slate-400 hover:text-slate-100 transition-colors">{t('nav.pricing')}</a>
            <Link href="/support" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">{t('nav.support')}</Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login"    className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors px-3 py-1.5">{t('nav.login')}</Link>
            <Link href="/register" className="text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg transition-colors">{t('nav.cta')}</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative px-4 sm:px-6 pt-16 sm:pt-20 pb-16 overflow-hidden">
        {/* DarkVeil WebGL background */}
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ opacity: 0.45 }}>
          <DarkVeil speed={0.4} hueShift={30} warpAmount={0.2} />
        </div>
        {/* Dark overlay — garante legibilidade do texto */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(8,14,29,0.55)' }}
        />
        {/* Fade to page bg at bottom */}
        <div
          aria-hidden
          className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--color-ink-900))' }}
        />
        {/* Fade to page bg at top (blend with header) */}
        <div
          aria-hidden
          className="absolute top-0 inset-x-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, transparent, var(--color-ink-900))' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-6">

            {/* ── Left: mascot ── */}
            <div className="relative shrink-0 w-64 sm:w-80 lg:w-[420px]">
              {/* Glow under mascot */}
              <div
                aria-hidden
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-16 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.35) 0%, transparent 70%)', filter: 'blur(16px)' }}
              />
              <Image
                src="/ROOKINHO FLUTUANDO.png"
                alt="Rookinho"
                width={420}
                height={420}
                className="object-contain w-full h-auto mascot-float"
                priority
              />
            </div>

            {/* ── Right: copy ── */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 min-w-0 pt-4 lg:pt-0">
              {/* Badge */}
              <FadeIn delay={100}>
                <div className="inline-flex items-center gap-2 bg-brand-800/60 border border-brand-700/40 text-brand-400 text-xs font-medium px-3 py-1 rounded-full mb-6">
                  <Zap className="size-3" />
                  Controle financeiro simplificado
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight tracking-tight max-w-xl">
                  {t('hero.title')}{' '}
                  <span
                    className="text-transparent bg-clip-text"
                    style={{ backgroundImage: 'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)' }}
                  >
                    {t('hero.titleHighlight')}
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={320}>
                <p className="mt-5 text-lg text-slate-400 max-w-lg leading-relaxed">
                  {t('hero.description')}
                </p>
              </FadeIn>

              <FadeIn delay={440}>
              <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-brand-600/25 hover:shadow-brand-500/30"
                >
                  {t('hero.cta')}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 border border-white/10 text-slate-300 hover:text-slate-100 hover:border-white/20 font-medium px-6 py-3 rounded-xl transition-colors"
                >
                  {t('hero.login')}
                </Link>
              </div>
              </FadeIn>

              <FadeIn delay={540}>
                <p className="mt-5 text-sm text-slate-600">{t('hero.freeNote')}</p>
              </FadeIn>

              {/* Mini stat cards */}
              <FadeIn delay={660} className="w-full">
              <div className="mt-8 grid grid-cols-3 gap-3 w-full max-w-sm lg:max-w-none">
                <BorderGlow
                  glowColor="123 80 45"
                  colors={['#22c55e', '#4ade80', '#16a34a']}
                  borderRadius={12}
                  glowIntensity={0.9}
                  fillOpacity={0.18}
                  animated
                >
                  <div className="p-3 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <TrendingUp className="size-3 text-success shrink-0" />
                      <span className="hidden sm:inline">{t('hero.income')}</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-success leading-none">+R$&nbsp;6.200</p>
                  </div>
                </BorderGlow>

                <BorderGlow
                  glowColor="3 90 65"
                  colors={['#f43f5e', '#fb7185', '#e11d48']}
                  borderRadius={12}
                  glowIntensity={0.9}
                  fillOpacity={0.18}
                  animated
                >
                  <div className="p-3 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <TrendingDown className="size-3 text-danger shrink-0" />
                      <span className="hidden sm:inline">{t('hero.expenses')}</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-danger leading-none">-R$&nbsp;3.840</p>
                  </div>
                </BorderGlow>

                <BorderGlow
                  glowColor="213 90 65"
                  colors={['#3b82f6', '#60a5fa', '#2563eb']}
                  borderRadius={12}
                  glowIntensity={0.9}
                  fillOpacity={0.18}
                  animated
                >
                  <div className="p-3 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Wallet className="size-3 text-brand-400 shrink-0" />
                      <span className="hidden sm:inline">{t('hero.balance')}</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-brand-300 leading-none">+R$&nbsp;2.360</p>
                  </div>
                </BorderGlow>
              </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </section>

      {/* ── Social proof ────────────────────────────────────────────── */}
      <section className="py-12 px-4 sm:px-6 border-y border-white/5 bg-ink-800/20">
        <div className="max-w-5xl mx-auto">
          <FadeIn className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-14 text-center">
            {(t.raw('trust') as { value: string; label: string }[]).map(({ value, label }) => (
              <div key={value} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-black text-white tracking-tight">{value}</span>
                <span className="text-xs text-slate-500">{label}</span>
              </div>
            ))}
          </FadeIn>

          {/* Testimonials */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(t.raw('testimonials') as { name: string; role: string; text: string; initials: string; color: string }[]).map(({ name, role, text, initials, color }, i) => (
              <FadeIn key={name} delay={i * 100} from="bottom">
                <div className="bg-ink-800 border border-white/6 rounded-2xl p-5 flex flex-col gap-4">
                  <p className="text-sm text-slate-300 leading-relaxed flex-1">"{text}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                    <div
                      className="size-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{name}</p>
                      <p className="text-[11px] text-slate-600">{role}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── App Preview (CardSwap) ──────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Copy */}
            <div className="flex flex-col gap-5 lg:w-96 shrink-0 text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 leading-tight">
                Veja seu dinheiro<br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#818cf8,#6366f1)' }}>
                  em tempo real
                </span>
              </h2>
              <p className="text-slate-400 leading-relaxed">
                Dashboard, relatórios, metas e transações num app só — bonito e rápido no desktop ou celular.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center lg:justify-start gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-5 py-3 rounded-xl transition-all w-fit mx-auto lg:mx-0 shadow-lg shadow-brand-600/20"
              >
                Começar agora
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* CardSwap */}
            <div className="relative flex-1" style={{ height: 480 }}>
              <CardSwap
                width={420}
                height={300}
                cardDistance={50}
                verticalDistance={55}
                delay={4000}
                pauseOnHover
                skewAmount={4}
                easing="elastic"
              >
                {/* Card 1 — Dashboard */}
                <Card>
                  <div className="p-5 flex flex-col gap-4 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dashboard</span>
                      <span className="text-xs text-brand-400 bg-brand-900/60 border border-brand-800/60 px-2 py-0.5 rounded-full">Maio 2025</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: t('hero.income'),   value: '+R$ 6.200', color: '#22c55e' },
                        { label: t('hero.expenses'), value: '-R$ 3.840', color: '#f43f5e' },
                        { label: t('hero.balance'),  value: '+R$ 2.360', color: '#60a5fa' },
                      ].map(s => (
                        <div key={s.label} className="bg-ink-700/80 rounded-xl p-3 flex flex-col gap-1">
                          <span className="text-[10px] text-slate-500">{s.label}</span>
                          <span className="text-sm font-bold" style={{ color: s.color }}>{s.value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 bg-ink-700/50 rounded-xl p-3 flex flex-col gap-2">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wide">{t('spendingByCategory')}</span>
                      <div className="flex flex-col gap-1.5 mt-1">
                        {[
                          { label: 'Alimentação', pct: 72, color: '#f97316' },
                          { label: 'Transporte',  pct: 45, color: '#3b82f6' },
                          { label: 'Lazer',        pct: 30, color: '#a855f7' },
                        ].map(b => (
                          <div key={b.label} className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 w-20 shrink-0">{b.label}</span>
                            <div className="flex-1 h-1.5 bg-ink-600 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
                            </div>
                            <span className="text-[10px] text-slate-600 w-6 text-right">{b.pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Card 2 — Transações */}
                <Card>
                  <div className="p-5 flex flex-col gap-4 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transações</span>
                      <span className="text-xs text-slate-600">20 registros</span>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      {[
                        { label: 'Supermercado Extra',    val: '-R$ 284,50', color: '#f43f5e', date: '28 mai' },
                        { label: 'Salário — Empresa X',   val: '+R$ 4.200',  color: '#22c55e', date: '25 mai' },
                        { label: 'Netflix',               val: '-R$ 55,90',  color: '#f43f5e', date: '24 mai' },
                        { label: 'Freela — Cliente Y',    val: '+R$ 2.000',  color: '#22c55e', date: '22 mai' },
                        { label: 'Posto de gasolina',     val: '-R$ 180,00', color: '#f43f5e', date: '20 mai' },
                      ].map(t => (
                        <div key={t.label} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                          <div className="size-7 rounded-lg bg-ink-700 flex items-center justify-center shrink-0">
                            <div className="size-2 rounded-full" style={{ backgroundColor: t.color }} />
                          </div>
                          <span className="flex-1 text-xs text-slate-300 truncate">{t.label}</span>
                          <span className="text-xs font-semibold shrink-0" style={{ color: t.color }}>{t.val}</span>
                          <span className="text-[10px] text-slate-600 shrink-0 w-10 text-right">{t.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Card 3 — Relatórios */}
                <Card>
                  <div className="p-5 flex flex-col gap-4 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Relatórios</span>
                      <span className="text-xs text-brand-400 bg-brand-900/60 border border-brand-800/60 px-2 py-0.5 rounded-full">6 meses</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-end gap-1.5 h-28 px-1">
                        {[
                          { month: 'Dez', income: 60, expense: 40 },
                          { month: 'Jan', income: 75, expense: 55 },
                          { month: 'Fev', income: 65, expense: 48 },
                          { month: 'Mar', income: 80, expense: 60 },
                          { month: 'Abr', income: 70, expense: 50 },
                          { month: 'Mai', income: 90, expense: 62 },
                        ].map(m => (
                          <div key={m.month} className="flex-1 flex flex-col items-center gap-0.5">
                            <div className="w-full flex flex-col-reverse gap-0.5">
                              <div className="w-full rounded-sm" style={{ height: `${m.expense * 0.85}px`, backgroundColor: '#f43f5e66' }} />
                              <div className="w-full rounded-sm" style={{ height: `${m.income * 0.85}px`, backgroundColor: '#3b82f666' }} />
                            </div>
                            <span className="text-[9px] text-slate-600 mt-1">{m.month}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 justify-center">
                        <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-brand-500"/><span className="text-[10px] text-slate-500">{t('chartIncome')}</span></div>
                        <div className="flex items-center gap-1.5"><div className="size-2 rounded-full bg-danger"/><span className="text-[10px] text-slate-500">{t('chartExpenses')}</span></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-ink-700/60 rounded-xl p-2.5">
                          <p className="text-[10px] text-slate-500">Taxa de economia</p>
                          <p className="text-base font-bold text-success">38%</p>
                        </div>
                        <div className="bg-ink-700/60 rounded-xl p-2.5">
                          <p className="text-[10px] text-slate-500">Melhor mês</p>
                          <p className="text-base font-bold text-brand-300">Maio</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Card 4 — Metas */}
                <Card>
                  <div className="p-5 flex flex-col gap-4 h-full">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Metas</span>
                      <span className="text-xs text-slate-600">3 ativas</span>
                    </div>
                    <div className="flex flex-col gap-3 flex-1">
                      {[
                        { name: 'Reserva de emergência', current: 6800,  target: 10000, color: '#3b82f6' },
                        { name: 'Viagem para Europa',    current: 3200,  target: 8000,  color: '#a855f7' },
                        { name: 'Notebook novo',         current: 2100,  target: 2500,  color: '#22c55e' },
                      ].map(g => {
                        const pct = Math.round((g.current / g.target) * 100)
                        return (
                          <div key={g.name} className="bg-ink-700/60 rounded-xl p-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-200 truncate">{g.name}</span>
                              <span className="text-xs font-bold shrink-0 ml-2" style={{ color: g.color }}>{pct}%</span>
                            </div>
                            <div className="h-1.5 bg-ink-600 rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-500">R$ {g.current.toLocaleString('pt-BR')}</span>
                              <span className="text-[10px] text-slate-600">de R$ {g.target.toLocaleString('pt-BR')}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </Card>
              </CardSwap>
            </div>

          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <FadeIn className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100">Tudo que você precisa</h2>
            <p className="mt-3 text-slate-400 max-w-lg mx-auto">
              Ferramentas poderosas para você entender e controlar cada centavo que entra e sai.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, description }, idx) => (
              <FadeIn key={title} delay={idx * 80} from="bottom">
              <BorderGlow
                key={title}
                glowColor={BRAND_GLOW}
                colors={BRAND_COLORS}
                borderRadius={16}
                glowIntensity={0.8}
                fillOpacity={0.12}
                coneSpread={22}
                backgroundColor="#0C1628"
              >
                <div className="p-6 flex flex-col gap-4">
                  <div style={{ fontSize: 14 }}>
                    <GlassIcon icon={<Icon size={20} />} color="blue" as="div" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-100 mb-1.5">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
                  </div>
                </div>
              </BorderGlow>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Rook ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-ink-800/30">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {[
              {
                icon: Shield,
                title: 'Seus dados são seus',
                desc:  'Dados armazenados com segurança. Nunca compartilhamos suas informações financeiras.',
              },
              {
                icon: Zap,
                title: 'Rápido e intuitivo',
                desc:  'Interface limpa e responsiva. Registre transações em segundos, de qualquer dispositivo.',
              },
              {
                icon: TrendingUp,
                title: 'Insights reais',
                desc:  'Relatórios que revelam onde seu dinheiro vai e como melhorar seus hábitos financeiros.',
              },
            ].map(({ icon: Icon, title, desc }, idx) => (
              <FadeIn key={title} delay={idx * 120} from="bottom">
                <div className="flex flex-col items-center gap-4">
                  <div style={{ fontSize: 18 }}>
                    <GlassIcon icon={<Icon size={24} />} color="blue" as="div" />
                  </div>
                  <h3 className="font-semibold text-slate-100">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs">{desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <FadeIn className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-100">{t('faq.title')}</h2>
            <p className="mt-2 text-slate-500 text-sm">{t('faq.subtitle')}</p>
          </FadeIn>

          <div className="flex flex-col gap-3">
            {(t.raw('faq.items') as { q: string; a: string }[]).map(({ q, a }, i) => (
              <FadeIn key={q} delay={i * 60} from="bottom">
                <details className="group bg-ink-800 border border-white/6 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none text-slate-200 font-medium text-sm hover:text-white transition-colors">
                    {q}
                    <svg
                      className="size-4 shrink-0 text-slate-500 transition-transform duration-200 group-open:rotate-180"
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-400 leading-relaxed border-t border-white/5">
                    {a}
                  </div>
                </details>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: 560 }}>
        {/* LaserFlow background */}
        <div aria-hidden className="absolute inset-0">
          <LaserFlow
            color="#6366f1"
            verticalSizing={2.2}
            horizontalSizing={0.6}
            wispDensity={1.2}
            wispIntensity={4}
            fogIntensity={0.5}
            fogScale={0.28}
            flowSpeed={0.4}
            flowStrength={0.3}
            decay={1.15}
            falloffStart={1.3}
          />
        </div>
        {/* Dark overlay so text is legible */}
        <div aria-hidden className="absolute inset-0" style={{ background: 'rgba(8,14,29,0.72)' }} />
        {/* Fade top */}
        <div aria-hidden className="absolute top-0 inset-x-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to bottom, var(--color-ink-900), transparent)' }} />
        {/* Fade bottom */}
        <div aria-hidden className="absolute bottom-0 inset-x-0 h-16 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--color-ink-900), transparent)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-28 gap-7">
          <FadeIn>
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-100 max-w-xl leading-tight">
              {t('cta.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 ? <br /> : ''}</span>)}
            </h2>
          </FadeIn>
          <FadeIn delay={150}>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              {t('cta.description')}
            </p>
          </FadeIn>
          <FadeIn delay={280}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-lg shadow-brand-600/30 hover:shadow-brand-500/35"
            >
              {t('cta.primary')}
              <ArrowRight className="size-4" />
            </Link>
            <Link href="/login" className="text-sm text-slate-400 hover:text-slate-200 transition-colors">
              {t('cta.secondary')}
            </Link>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-white/6 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="relative h-7 w-28 shrink-0">
            <Image src="/SVG/logo branco.svg" alt="Rook Money" fill className="object-contain object-left opacity-60" />
          </Link>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <nav className="flex items-center gap-5">
              <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                {t('footer.terms')}
              </Link>
              <a href="mailto:contato@rookmoney.com" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
                {t('footer.contact')}
              </a>
              <a
                href="https://www.instagram.com/rookmoneybr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-pink-400 transition-colors"
                aria-label="Instagram"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <LanguageSwitcher />
            </nav>
            <p className="text-sm text-slate-600 text-center sm:text-right">
              &copy; {new Date().getFullYear()} Rook Money · {t('footer.rights')}
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
