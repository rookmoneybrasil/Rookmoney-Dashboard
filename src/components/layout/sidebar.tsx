'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Target,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Tag,
  PiggyBank,
  Banknote,
  Upload,
  Users,
  CalendarDays,
  TrendingUp,
  Crown,
  LifeBuoy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WithTooltip } from '@/components/ui/tooltip'
import { ProBadge } from '@/components/ui/pro-badge'

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

// Nav config without labels — labels injected from translations at render time
const NAV_GROUPS = [
  {
    groupKey: 'overview',
    items: [
      { href: '/dashboard',  icon: LayoutDashboard, itemKey: 'dashboard',  color: 'blue',   pro: false },
      { href: '/calendar',   icon: CalendarDays,    itemKey: 'calendar',   color: 'cyan',   pro: false },
      { href: '/projection', icon: TrendingUp,      itemKey: 'projection', color: 'green',  pro: true  },
    ],
  },
  {
    groupKey: 'money',
    items: [
      { href: '/income',  icon: Banknote, itemKey: 'income',  color: 'green', pro: false },
      { href: '/bills',   icon: FileText, itemKey: 'bills',   color: 'red',   pro: false },
      { href: '/people',  icon: Users,    itemKey: 'people',  color: 'amber', pro: false },
    ],
  },
  {
    groupKey: 'planning',
    items: [
      { href: '/goals',  icon: Target,   itemKey: 'goals',  color: 'orange', pro: false },
      { href: '/budget', icon: PiggyBank,itemKey: 'budget', color: 'cyan',   pro: true  },
    ],
  },
  {
    groupKey: 'analysis',
    items: [
      { href: '/reports', icon: BarChart3, itemKey: 'reports', color: 'purple', pro: true },
    ],
  },
  {
    groupKey: 'organization',
    items: [
      { href: '/categories', icon: Tag,    itemKey: 'categories', color: 'indigo', pro: false },
      { href: '/import',     icon: Upload, itemKey: 'import',     color: 'green',  pro: true  },
    ],
  },
  {
    groupKey: 'help',
    items: [
      { href: '/billing', icon: Crown,    itemKey: 'billing', color: 'amber', pro: false },
      { href: '/support', icon: LifeBuoy, itemKey: 'support', color: 'blue',  pro: false },
    ],
  },
]

interface SidebarProps {
  user?:     { name: string; email: string; image?: string }
  collapsed?: boolean
  onToggle?:  () => void
  badges?:    Record<string, number>
  plan?:      string
}

export function Sidebar({ user, collapsed = false, onToggle, badges = {}, plan }: SidebarProps) {
  const pathname = usePathname()
  const isPro    = plan === 'PRO'
  const t        = useTranslations('nav')

  // Build translated nav groups
  const navGroups = NAV_GROUPS.map(g => ({
    label: t(`groups.${g.groupKey}`),
    items: g.items.map(item => ({
      href:  item.href,
      icon:  item.icon,
      label: t(`items.${item.itemKey}`),
      desc:  t(`desc.${item.itemKey}`),
      color: item.color,
      pro:   item.pro,
    })),
  }))
  const navItems = navGroups.flatMap(g => g.items)

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
      <nav className={cn('flex-1 py-3 flex flex-col', collapsed ? 'overflow-visible gap-3 px-1 items-center' : 'overflow-y-auto px-2')}>
        {collapsed ? (
          // Collapsed: flat list com ícones
          <div className="flex flex-col gap-3">
            {navItems.map(({ href, icon: Icon, label, desc, pro }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              const count    = badges[href] ?? 0
              return (
                <WithTooltip key={href} content={
                  <div className="flex flex-col gap-0.5 max-w-[200px]">
                    <span className="font-semibold text-slate-100">{label}{pro && !isPro ? ' · PRO' : count > 0 ? ` · ${count}` : ''}</span>
                    <span className="text-slate-400 font-normal text-[11px] leading-snug">{desc}</span>
                  </div>
                } side="right" delayDuration={1500}>
                  <Link href={href} className="relative flex justify-center">
                    <GlassNavIcon icon={<Icon size={16} />} color="slate" active={isActive} />
                    {count > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full bg-brand-500 text-[9px] font-bold text-white flex items-center justify-center px-0.5 leading-none z-10">
                        {count > 99 ? '99+' : count}
                      </span>
                    )}
                  </Link>
                </WithTooltip>
              )
            })}
          </div>
        ) : (
          // Expanded: grupos com labels
          <div className="flex flex-col gap-4 py-1">
            {navGroups.map((group, gi) => (
              <div key={group.label}>
                <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-wider px-2 mb-1">{group.label}</p>
                <div className="flex flex-col gap-0.5">
                  {group.items.map(({ href, icon: Icon, label, desc, pro }) => {
                    const isActive  = pathname === href || pathname.startsWith(href + '/')
                    const count     = badges[href] ?? 0
                    const showBadge = pro && !isPro

                    return (
                      <WithTooltip key={href} content={
                        <div className="flex flex-col gap-0.5 max-w-[200px]">
                          <span className="font-semibold text-slate-100">{label}</span>
                          <span className="text-slate-400 font-normal text-[11px] leading-snug">{desc}</span>
                        </div>
                      } side="right" delayDuration={1500}>
                        <Link
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
                            <span className="min-w-[18px] h-[18px] rounded-full bg-brand-600/30 text-brand-300 border border-brand-600/30 text-[10px] font-bold flex items-center justify-center px-1 leading-none tabular-nums">
                              {count > 99 ? '99+' : count}
                            </span>
                          )}
                          {count === 0 && !showBadge && isActive && (
                            <span className="size-1.5 rounded-full bg-brand-400" />
                          )}
                        </Link>
                      </WithTooltip>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/6 p-2 flex flex-col gap-1">
        {/* Billing / upgrade */}
        {!isPro && (
          collapsed ? (
            <WithTooltip content="Assinar PRO" side="right">
              <Link href="/billing" className="flex justify-center">
                <GlassNavIcon icon={<Crown size={16} />} color="amber" active={pathname === '/billing'} />
              </Link>
            </WithTooltip>
          ) : (
            <Link
              href="/billing"
              className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-medium bg-amber-400/8 border border-amber-400/20 text-amber-400 hover:bg-amber-400/15 transition-colors"
            >
              <Crown className="size-4 shrink-0 fill-amber-400/20" />
              <span className="flex-1">Assinar PRO</span>
              <span className="text-[10px] font-bold">R$19,90</span>
            </Link>
          )
        )}

        {/* Settings — only in collapsed mode (expanded is in header) */}
        {collapsed && (
          <WithTooltip content="Configurações" side="right">
            <Link href="/settings" className="flex justify-center">
              <GlassNavIcon icon={<Settings size={16} />} color="slate" active={pathname === '/settings'} />
            </Link>
          </WithTooltip>
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
