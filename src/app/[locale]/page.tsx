import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  LayoutDashboard,
  FileText,
  Target,
  PiggyBank,
  BarChart3,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  TrendingDown,
  Wallet,
  Trophy,
  Users,
  Repeat,
  Smartphone,
  Calendar,
  Bell,
  MessageCircle,
  Bot,
  Clock,
  Send,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { BorderGlow } from '@/components/ui/border-glow'
import { GlassIcon } from '@/components/ui/glass-icons'
import DarkVeil from '@/components/ui/dark-veil'
import LaserFlow from '@/components/ui/laser-flow'
import { FadeIn } from '@/components/ui/fade-in'
import { PricingSection } from '@/components/landing/pricing-section'
import { WhatsAppChat } from '@/components/landing/whatsapp-chat'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { UtmCapture } from '@/components/utm-capture'

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
    description: 'Nunca mais esqueça uma conta. Cadastre vencimentos, parcele e receba alertas automáticos.',
  },
  {
    icon:  Target,
    title: 'Metas financeiras',
    description: 'Defina objetivos, acompanhe o progresso e comemore cada conquista no seu caminho à independência financeira.',
  },
  {
    icon:  Repeat,
    title: 'Rendas e contas recorrentes',
    description: 'Cadastre uma vez e o Rook gera automaticamente suas contas e rendas todo mês, sem esquecer nenhuma.',
  },
  {
    icon:  Users,
    title: 'Controle de pessoas',
    description: 'Quem te deve? Quanto você deve? Registre empréstimos, dívidas compartilhadas e acompanhe tudo com clareza.',
  },
  {
    icon:  Trophy,
    title: 'Conquistas e gamificação',
    description: 'Ganhe badges ao atingir marcos financeiros. 61 conquistas para manter a motivação em alta.',
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
  {
    icon:  Calendar,
    title: 'Calendário financeiro',
    description: 'Visualize todas as suas contas e rendas num calendário. Saiba exatamente o que entra e sai em cada dia.',
  },
]



// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function LandingPage() {
  const t = await getTranslations('landing')
  return (
    <div className="min-h-screen bg-ink-900 text-slate-100 flex flex-col overflow-x-hidden">

      <Suspense><UtmCapture /></Suspense>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/6 bg-ink-900/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="relative h-8 w-32 shrink-0">
            <Image src="/SVG/logo branco.svg" alt="Rook Money" fill className="object-contain object-left" priority />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features"   className="text-sm text-slate-400 hover:text-slate-100 transition-colors">{t('nav.features')}</a>
            <a href="#pricing"    className="text-sm text-slate-400 hover:text-slate-100 transition-colors">{t('nav.pricing')}</a>
            <Link href="/blog" className="text-sm text-slate-400 hover:text-slate-100 transition-colors">Blog</Link>
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
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'rgba(8,14,29,0.55)' }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--color-ink-900))' }}
        />
        <div
          aria-hidden
          className="absolute top-0 inset-x-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, transparent, var(--color-ink-900))' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-6">

            {/* ── Left: copy ── */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left flex-1 min-w-0 pt-4 lg:pt-0">
              <FadeIn delay={100}>
                <div className="inline-flex items-center gap-2 bg-brand-800/60 border border-brand-700/40 text-brand-400 text-xs font-medium px-3 py-1 rounded-full mb-6">
                  <Zap className="size-3" />
                  {t('hero.badge')}
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight tracking-tight max-w-xl">
                  {t('hero.title')}
                  <br />
                  <span
                    className="text-transparent bg-clip-text whitespace-nowrap"
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

            {/* ── Right: mascot floating with coins ── */}
            <FadeIn delay={400} from="right" className="relative shrink-0 hidden lg:block">
              <div className="relative w-[420px]">
                <div
                  aria-hidden
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-20 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.4) 0%, transparent 70%)', filter: 'blur(20px)' }}
                />
                <Image
                  src="/ROOKINHO FLUTUANDO.png"
                  alt="Rookinho flutuando com moedas"
                  width={420}
                  height={420}
                  className="object-contain w-full h-auto drop-shadow-2xl mascot-float"
                  priority
                />
              </div>
            </FadeIn>

            {/* Mobile mascot */}
            <FadeIn delay={300} className="lg:hidden">
              <div className="relative w-56 sm:w-72 mx-auto">
                <Image
                  src="/ROOKINHO FLUTUANDO.png"
                  alt="Rookinho flutuando com moedas"
                  width={300}
                  height={300}
                  className="object-contain w-full h-auto drop-shadow-2xl"
                  priority
                />
              </div>
            </FadeIn>

          </div>
        </div>
      </section>

      {/* ── App stores ────────────────────────────────────────────── */}
      <section className="py-10 px-4 sm:px-6 border-b border-white/5">
        <FadeIn className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10">
          <div className="flex items-center gap-3">
            <Smartphone className="size-5 text-brand-400" />
            <div>
              <p className="text-sm font-semibold text-slate-100">Disponível em breve nos apps</p>
              <p className="text-xs text-slate-500">Web, Android e iOS — suas finanças em qualquer lugar.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="opacity-90 hover:opacity-100 transition-opacity">
              <Image src="/rookinho/badge-appstore.png" alt="App Store" width={130} height={40} className="h-10 w-auto" />
            </a>
            <a href="#" className="opacity-90 hover:opacity-100 transition-opacity">
              <Image src="/rookinho/badge-googleplay.png" alt="Google Play" width={130} height={40} className="h-10 w-auto" />
            </a>
          </div>
        </FadeIn>
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
                  <p className="text-sm text-slate-300 leading-relaxed flex-1">&ldquo;{text}&rdquo;</p>
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

      {/* ── Banner Showcase ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Desktop: banner background — full width, image already has dark left side */}
        <div aria-hidden className="absolute inset-0 hidden sm:block">
          <Image
            src="/rookinho/hero-banner-desktop.webp"
            alt=""
            fill
            className="object-cover object-center"
            unoptimized
          />
        </div>
        {/* Mobile: banner background positioned at bottom */}
        <div aria-hidden className="absolute inset-0 sm:hidden">
          <Image
            src="/rookinho/hero-banner-mobile.webp"
            alt=""
            fill
            className="object-cover object-bottom"
            unoptimized
          />
        </div>
        {/* Mobile: solid top covering text area, fades only at the very bottom to reveal banner */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none sm:hidden"
          style={{ background: 'linear-gradient(to bottom, var(--color-ink-900) 0%, var(--color-ink-900) 58%, rgba(8,14,29,0.5) 75%, transparent 90%)' }}
        />
        {/* Fade edges into page bg */}
        <div aria-hidden className="absolute top-0 inset-x-0 h-16 pointer-events-none" style={{ background: 'linear-gradient(to bottom, var(--color-ink-900), transparent)' }} />
        <div aria-hidden className="absolute bottom-0 inset-x-0 h-16 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--color-ink-900), transparent)' }} />

        {/* Mobile: extra bottom padding so the Rookinho illustration shows below text */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-6 py-16 sm:py-24 pb-[480px] sm:pb-24">
          <div className="sm:max-w-none lg:max-w-[42%] text-center sm:text-left flex flex-col items-center sm:items-start">
            <FadeIn>
              <div className="inline-flex items-center gap-2 bg-brand-800/60 border border-brand-700/40 text-brand-400 text-xs font-medium px-3 py-1 rounded-full mb-5 backdrop-blur-sm">
                <LayoutDashboard className="size-3" />
                Painel completo
              </div>
            </FadeIn>
            <FadeIn delay={100}>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                Tudo num só lugar.
                <br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#818cf8,#6366f1)' }}>
                  Sem complicação.
                </span>
              </h2>
            </FadeIn>
            <FadeIn delay={200}>
              <p className="mt-5 text-slate-300 leading-relaxed max-w-md">
                Receitas, gastos, saldo do mês, contas em atraso e categorias de despesas — tudo visível de relance. O Rookinho cuida dos números pra você focar no que importa.
              </p>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="mt-8 grid grid-cols-2 gap-3 max-w-xs">
                {[
                  { icon: TrendingUp, label: 'Receitas vs gastos', color: 'text-success' },
                  { icon: PiggyBank, label: 'Gastos por categoria', color: 'text-brand-400' },
                  { icon: Bell, label: 'Alertas de atraso', color: 'text-danger' },
                  { icon: BarChart3, label: 'Evolução mensal', color: 'text-indigo-400' },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2.5 bg-ink-900/60 backdrop-blur-sm border border-white/6 rounded-xl px-3 py-2.5">
                    <Icon className={`size-4 ${color} shrink-0`} />
                    <span className="text-xs text-slate-300 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={400}>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-brand-600/25 hover:shadow-brand-500/30 mt-8"
              >
                Experimentar grátis
                <ArrowRight className="size-4" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── App Preview ──────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Copy */}
            <div className="flex flex-col gap-5 lg:w-[420px] shrink-0 text-center lg:text-left">
              <FadeIn>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 leading-tight">
                  Veja seu dinheiro<br />
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg,#818cf8,#6366f1)' }}>
                    em tempo real
                  </span>
                </h2>
              </FadeIn>
              <FadeIn delay={100}>
                <p className="text-slate-400 leading-relaxed">
                  Dashboard, relatórios, metas e transações num app só — bonito e rápido no desktop ou celular.
                </p>
              </FadeIn>
              <FadeIn delay={200}>
                <div className="flex flex-col gap-3 mt-2">
                  {[
                    { icon: LayoutDashboard, text: 'Dashboard completo com visão do mês' },
                    { icon: Smartphone, text: 'Funciona no celular e no computador' },
                    { icon: Bell, text: 'Alertas de contas e metas' },
                    { icon: Trophy, text: '61 conquistas para desbloquear' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-brand-600/15 border border-brand-600/20 flex items-center justify-center shrink-0">
                        <Icon className="size-4 text-brand-400" />
                      </div>
                      <span className="text-sm text-slate-300">{text}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>
              <FadeIn delay={300}>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center lg:justify-start gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-5 py-3 rounded-xl transition-all w-fit mx-auto lg:mx-0 shadow-lg shadow-brand-600/20 mt-2"
                >
                  Começar agora
                  <ArrowRight className="size-4" />
                </Link>
              </FadeIn>
            </div>

            {/* Rookinho with dashboard */}
            <FadeIn delay={200} from="right" className="flex-1 flex justify-center">
              <div className="relative w-full max-w-[560px]">
                <div
                  aria-hidden
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-24 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(24px)' }}
                />
                <Image
                  src="/rookinho/rookinho-dashboard.png"
                  alt="Rookinho apresentando o dashboard"
                  width={960}
                  height={620}
                  className="object-contain w-full h-auto drop-shadow-2xl"
                />
              </div>
            </FadeIn>

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

      {/* ── Achievements ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: 420 }}>
        {/* Background: 3 rows of achievement icons scrolling */}
        <div aria-hidden className="absolute inset-0 pointer-events-none flex flex-col justify-center gap-4">
          {/* Row 1 — left */}
          <div className="flex gap-4 animate-scroll-left">
            {['welcome','first-transaction','first-goal','positive-balance','clean-month','debt-free','autopilot','investor','golden-semester','legendary','achiever','dedicated','dream-collector','economist','first-account','first-bill','first-income','goal-reached','dream-machine','punctual','welcome','first-transaction','first-goal','positive-balance','clean-month','debt-free','autopilot','investor','golden-semester','legendary','achiever','dedicated','dream-collector','economist','first-account','first-bill','first-income','goal-reached','dream-machine','punctual'].map((s, i) => (
              <div key={`a1-${i}`} className="shrink-0 size-32 sm:size-36 rounded-2xl overflow-hidden">
                <Image src={`/achievements/${s}.png`} alt="" width={144} height={144} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {/* Row 2 — right */}
          <div className="flex gap-4 animate-scroll-right" style={{ animationDuration: '35s' }}>
            {['organized','flawless-year','big-payment','surplus-3','fortune-teller','lightning-payer','veteran','relentless','frugal','halfway','epic-payment','eternal','financial-network','full-autopilot','full-panorama','goal-millionaire','heavy-deposit','monster-deposit','multi-income','obsessive','organized','flawless-year','big-payment','surplus-3','fortune-teller','lightning-payer','veteran','relentless','frugal','halfway','epic-payment','eternal','financial-network','full-autopilot','full-panorama','goal-millionaire','heavy-deposit','monster-deposit','multi-income','obsessive'].map((s, i) => (
              <div key={`a2-${i}`} className="shrink-0 size-32 sm:size-36 rounded-2xl overflow-hidden">
                <Image src={`/achievements/${s}.png`} alt="" width={144} height={144} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {/* Row 3 — left */}
          <div className="flex gap-4 animate-scroll-left" style={{ animationDuration: '40s' }}>
            {['perfect-quarter','punctuality-legend','rooted','split-right','steady','super-punctual','surplus-6','10-bills','50-bills','100-bills','500-bills','50-transactions','200-transactions','500-transactions','archivist','balance-guardian','complete-profile','diversified','ahead-of-time','cleared-month','perfect-quarter','punctuality-legend','rooted','split-right','steady','super-punctual','surplus-6','10-bills','50-bills','100-bills','500-bills','50-transactions','200-transactions','500-transactions','archivist','balance-guardian','complete-profile','diversified','ahead-of-time','cleared-month'].map((s, i) => (
              <div key={`a3-${i}`} className="shrink-0 size-32 sm:size-36 rounded-2xl overflow-hidden">
                <Image src={`/achievements/${s}.png`} alt="" width={144} height={144} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Dark overlay */}
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(8,14,29,0.5)' }} />
        {/* Center spotlight for text readability */}
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at center, rgba(8,14,29,0.85) 0%, rgba(8,14,29,0.3) 60%, transparent 100%)' }} />
        {/* Side fades */}
        <div aria-hidden className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--color-ink-900), transparent)' }} />
        <div aria-hidden className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--color-ink-900), transparent)' }} />

        {/* Text content centered */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-24 sm:py-28">
          <FadeIn>
            <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/25 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full mb-5 uppercase tracking-wider backdrop-blur-sm">
              <Trophy className="size-3" />
              Gamificação
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h2 className="text-3xl sm:text-5xl font-bold text-white max-w-lg leading-tight">
              61 conquistas para desbloquear
            </h2>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="mt-4 text-slate-300 text-lg max-w-md leading-relaxed">
              Organize suas finanças e ganhe badges exclusivos. Cada marco financeiro te dá uma conquista com o Rookinho.
            </p>
          </FadeIn>
          <FadeIn delay={300}>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-ink-900 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 mt-8"
            >
              Começar a colecionar
              <Trophy className="size-4" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ── Why Rook ────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-ink-800/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Rookinho thumbs up */}
            <FadeIn from="left" className="shrink-0">
              <div className="relative w-48 sm:w-56 lg:w-64">
                <div
                  aria-hidden
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-12 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.3) 0%, transparent 70%)', filter: 'blur(14px)' }}
                />
                <Image
                  src="/rookinho/rookinho-thumbsup.png"
                  alt="Rookinho aprovando"
                  width={280}
                  height={340}
                  className="object-contain w-full h-auto drop-shadow-xl"
                />
              </div>
            </FadeIn>

            {/* Cards */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
              {[
                {
                  icon: Shield,
                  title: 'Seus dados são seus',
                  desc:  'Protegidos com criptografia TLS 256. Conformidade LGPD. Nunca compartilhamos suas informações.',
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
                  <div className="flex flex-col items-center md:items-start gap-4">
                    <div style={{ fontSize: 18 }}>
                      <GlassIcon icon={<Icon size={24} />} color="blue" as="div" />
                    </div>
                    <h3 className="font-semibold text-slate-100">{title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WhatsApp Rookinho IA ────────────────────────────────────── */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Left: WhatsApp chat simulation */}
            <FadeIn from="left" className="shrink-0">
              <WhatsAppChat />
            </FadeIn>

            {/* Right: explanation */}
            <div className="flex flex-col gap-5 text-center lg:text-left flex-1 min-w-0">
              <FadeIn>
                <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                  <MessageCircle className="size-3" />
                  WhatsApp
                </div>
              </FadeIn>

              <FadeIn delay={100}>
                <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                  Rookinho IA direto<br />
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)' }}>
                    no seu WhatsApp
                  </span>
                </h2>
              </FadeIn>

              <FadeIn delay={200}>
                <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                  Converse com o Rookinho pelo WhatsApp como se fosse um amigo. Consulte seus gastos, registre transações e receba análises financeiras — tudo por mensagem de texto, sem abrir o app.
                </p>
              </FadeIn>

              <FadeIn delay={300}>
                <div className="flex flex-col gap-4 mt-2">
                  {[
                    { icon: MessageCircle, text: 'Pergunte qualquer coisa sobre suas finanças', color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/20' },
                    { icon: Send, text: 'Registre gastos e rendas por mensagem', color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/20' },
                    { icon: Bot, text: 'IA que entende contexto e dá conselhos reais', color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/20' },
                    { icon: Clock, text: 'Disponível 24h — responde na hora', color: 'text-green-400', bg: 'bg-green-500/15 border-green-500/20' },
                  ].map(({ icon: Icon, text, color, bg }) => (
                    <div key={text} className="flex items-center gap-3">
                      <div className={`size-9 rounded-lg ${bg} border flex items-center justify-center shrink-0`}>
                        <Icon className={`size-4 ${color}`} />
                      </div>
                      <span className="text-sm text-slate-300">{text}</span>
                    </div>
                  ))}
                </div>
              </FadeIn>

              <FadeIn delay={400}>
                <div className="mt-4 flex flex-col sm:flex-row items-center lg:items-start gap-3">
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-green-600/30"
                    style={{ background: 'linear-gradient(135deg, #25d366 0%, #128c7e 100%)' }}
                  >
                    <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Experimentar no WhatsApp
                  </Link>
                  <span className="text-xs text-slate-600">Exclusivo para assinantes PRO+</span>
                </div>
              </FadeIn>
            </div>

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
      <section className="relative overflow-hidden" style={{ minHeight: 480 }}>
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
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-24 gap-7">
          <FadeIn>
            <div className="relative w-32 sm:w-40 mb-2">
              <Image
                src="/rookinho/rookinho-phone.png"
                alt="Rookinho com o app"
                width={180}
                height={200}
                className="object-contain w-full h-auto drop-shadow-2xl"
              />
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-100 max-w-xl leading-tight">
              {t('cta.title').split('\n').map((line, i) => <span key={i}>{line}{i === 0 ? <br /> : ''}</span>)}
            </h2>
          </FadeIn>
          <FadeIn delay={200}>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              {t('cta.description')}
            </p>
          </FadeIn>
          <FadeIn delay={300}>
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
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
          <Link href="/" className="relative h-7 w-28 shrink-0">
            <Image src="/SVG/logo branco.svg" alt="Rook Money" fill className="object-contain opacity-60" />
          </Link>
          <nav className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
            <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              Blog
            </Link>
            <Link href="/help" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
              {t('nav.support')}
            </Link>
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
          <p className="text-xs text-slate-600 text-center">
            &copy; {new Date().getFullYear()} Rook Money · {t('footer.rights')}
          </p>
        </div>
      </footer>

    </div>
  )
}
