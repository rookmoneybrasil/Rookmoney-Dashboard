'use client'

import { useState, useRef, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Receipt, Target, PieChart, Users, TrendingUp, CheckCheck, Bird } from 'lucide-react'
import type { AppNotification } from '@/lib/api-client'
import { markNotificationsRead } from '@/app/actions/notifications'

interface Props {
  notifications: AppNotification[]
  newCount: number
}

const TYPE_CONFIG: Record<AppNotification['type'], { icon: React.ReactNode; color: string }> = {
  bill:     { icon: <Receipt    className="size-3.5" />, color: 'text-warning   bg-warning/10   border-warning/20'   },
  goal:     { icon: <Target     className="size-3.5" />, color: 'text-brand-400 bg-brand-400/10 border-brand-400/20' },
  budget:   { icon: <PieChart   className="size-3.5" />, color: 'text-danger    bg-danger/10    border-danger/20'    },
  person:   { icon: <Users      className="size-3.5" />, color: 'text-brand-400 bg-brand-400/10 border-brand-400/20' },
  income:   { icon: <TrendingUp className="size-3.5" />, color: 'text-success   bg-success/10   border-success/20'  },
  rookinho: { icon: <Bird       className="size-3.5" />, color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
}

const URGENCY_DOT: Record<AppNotification['urgency'], string> = {
  high:   'bg-danger',
  medium: 'bg-warning',
  low:    'bg-slate-500',
}

const GROUP_LABELS: Record<AppNotification['urgency'], string> = {
  high:   '🔴 Urgente',
  medium: '🟡 Atenção',
  low:    '🔵 Informativo',
}

export function NotificationBell({ notifications, newCount }: Props) {
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)
  const router          = useRouter()
  const [pending, startTransition] = useTransition()
  const count           = notifications.length
  const highCount       = notifications.filter(n => n.urgency === 'high').length

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleMarkRead() {
    startTransition(async () => {
      await markNotificationsRead()
      router.refresh()
    })
  }

  const groups = (['high', 'medium', 'low'] as const)
    .map(u => ({ urgency: u, items: notifications.filter(n => n.urgency === u) }))
    .filter(g => g.items.length > 0)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={`Notificações${newCount > 0 ? ` — ${newCount} nova${newCount > 1 ? 's' : ''}` : ''}`}
        className="relative flex items-center justify-center size-9 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors"
      >
        <Bell className={`size-4 ${open ? 'text-slate-300' : ''}`} />
        {newCount > 0 && (
          <span className={`absolute -top-1 -right-1 size-4 rounded-full text-white text-[10px] flex items-center justify-center font-semibold leading-none ${
            highCount > 0 ? 'bg-danger animate-pulse' : 'bg-warning'
          }`}>
            {newCount > 9 ? '9+' : newCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-88 rounded-xl bg-ink-800 border border-white/8 shadow-[0_8px_32px_rgba(3,7,16,0.8)] z-50 overflow-hidden animate-in slide-in-from-top-2 duration-150"
          style={{ width: '360px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/6">
            <div className="flex items-center gap-2">
              <Bell className="size-3.5 text-slate-500" />
              <p className="text-xs font-semibold text-slate-300">Notificações</p>
              {newCount > 0 && (
                <span className="text-[10px] bg-brand-600 text-white px-1.5 py-0.5 rounded-full">{newCount}</span>
              )}
            </div>
            {newCount > 0 && (
              <button
                onClick={handleMarkRead}
                disabled={pending}
                className="flex items-center gap-1 text-[10px] text-brand-400 hover:text-brand-300 transition-colors disabled:opacity-50"
              >
                <CheckCheck className="size-3" /> {pending ? '...' : 'marcar como lidas'}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[420px] overflow-y-auto">
            {count === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <div className="size-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCheck className="size-5 text-success" />
                </div>
                <p className="text-sm font-medium text-slate-400">Tudo em dia!</p>
                <p className="text-xs text-slate-600">Nenhuma notificação no momento.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {groups.map(({ urgency, items }) => (
                  <div key={urgency}>
                    <p className="px-4 py-2 text-[10px] font-semibold text-slate-600 uppercase tracking-wider bg-ink-900/40">
                      {GROUP_LABELS[urgency]}
                    </p>
                    {items.map(n => {
                      const cfg = TYPE_CONFIG[n.type]
                      return (
                        <Link
                          key={n.id}
                          href={n.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-ink-700/60 transition-colors group ${!n.isNew ? 'opacity-50' : ''}`}
                        >
                          <div className={`size-7 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${cfg.color}`}>
                            {cfg.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm text-slate-200 truncate group-hover:text-white ${n.isNew ? 'font-semibold' : 'font-normal'}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                          </div>
                          {n.isNew && <div className={`size-2 rounded-full mt-1.5 shrink-0 ${URGENCY_DOT[n.urgency]}`} />}
                        </Link>
                      )
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {count > 0 && (
            <div className="border-t border-white/6 px-4 py-2.5">
              <p className="text-[10px] text-slate-600 text-center">
                {newCount > 0 ? `${newCount} nova${newCount > 1 ? 's' : ''} · ` : ''}
                {count} notificação{count > 1 ? 'ões' : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
