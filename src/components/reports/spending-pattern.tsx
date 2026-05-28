'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import type { SpendingDay as DaySpending } from '@/lib/api-client'

function formatBRL(value: number) {
  if (value >= 1000) return `R$${(value / 1000).toFixed(1)}k`
  return `R$${value.toFixed(0)}`
}

type CustomTooltipProps = {
  active?:  boolean
  payload?: { value: number; payload: DaySpending }[]
  label?:   number
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length || !payload[0].value) return null
  return (
    <div className="bg-ink-800 border border-white/10 rounded-xl p-3 shadow-xl text-xs min-w-[130px]">
      <p className="text-slate-400 mb-1.5">Dia {label}</p>
      <div className="flex justify-between gap-4">
        <span className="text-slate-500">Gasto</span>
        <span className="font-semibold text-danger tabular-nums">
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}
        </span>
      </div>
      <div className="flex justify-between gap-4 mt-0.5">
        <span className="text-slate-500">Transações</span>
        <span className="font-semibold text-slate-300">{payload[0].payload.count}</span>
      </div>
    </div>
  )
}

export function SpendingPattern({ data }: { data: DaySpending[] }) {
  const maxTotal = Math.max(...data.map(d => d.total), 1)
  const hasData  = data.some(d => d.total > 0)

  if (!hasData) {
    return <p className="text-sm text-slate-600 py-4 text-center">Sem dados de despesas.</p>
  }

  // Only show days 1–28 for cleaner display; 29–31 optional
  const chartData = data.filter(d => d.day <= 31)

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="15%">
        <XAxis
          dataKey="day"
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={4}
          dy={4}
        />
        <YAxis
          tickFormatter={formatBRL}
          tick={{ fill: '#64748b', fontSize: 9 }}
          axisLine={false}
          tickLine={false}
          width={42}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
        <Bar dataKey="total" radius={[3, 3, 0, 0]} maxBarSize={18}>
          {chartData.map((entry) => (
            <Cell
              key={entry.day}
              fill={entry.total >= maxTotal * 0.7 ? '#ef4444' : entry.total >= maxTotal * 0.4 ? '#f97316' : '#6366f1'}
              fillOpacity={entry.total > 0 ? 0.8 : 0.15}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
