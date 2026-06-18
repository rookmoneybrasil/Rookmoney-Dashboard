import { Trophy } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { serverApi, type AchievementCategory } from '@/lib/api-client'
import { getTranslations } from 'next-intl/server'
import { AchievementsGrid } from '@/components/achievements/achievements-grid'

const CATEGORY_ORDER: AchievementCategory[] = [
  'onboarding', 'organization', 'payments', 'goals', 'volume', 'financial',
]

export default async function AchievementsPage() {
  const [data, t] = await Promise.all([
    serverApi.achievements(),
    getTranslations('achievements'),
  ])

  const { achievements, total, done } = data
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const grouped = CATEGORY_ORDER.map(cat => ({
    category: cat,
    items: achievements.filter(a => a.category === cat),
  })).filter(g => g.items.length > 0)

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">{t('title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {done} {t('of')} {total} {t('unlocked')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-amber-400">{pct}%</p>
            <p className="text-[10px] text-slate-600 uppercase tracking-wider">{t('progress')}</p>
          </div>
          <div className="size-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Trophy className="size-6 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">{t('progressLabel')}</span>
              <span className="text-amber-400 font-semibold">{done}/{total}</span>
            </div>
            <Progress value={pct} className="h-2.5" />
          </div>
        </div>
      </Card>

      {/* Achievement grid by category */}
      <AchievementsGrid grouped={grouped} />
    </div>
  )
}
