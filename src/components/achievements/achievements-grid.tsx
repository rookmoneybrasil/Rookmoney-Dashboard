'use client'

import { useEffect } from 'react'
import { Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { clientApi, type AchievementItem, type AchievementCategory } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { WithTooltip } from '@/components/ui/tooltip'

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  onboarding:    'categoryOnboarding',
  organization:  'categoryOrganization',
  payments:      'categoryPayments',
  goals:         'categoryGoals',
  volume:        'categoryVolume',
  financial:     'categoryFinancial',
}

const CATEGORY_COLORS: Record<AchievementCategory, string> = {
  onboarding:    'border-brand-400/20',
  organization:  'border-indigo-400/20',
  payments:      'border-emerald-400/20',
  goals:         'border-amber-400/20',
  volume:        'border-cyan-400/20',
  financial:     'border-purple-400/20',
}

interface GroupedAchievements {
  category: AchievementCategory
  items: AchievementItem[]
}

export function AchievementsGrid({ grouped }: { grouped: GroupedAchievements[] }) {
  const t  = useTranslations('achievements')
  const ti = useTranslations('achievements.items')

  useEffect(() => {
    clientApi.markAchievementsSeen().catch(() => {})
  }, [])

  return (
    <div className="flex flex-col gap-8">
      {grouped.map(({ category, items }) => {
        const unlocked = items.filter(a => a.unlocked).length
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-slate-300">
                {t(CATEGORY_LABELS[category])}
              </h2>
              <span className="text-[10px] text-slate-600 bg-ink-700 px-1.5 py-0.5 rounded-full">
                {unlocked}/{items.length}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map(a => {
                let name: string
                let desc: string
                let tip: string
                try { name = ti(`${a.slug}.name`) } catch { name = a.slug }
                try { desc = ti(`${a.slug}.desc`) } catch { desc = '' }
                try { tip  = ti(`${a.slug}.tip`)  } catch { tip  = desc }

                return (
                  <WithTooltip
                    key={a.slug}
                    delayDuration={300}
                    content={
                      <div className="flex flex-col gap-1 max-w-[220px] py-0.5">
                        <div className="flex items-center gap-2">
                          <img src={`/achievements/${a.slug}.png`} alt="" className="size-6 rounded object-contain" />
                          <span className="font-semibold text-slate-100">{name}</span>
                        </div>
                        <p className="text-slate-400 leading-snug">{tip}</p>
                        {a.unlocked && a.unlockedAt && (
                          <p className="text-[10px] text-emerald-400 mt-0.5">
                            Desbloqueada em {new Date(a.unlockedAt).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                        {!a.unlocked && (
                          <p className="text-[10px] text-slate-600 mt-0.5">Ainda não desbloqueada</p>
                        )}
                      </div>
                    }
                  >
                    <div
                      className={cn(
                        'relative rounded-xl border p-4 transition-all duration-200 cursor-default',
                        a.unlocked
                          ? `bg-ink-800/80 ${CATEGORY_COLORS[a.category]} shadow-sm`
                          : 'bg-ink-900/60 border-white/4 opacity-50',
                        a.unlocked && !a.seen && 'ring-1 ring-amber-400/40 animate-pulse',
                      )}
                    >
                      <img
                        src={`/achievements/${a.slug}.png`}
                        alt=""
                        className={cn(
                          'size-12 mb-2 rounded-lg object-contain',
                          !a.unlocked && 'grayscale opacity-40',
                        )}
                      />

                      <p className={cn(
                        'text-sm font-medium truncate',
                        a.unlocked ? 'text-slate-200' : 'text-slate-600',
                      )}>
                        {name}
                      </p>

                      <p className={cn(
                        'text-[11px] leading-snug mt-0.5 line-clamp-2',
                        a.unlocked ? 'text-slate-500' : 'text-slate-700',
                      )}>
                        {desc}
                      </p>

                      {a.unlocked && a.unlockedAt && (
                        <p className="text-[10px] text-slate-600 mt-2">
                          {new Date(a.unlockedAt).toLocaleDateString('pt-BR')}
                        </p>
                      )}

                      {!a.unlocked && (
                        <div className="absolute top-3 right-3">
                          <Lock className="size-3.5 text-slate-700" />
                        </div>
                      )}
                    </div>
                  </WithTooltip>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
