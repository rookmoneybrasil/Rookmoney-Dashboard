'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Receipt, Target, PieChart } from 'lucide-react'
import type { AppNotification } from '@/lib/api-client'

interface Props {
  notifications: AppNotification[]
}

const typeIcon: Record<AppNotification['type'], React.ReactNode> = {
  bill:   <Receipt className="size-4 shrink-0 text-warning" />,
  goal:   <Target  className="size-4 shrink-0 text-brand-400" />,
  budget: <PieChart className="size-4 shrink-0 text-danger" />,
}

export function NotificationBell({ notifications }: Props) {
  const [open, setOpen]       = useState(false)
  const containerRef          = useRef<HTMLDivElement>(null)
  const count                 = notifications.length
  const countLabel            = count > 9 ? '9+' : String(count)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notificações${count > 0 ? ` — ${count} nova${count > 1 ? 's' : ''}` : ''}`}
        className="relative flex items-center justify-center size-9 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors"
      >
        <Bell className="size-4" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 size-4 rounded-full bg-danger text-white text-[10px] flex items-center justify-center font-semibold leading-none">
            {countLabel}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-ink-700 border border-white/8 shadow-[0_8px_32px_rgba(3,7,16,0.7)] z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Notificações
            </p>
          </div>

          {/* Items */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500">
                Nenhuma notificação no momento 🎉
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={n.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-ink-600 transition-colors"
                    >
                      <span className="mt-0.5">{typeIcon[n.type]}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {n.message}
                        </p>
                      </div>
                      {n.urgency === 'high' && (
                        <span className="mt-1 size-1.5 rounded-full bg-danger shrink-0" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
