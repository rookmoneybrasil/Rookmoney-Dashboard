'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { clientApi, type AchievementCheckResponse } from '@/lib/api-client'

interface ToastItem {
  slug: string
  icon: string
  id:   number
}

let nextId = 0

export function AchievementToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const router = useRouter()
  const t = useTranslations('achievements.items')

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const showToasts = useCallback((unlocked: AchievementCheckResponse['newlyUnlocked']) => {
    if (unlocked.length === 0) return
    const items = unlocked.map(u => ({ slug: u.slug, icon: u.icon, id: nextId++ }))
    setToasts(prev => [...prev, ...items])

    // Auto-dismiss after 6s
    for (const item of items) {
      setTimeout(() => dismiss(item.id), 6000)
    }
  }, [dismiss])

  // Check on mount (dashboard load)
  useEffect(() => {
    clientApi.checkAchievements('dashboard')
      .then(res => showToasts(res.newlyUnlocked))
      .catch(() => {})
  }, [showToasts])

  // Expose globally so API mutations can trigger checks
  useEffect(() => {
    ;(window as unknown as Record<string, unknown>).__achievementCheck = async (trigger: string, ctx?: Record<string, unknown>) => {
      try {
        const res = await clientApi.checkAchievements(trigger, ctx)
        showToasts(res.newlyUnlocked)
      } catch { /* ignore */ }
    }
    return () => { delete (window as unknown as Record<string, unknown>).__achievementCheck }
  }, [showToasts])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => {
        let name: string
        try {
          name = t(`${toast.slug}.name`)
        } catch {
          name = toast.slug
        }

        return (
          <button
            key={toast.id}
            onClick={() => {
              dismiss(toast.id)
              router.push('/achievements')
            }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-ink-800 border border-amber-400/30 shadow-[0_8px_32px_rgba(251,191,36,0.15)] animate-in slide-in-from-right-5 duration-300 cursor-pointer hover:border-amber-400/50 transition-colors group max-w-sm"
          >
            <img
              src={`/achievements/${toast.slug}.png`}
              alt=""
              className="size-10 rounded-lg shrink-0 object-contain"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                Conquista desbloqueada!
              </p>
              <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white">
                {name}
              </p>
            </div>
            <div className="text-xl shrink-0">🏆</div>
          </button>
        )
      })}
    </div>
  )
}

/** Call from any client component after a mutation */
export async function triggerAchievementCheck(trigger: string, ctx?: Record<string, unknown>) {
  const fn = (window as unknown as Record<string, unknown>).__achievementCheck as
    ((trigger: string, ctx?: Record<string, unknown>) => Promise<void>) | undefined
  if (fn) await fn(trigger, ctx)
}
