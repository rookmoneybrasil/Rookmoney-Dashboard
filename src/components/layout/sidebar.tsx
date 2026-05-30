'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Tag,
  PiggyBank,
  Banknote,
  RefreshCw,
  Upload,
  Users,
  CalendarDays,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { WithTooltip } from '@/components/ui/tooltip'
import { ProBadge } from '@/components/ui/pro-badge'
import { logout } from '@/app/actions/auth'

// ─── Glass nav icon — inline styles, zero CSS-class dependency ───────────────

const GLASS_GRADIENTS: Record<string, string> = {
  blue:   'linear-gradient(hsl(223,90%,50%),hsl(208,90%,50%))',
  purple: 'linear-gradient(hsl(283,90%,50%),hsl(268,90%,50%))',
  red:    'linear-gradient(hsl(3,90%,50%),hsl(348,90%,50%))',
  indigo: 'linear-gradient(hsl(253,90%,50%),hsl(238,90%,50%))',
  orange: 'linear-gradient(hsl(43,90%,50%),hsl(28,90%,50%))',
  green:  'linear-gradient(hsl(123,90%,40%),hsl(108,90%,40%))',
  amber:  'linear-gradient(hsl(43,90%,50%),hsl(33,90%,45%))',
  cyan:   'linear-gradient(hsl(188,90%,40%),hsl(200,90%,40%))',
  slate:  'linear-gradient(hsl(215,20%,30%),hsl(215,20%,22%))',
}

function GlassNavIcon({ icon, color = 'slate', active = false, size = 40 }: { icon: React.ReactNode; color?: string; active?: boolean; size?: number }) {
  const bg = GLASS_GRADIENTS[active ? 'blue' : color] ?? GLASS_GRADIENTS.slate
  const SZ = size
  const R  = Math.round(SZ * 0.25)

  return (
    <div style={{ position: 'relative', width: SZ, height: SZ, perspective: 200, cursor: 'pointer' }}
         className="glass-nav-btn group/gnb">
      {/* Colored tilted back layer */}
      <span style={{
        position: 'absolute', inset: 0,
        borderRadius: R,
        background: bg,
        transform: 'rotate(15deg)',
        transformOrigin: '100% 100%',
        boxShadow: '3px -3px 6px hsla(223,10%,5%,0.25)',
        transition: 'transform 0.3s cubic-bezier(0.83,0,0.17,1)',
      }} className="gi-back" />
      {/* Frosted glass front layer */}
      <span style={{
        position: 'absolute', inset: 0,
        borderRadius: R,
        backgroundColor: 'hsla(0,0%,100%,0.10)',
        boxShadow: '0 0 0 1px hsla(0,0%,100%,0.20) inset',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? '#fff' : 'hsla(0,0%,100%,0.65)',
        transition: 'transform 0.3s cubic-bezier(0.83,0,0.17,1)',
      }} className="gi-front">
        {icon}
      </span>
    </div>
  )
}

const navItems = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',    color: 'blue',   desc: 'Visão geral do seu financeiro — saldo, metas e projeções',   pro: false },
  { href: '/projection',   icon: TrendingUp,      label: 'Projeção',     color: 'green',  desc: 'Veja quanto vai ganhar, pagar e sobrar nos próximos meses',   pro: true  },
  { href: '/transactions', icon: ArrowLeftRight,  label: 'Transações',   color: 'purple', desc: 'Histórico completo de todas as entradas e saídas',           pro: false },
  { href: '/income',       icon: Banknote,        label: 'Rendas',       color: 'green',  desc: 'Gerencie suas fontes de renda recorrentes e avulsas',        pro: false },
  { href: '/goals',        icon: Target,          label: 'Metas',        color: 'orange', desc: 'Acompanhe o progresso das suas metas financeiras',           pro: false },
  { href: '/bills',        icon: FileText,        label: 'Contas',       color: 'red',    desc: 'Contas a pagar, parcelas e próximos vencimentos',            pro: false },
  { href: '/budget',       icon: PiggyBank,       label: 'Orçamento',    color: 'cyan',   desc: 'Defina limites de gasto por categoria ao mês',               pro: true  },
  { href: '/people',       icon: Users,           label: 'Pessoas',      color: 'amber',  desc: 'Controle dívidas, acertos e parcelamentos com pessoas',      pro: false },
  { href: '/categories',   icon: Tag,             label: 'Categorias',   color: 'indigo', desc: 'Crie e organize as categorias das suas transações',          pro: false },
  { href: '/calendar',     icon: CalendarDays,    label: 'Calendário',   color: 'blue',   desc: 'Visualize contas, rendas e recorrências por dia no mês',     pro: false },
  { href: '/reports',      icon: BarChart3,       label: 'Relatórios',   color: 'purple', desc: 'Análises, gráficos e insights sobre seus gastos',            pro: true  },
  { href: '/import',       icon: Upload,          label: 'Importar',     color: 'green',  desc: 'Importe extratos bancários em CSV ou OFX',                   pro: true  },
]

