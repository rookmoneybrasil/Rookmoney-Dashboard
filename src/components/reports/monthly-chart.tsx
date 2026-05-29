'use client'

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

type MonthlyDataPoint = {
  month?:       string
  monthKey?:    string
  monthFull?:   string
  totalIncome:  number
  totalExpense: number
  balance:      number
  savingsRate:  number
}

interface MonthlyChartProps {
  data: MonthlyDataPoint[]
}

function formatBRL(value: number): string {
  if (Math.abs(value) >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

type TooltipPayloadEntry = {
  name:  string
  value: number
  color: string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload?.length) return null

  const labels: Record<string, string> = {
    totalIncome:  'Receitas',
    totalExpense: 'Despesas',
    balance:      'Saldo',
    savingsRate:  'Poupança',
  }

  return (
    <div className="bg-ink-800 border border-white/10 rounded-xl p-3 shadow-xl text-xs min-w-[160px]">
      <p className="text-slate-400 font-medium mb-2 capitalize">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-400">{labels[entry.name] ?? entry.name}</span>
          </div>
          <span className="font-semibold text-slate-200 tabular-nums">
            {entry.name === 'savingsRate' ? `${entry.value}%` : formatBRL(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  if (!data.length) {
    return <p className="text-sm text-slate-600 py-4 text-center">Sem dados ainda.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="monthFull"
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          dy={6}
          tickFormatter={(v: string) => v?.slice(0, 3) ?? ''}
        />
        {/* Left axis: BRL values */}
        <YAxis
          yAxisId="brl"
          tickFormatter={formatBRL}
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={62}
        />
        {/* Right axis: % savings rate */}
        <YAxis
          yAxisId="pct"
          orientation="right"
          tickFormatter={(v) => `${v}%`}
          tick={{ fill: '#64748b', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          width={36}
          domain={[-100, 100]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
        <Legend
          iconType="circle"
          iconSize={7}
          formatter={(value: string) => {
            const map: Record<string, string> = {
              totalIncome:  'Receitas',
              totalExpense: 'Despesas',
              balance:      'Saldo',
              savingsRate:  '% Poupança',
            }
            return <span style={{ color: '#94a3b8', fontSize: 11 }}>{map[value] ?? value}</span>
          }}
          wrapperStyle={{ paddingTop: 12 }}
        />
        <Bar yAxisId="brl" dataKey="totalIncome"  name="totalIncome"  fill="#22c55e" radius={[4,4,0,0]} maxBarSize={28} />
        <Bar yAxisId="brl" dataKey="totalExpense" name="totalExpense" fill="#ef4444" radius={[4,4,0,0]} maxBarSize={28} />
        <Line
          yAxisId="brl"
          dataKey="balance"
          name="balance"
          type="monotone"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
          activeDot={{ r: 5, fill: '#818cf8', strokeWidth: 0 }}
        />
        <Line
          yAxisId="pct"
          dataKey="savingsRate"
          name="savingsRate"
          type="monotone"
          stroke="#f59e0b"
          strokeWidth={1.5}
          strokeDasharray="4 3"
          dot={{ fill: '#f59e0b', r: 2.5, strokeWidth: 0 }}
          activeDot={{ r: 4, fill: '#fbbf24', strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
