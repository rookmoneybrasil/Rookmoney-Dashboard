'use client'

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts'

type CategoryDataPoint = {
  name: string
  total: number
  color: string
  pct: number
}

interface CategoryChartProps {
  data: CategoryDataPoint[]
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

type TooltipPayloadEntry = {
  name: string
  value: number
  payload: CategoryDataPoint
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: TooltipPayloadEntry[]
}) {
  if (!active || !payload?.length) return null
  const entry = payload[0]

  return (
    <div className="bg-ink-800 border border-white/10 rounded-xl p-3 shadow-xl text-xs min-w-[160px]">
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className="size-2.5 rounded-full shrink-0"
          style={{ backgroundColor: entry.payload.color }}
        />
        <span className="text-slate-300 font-medium">{entry.name}</span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500">Total</span>
        <span className="font-semibold text-slate-200 tabular-nums">{formatBRL(entry.value)}</span>
      </div>
      <div className="flex items-center justify-between gap-4 mt-0.5">
        <span className="text-slate-500">Participação</span>
        <span className="font-semibold tabular-nums" style={{ color: entry.payload.color }}>
          {entry.payload.pct}%
        </span>
      </div>
    </div>
  )
}

export function CategoryChart({ data }: CategoryChartProps) {
  if (!data.length) {
    return (
      <p className="text-sm text-slate-600 py-4 text-center">Sem despesas registradas.</p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