interface SidebarProps {
  user?:     { name: string; email: string }
  collapsed?: boolean
  onToggle?:  () => void
  badges?:    Record<string, number>
  plan?:      string
}

export function Sidebar({ user, collapsed = false, onToggle, badges = {}, plan }: SidebarProps) {
  const pathname = usePathname()
  const isPro    = plan === 'PRO'

  return (
    <aside
      className={cn(
        'flex flex-col bg-ink-800 border-r border-white/6 transition-all duration-300 h-full',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-4 border-b border-white/6', collapsed && 'justify-center px-0')}>
        {collapsed ? (
          <div className="size-8 relative shrink-0">
            <Image src="/SVG/FAVICON.svg" alt="Rook" fill className="object-contain" />
          </div>
        ) : (
          <div className="h-8 relative" style={{ width: 120 }}>
            <Image src="/SVG/logo branco.svg" alt="Rook Money" fill className="object-contain object-left" />
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={cn('flex-1 py-4 flex flex-col', collapsed ? 'overflow-visible gap-3 px-1 items-center' : 'overflow-y-auto gap-1 px-2')}>
        {navItems.map(({ href, icon: Icon, label, color, desc, pro }) => {
          const isActive  = pathname === href || pathname.startsWith(href + '/')
          const count     = badges[href] ?? 0
          const showBadge = pro && !isPro

          const tooltipContent = (
            <div className="flex flex-col gap-0.5 max-w-[200px]">
              <span className="font-semibold text-slate-100">{label}{count > 0 && ` · ${count} pendente${count > 1 ? 's' : ''}`}</span>
              <span className="text-slate-400 font-normal text-[11px] leading-snug">{desc}</span>
            </div>
          )

          const item = collapsed ? (
            /* ── Collapsed: glass icon ── */
            <Link key={href} href={href} className="relative flex justify-center">
              <GlassNavIcon icon={<Icon size={16} />} color="slate" active={isActive} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-amber-500 text-[9px] font-bold text-ink-900 flex items-center justify-center px-0.5 leading-none z-10">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </Link>
          ) : (
            /* ── Expanded: glass icon + label ── */
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-800/60 text-brand-300 border border-brand-700/40'
                  : 'text-slate-500 hover:bg-ink-700/60 hover:text-slate-300',
              )}
            >
              <GlassNavIcon icon={<Icon size={13} />} color="slate" active={isActive} size={32} />
              <span className="flex-1">{label}</span>
              {showBadge && <ProBadge />}
              {count > 0 && !showBadge && (
                <span className="ml-auto min-w-[18px] h-[18px] rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center justify-center px-1 leading-none tabular-nums">
                  {count > 99 ? '99+' : count}
                </span>
              )}
              {count === 0 && !showBadge && isActive && (
                <span className="ml-auto size-1.5 rounded-full bg-brand-400" />
              )}
            </Link>
          )

          return (
            <WithTooltip key={href} content={tooltipContent} side="right" delayDuration={1500}>
              {item}
            </WithTooltip>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/6 p-2 flex flex-col gap-1">
        {/* Settings */}
        {collapsed ? (
          <WithTooltip content="Configurações" side="right">
            <Link href="/settings" className="flex justify-center">
              <GlassNavIcon icon={<Settings size={16} />} color="slate" active={pathname === '/settings'} />
            </Link>
          </WithTooltip>
        ) : (
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-ink-700 hover:text-slate-300 transition-colors',
              pathname === '/settings' && 'bg-brand-800 text-brand-300 border border-brand-700/50'
            )}
          >
            <Settings className="size-4 shrink-0" />
            <span>Configurações</span>
          </Link>
        )}

        {/* User */}
        {user && (
          <div className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 mt-1', collapsed && 'justify-center px-0')}>
            <Avatar name={user.name} size="sm" />
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-slate-300 truncate">{user.name}</span>
                <span className="text-xs text-slate-600 truncate">{user.email}</span>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => logout()}
                className="text-slate-600 hover:text-slate-400 transition-colors p-1 rounded"
                title="Sair"
              >
                <LogOut className="size-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        {onToggle && (
          <button
            onClick={onToggle}
            className={cn(
              'flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-ink-700 transition-colors mt-1',
              collapsed ? 'size-10 mx-auto' : 'h-8 w-full gap-2 px-3 text-xs'
            )}
          >
            {collapsed ? <ChevronRight className="size-4" /> : (
              <>
                <ChevronLeft className="size-3.5" />
                <span>Recolher</span>
              </>
            )}
          </button>
        )}
      </div>
    </aside>
  )
}
