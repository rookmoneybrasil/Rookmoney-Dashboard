'use client'

import { useDashboardTheme } from '@/components/layout/dashboard-shell'

interface Category { name: string; icon: string; color: string; amount: number; pct: number }

interface Props { categories: Category[]; total: number }

export function CategoryDonut({ categories, total }: Props) {
  const { theme } = useDashboardTheme()
  const trackColor = theme === 'light' ? '#E2E8F0' : '#1e293b'

  if (categories.length === 0 || total === 0) {
    return (
      <div className="bg-ink-800 border border-white/6 rounded-2xl p-4">
        <p className="text-sm font-medium text-slate-300 mb-3">Gastos por categoria</p>
        <p className="text-xs text-slate-600 text-center py-4">Nenhum gasto registrado ainda.</p>
      </div>
    )
  }

  // SVG donut params
  const R  = 36
  const r  = 24
  const cx = 44
  const cy = 44
  const circumference = 2 * Math.PI * R

  const top5 = categories.slice(0, 5)
  const slices = top5.map((cat, i) => {
    const cumulative = top5.slice(0, i).reduce((sum, c) => sum + c.pct, 0)
    const dashArray  = (cat.pct / 100) * circumference
    const dashOffset = circumference * (1 - cumulative / 100)
    return { ...cat, dashArray, dashOffset }
  })

  return (
    <div className="bg-ink-800 border border-white/6 rounded-2xl p-4 flex flex-col gap-3">
      <p className="text-sm font-medium text-slate-300">Gastos por categoria</p>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="shrink-0 relative">
          <svg width={88} height={88} viewBox="0 0 88 88">
            {/* Background ring */}
            <circle cx={cx} cy={cy} r={R} fill="none" stroke={trackColor} strokeWidth={R - r} />
            {/* Slices */}
            {slices.map((s, i) => (
              <circle
                key={i}
                cx={cx} cy={cy} r={R}
                fill="none"
                stroke={s.color}
                strokeWidth={R - r}
                strokeDasharray={`${s.dashArray} ${circumference - s.dashArray}`}
                strokeDashoffset={s.dashOffset}
                transform={`rotate(-90 ${cx} ${cy})`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            ))}
            {/* Center text */}
            <text x={cx} y={cy - 4} textAnchor="middle" className="fill-slate-400" fontSize={8} fontWeight={500}>Total</text>
            <text x={cx} y={cy + 8} textAnchor="middle" className="fill-slate-100" fontSize={9} fontWeight={700}>
              {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total.toFixed(0)}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 flex flex-col gap-1.5">
          {slices.map((cat, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-sm">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-400 truncate">{cat.name}</span>
                  <span className="text-[10px] text-slate-600 shrink-0">{cat.pct}%</span>
                </div>
                <div className="h-1 bg-ink-600 rounded-full overflow-hidden mt-0.5">
                  <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, backgroundColor: cat.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
