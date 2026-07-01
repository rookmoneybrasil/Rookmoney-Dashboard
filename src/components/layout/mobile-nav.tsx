'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, ArrowLeftRight, FileText, Banknote,
  Target, PiggyBank, BarChart3, Tag, Settings, LogOut,
  X, Menu, Upload, Users, CalendarDays, TrendingUp, Trophy,
  Sparkles,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { useTranslations } from 'next-intl'

interface MobileNavProps {
  badges?: Record<string, number>
}

function BadgeCount({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] rounded-full bg-amber-500 text-[9px] font-bold text-slate-900 flex items-center justify-center px-0.5 leading-none">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function MobileNav({ badges = {} }: MobileNavProps) {
  const pathname  = usePathname()
  const [open, setOpen] = useState(false)
  const t    = useTranslations('nav.items')
  const tAuth = useTranslations('auth.login')

  const PRIMARY_NAV = [
    { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { href: '/income',    icon: Banknote,        label: t('income')    },
    { href: '/bills',     icon: FileText,        label: t('bills')     },
    { href: '/people',    icon: Users,           label: t('people')    },
  ]

  const MORE_NAV = [
    { href: '/transactions',  icon: ArrowLeftRight, label: t('transactions')  },
    { href: '/goals',         icon: Target,         label: t('goals')         },
    { href: '/budget',        icon: PiggyBank,      label: t('budget')        },
    { href: '/calendar',      icon: CalendarDays,   label: t('calendar')      },
    { href: '/projection',    icon: TrendingUp,     label: t('projection')    },
    { href: '/reports',       icon: BarChart3,      label: t('reports')       },
    { href: '/achievements',  icon: Trophy,         label: t('achievements')  },
    { href: '/import',        icon: Upload,         label: t('import')        },
    { href: '/categories',    icon: Tag,            label: t('categories')    },
    { href: '/settings',      icon: Settings,       label: t('settings')      },
  ]

  const isMoreActive   = MORE_NAV.some((n) => pathname.startsWith(n.href))
  const moreBadgeTotal = MORE_NAV.reduce((s, n) => s + (badges[n.href] ?? 0), 0)

  return (
    <>
      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-ink-800/95 backdrop-blur-md border-t border-white/6 flex items-stretch safe-area-inset-bottom">
        {PRIMARY_NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const count  = badges[href] ?? 0
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center flex-1 py-2 gap-1 transition-colors ${
                active ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="relative">
                <Icon className="size-5" />
                <BadgeCount count={count} />
              </span>
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </Link>
          )
        })}

        {/* More button */}
        <button
          onClick={() => setOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 py-2 gap-1 transition-colors ${
            isMoreActive ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="relative">
            <Menu className="size-5" />
            {moreBadgeTotal > 0 && <BadgeCount count={moreBadgeTotal} />}
          </span>
          <span className="text-[10px] font-medium leading-none">···</span>
        </button>
      </nav>

      {/* Drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-ink-800 rounded-t-2xl border-t border-white/6 p-4 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-ink-500 mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <div className="h-7 w-24 relative">
                <Image src="/SVG/logo branco.svg" alt="Rook Money" fill className="object-contain object-left" />
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 p-1">
                <X className="size-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {MORE_NAV.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                const count  = badges[href] ?? 0
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl transition-colors ${
                      active
                        ? 'bg-brand-800 text-brand-300 border border-brand-700/50'
                        : 'bg-ink-700 text-slate-400 hover:bg-ink-600 hover:text-slate-200'
                    }`}
                  >
                    <span className="relative">
                      <Icon className="size-5" />
                      {count > 0 && (
                        <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px] rounded-full bg-amber-500 text-[9px] font-bold text-slate-900 flex items-center justify-center px-0.5 leading-none">
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-medium leading-none text-center">{label}</span>
                  </Link>
                )
              })}

              {/* Rookinho IA */}
              <Link
                href="/chat"
                onClick={() => setOpen(false)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-brand-900/40 text-brand-300 border border-brand-700/40 hover:bg-brand-800/60 transition-colors"
              >
                <Sparkles className="size-5" />
                <span className="text-xs font-medium leading-none">Rookinho IA</span>
              </Link>

              {/* Logout */}
              <button
                onClick={() => logout()}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-ink-700 text-slate-400 hover:bg-danger/10 hover:text-danger transition-colors"
              >
                <LogOut className="size-5" />
                <span className="text-xs font-medium leading-none">{tAuth('submit')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
