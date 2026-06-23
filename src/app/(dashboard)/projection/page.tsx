'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Sparkles, X, Receipt, RefreshCw, Users, Crown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'

const API = ''  // proxy route: /api/projection (same-origin)

type ProjectionItem = { id: string; label: string; amount: number; day: number; type: string; href: string; actual?: boolean; overdue?: boolean }
type ProjectionMonth = {
  month: string; label: string
  incomeItems: ProjectionItem[]; expenseItems: ProjectionItem[]
  totalIncome: number; totalExpense: number
  actualIncome: number; actualExpense: number
  pendingIncome: number; pendingExpense: number
  balance: number; actualBalance: number
  cumulativeBalance: number; actualCumulativeBalance: number
  isActual: boolean
}

function fmt(n: number)        { return formatCurrency(n) }
function fmtC(n: number)       { return formatCurrency(n, true) }

const TYPE_ICON: Record<string, React.ReactNode> = {
  income:    <TrendingUp  className="size-3.5 text-success shrink-0" />,
  bill:      <Receipt     className="size-3.5 text-danger shrink-0" />,
  recurring: <RefreshCw   className="size-3.5 text-warning shrink-0" />,
  person:    <Users       className="size-3.5 text-brand-400 shrink-0" />,
}

// ─── Month chip ───────────────────────────────────────────────────────────────
function MonthChip({ data, maxCum, minCum, selected, onClick }: {
  data: ProjectionMonth; maxCum: number; minCum: number
  selected: boolean; onClick: () => void
}) {
  const range      = Math.max(maxCum - minCum, 1)
  const normalized = (data.cumulativeBalance - minCum) / range
  const barH       = Math.round(4 + normalized * 68)
  const isPos      = data.cumulativeBalance >= 0

  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-150 min-w-[110px] ${
      selected
        ? 'bg-ink-700 border-brand-500 shadow-sm shadow-brand-900/50'
        : 'bg-ink-800 border-ink-700 hover:border-ink-500 hover:bg-ink-750'
    }`}>
      <div className="flex items-end justify-center h-[76px] w-full">
        <div className={`w-8 rounded-t-md transition-all duration-300 ${isPos ? 'bg-brand-600' : 'bg-danger/60'}`}
          style={{ height: barH }} />
      </div>
      <p className="text-xs font-medium text-slate-400 capitalize">{data.label.split(' ')[0]}</p>
      <p className={`text-sm font-bold tabular-nums ${isPos ? 'text-slate-100' : 'text-danger'}`}>
        {fmtC(data.cumulativeBalance)}
      </p>
      <p className={`text-xs tabular-nums ${data.balance >= 0 ? 'text-success' : 'text-danger'}`}>
        {data.balance >= 0 ? '↑' : '↓'}{fmtC(Math.abs(data.balance))}
      </p>
      {data.isActual && (
        <span className="text-[9px] bg-success/10 text-success px-1.5 py-0.5 rounded-full">real</span>
      )}
    </button>
  )
}

// ─── Detail panel ─────────────────────────────────────────────────────────────
function DetailPanel({ data, onClose }: { data: ProjectionMonth; onClose: () => void }) {
  const maxBar = Math.max(data.totalIncome, data.totalExpense, 1)
  const incPct = Math.round((data.totalIncome  / maxBar) * 100)
  const expPct = Math.round((data.totalExpense / maxBar) * 100)

  const hasPending = data.isActual && (data.pendingIncome > 0 || data.pendingExpense > 0)

  return (
    <div className="rounded-xl border border-ink-600 bg-ink-800 overflow-hidden animate-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-ink-700 flex-wrap gap-3">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-xs text-slate-500 capitalize">{data.label} · {hasPending ? 'Estimativa do mês' : 'Saldo acumulado'}</p>
            <p className={`text-2xl font-bold tabular-nums ${data.cumulativeBalance >= 0 ? 'text-success' : 'text-danger'}`}>
              {fmt(data.cumulativeBalance)}
            </p>
            {data.isActual && !hasPending && <span className="text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded-full">dados reais</span>}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpRight className="size-3.5 text-success" />
              <span className="text-slate-500">{data.isActual ? 'Entrou:' : 'Entra:'}</span>
              <span className="text-success font-semibold tabular-nums">+{fmt(data.totalIncome)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowDownRight className="size-3.5 text-danger" />
              <span className="text-slate-500">{data.isActual ? 'Saiu:' : 'Sai:'}</span>
              <span className="text-danger font-semibold tabular-nums">-{fmt(data.totalExpense)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs ml-5">
              <span className="text-slate-500">Resultado:</span>
              <span className={`font-semibold tabular-nums ${data.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                {data.balance >= 0 ? '+' : ''}{fmt(data.balance)}
              </span>
            </div>
          </div>
          {hasPending && (
            <div>
              <p className="text-xs text-slate-500">Saldo real até agora</p>
              <p className={`text-2xl font-bold tabular-nums ${data.actualCumulativeBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                {fmt(data.actualCumulativeBalance)}
              </p>
              <span className="text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded-full">dados reais</span>
            </div>
          )}
          {hasPending && (
            <div className="flex flex-col gap-1">
              {data.pendingIncome > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <ArrowUpRight className="size-3.5 text-success/60" />
                  <span className="text-slate-500">A receber:</span>
                  <span className="text-success/70 font-semibold tabular-nums">+{fmt(data.pendingIncome)}</span>
                </div>
              )}
              {data.pendingExpense > 0 && (
                <div className="flex items-center gap-1.5 text-xs">
                  <ArrowDownRight className="size-3.5 text-danger/60" />
                  <span className="text-slate-500">A pagar:</span>
                  <span className="text-danger/70 font-semibold tabular-nums">-{fmt(data.pendingExpense)}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <button onClick={onClose}
          className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors">
          <X className="size-4" />
        </button>
      </div>

      {/* Bars */}
      <div className="px-5 py-4 flex flex-col gap-2.5 border-b border-ink-700">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-16 text-right shrink-0">Receita</span>
          <div className="flex-1 h-4 bg-ink-700 rounded-full overflow-hidden">
            <div className="h-4 rounded-full bg-success/80 transition-all duration-500" style={{ width: `${incPct}%` }} />
          </div>
          <span className="text-sm font-semibold text-success tabular-nums w-28 text-right shrink-0">+{fmt(data.totalIncome)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-16 text-right shrink-0">Despesa</span>
          <div className="flex-1 h-4 bg-ink-700 rounded-full overflow-hidden">
            <div className="h-4 rounded-full bg-danger/80 transition-all duration-500" style={{ width: `${expPct}%` }} />
          </div>
          <span className="text-sm font-semibold text-danger tabular-nums w-28 text-right shrink-0">-{fmt(data.totalExpense)}</span>
        </div>
      </div>

      {/* Items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-ink-700">
        <div className="px-3 py-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3 flex items-center gap-1.5">
            <TrendingUp className="size-3 text-success" />
            Receitas — {fmt(data.totalIncome)}
          </p>
          {data.incomeItems.length === 0 ? (
            <p className="text-xs text-slate-600 px-3">Nenhuma receita</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {data.incomeItems.map((item) => (
                <Link key={item.id} href={item.href}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-ink-700/40 transition-colors">
                  {TYPE_ICON[item.type] ?? <TrendingUp className="size-3.5 text-success shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className={`text-sm truncate ${item.actual === false ? 'text-slate-400' : 'text-slate-200'}`}>{item.label}</p>
                      {item.actual === false && (
                        <span className="text-[9px] bg-warning/10 text-warning border border-warning/20 px-1.5 py-0.5 rounded-full font-medium shrink-0">previsto</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">dia {item.day}</p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums shrink-0 ${item.actual === false ? 'text-success/60' : 'text-success'}`}>+{fmtC(item.amount)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="px-3 py-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3 flex items-center gap-1.5">
            <TrendingDown className="size-3 text-danger" />
            Despesas — {fmt(data.totalExpense)}
          </p>
          {data.expenseItems.length === 0 ? (
            <p className="text-xs text-slate-600 px-3">Nenhuma despesa</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {data.expenseItems.map((item) => (
                <Link key={item.id} href={item.href}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-lg hover:bg-ink-700/40 transition-colors">
                  {TYPE_ICON[item.type] ?? <Receipt className="size-3.5 text-danger shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className={`text-sm truncate ${item.actual === false ? 'text-slate-400' : 'text-slate-200'}`}>{item.label}</p>
                      {item.overdue && (
                        <span className="text-[9px] bg-danger/15 text-danger border border-danger/20 px-1.5 py-0.5 rounded-full font-medium shrink-0">em atraso</span>
                      )}
                      {item.actual === false && !item.overdue && (
                        <span className="text-[9px] bg-warning/10 text-warning border border-warning/20 px-1.5 py-0.5 rounded-full font-medium shrink-0">pendente</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">dia {item.day}</p>
                  </div>
                  <span className={`text-sm font-semibold tabular-nums shrink-0 ${item.actual === false ? 'text-danger/60' : 'text-danger'}`}>-{fmtC(item.amount)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectionPage() {
  const [data, setData]         = useState<ProjectionMonth[]>([])
  const [loading, setLoading]   = useState(true)
  const [months, setMonths]     = useState(6)
  const [selected, setSelected] = useState<string | null>(null)
  const [isPro, setIsPro]       = useState<boolean | null>(null)

  // Check plan before fetching
  useEffect(() => {
    fetch('/api/v1/auth/me')
      .then(r => r.json())
      .then(j => setIsPro(j.data?.plan === 'PRO' || j.data?.plan === 'PRO_PLUS'))
      .catch(() => setIsPro(false))
  }, [])

  useEffect(() => {
    if (isPro === null || !isPro) return
    fetch(`${API}/api/projection?months=${months}`)
      .then(r => r.json())
      .then(j => {
        const d = j.data ?? []
        setData(d)
        setSelected(d[0]?.month ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [months, isPro])

  // PRO gate
  if (isPro === false) {
    return (
      <div className="relative max-w-5xl mx-auto">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
          <div className="size-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
            <Crown className="size-7 text-amber-400 fill-amber-400/20" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-100">Projeção financeira é PRO</p>
            <p className="text-sm text-slate-500 mt-1">Veja para onde seu dinheiro vai nos próximos meses</p>
          </div>
          <Link href="/settings?tab=billing"
            className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-ink-900 font-bold text-sm px-5 py-2.5 rounded-xl transition-colors">
            <Crown className="size-4 fill-ink-900" />
            Assinar PRO — R$19,90/mês
          </Link>
        </div>
        <div className="blur-sm opacity-20 pointer-events-none">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="min-w-[110px] h-[172px] bg-ink-800 border border-ink-700 rounded-xl shrink-0" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const selectedData = data.find(d => d.month === selected) ?? null
  const cumulatives  = data.map(d => d.cumulativeBalance)
  const maxCum       = Math.max(...cumulatives, 0)
  const minCum       = Math.min(...cumulatives, 0)
  const totalBalance = data.reduce((s, m) => s + m.balance, 0)

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="size-5 text-brand-400" />
            Projeção financeira
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Receitas e despesas esperadas nos próximos meses</p>
          <p className="text-xs text-slate-600 mt-1 max-w-lg">
            Meses passados e atual mostram <span className="text-success">dados reais</span>. Meses futuros são estimativas baseadas em rendas recorrentes, contas e compromissos cadastrados.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-ink-800 border border-ink-600 rounded-lg p-1 shrink-0">
          {[3, 6, 12].map((n) => (
            <button key={n} onClick={() => { setMonths(n); setLoading(true) }}
              className={`h-6 px-2.5 rounded-md text-xs font-medium transition-colors ${
                months === n ? 'bg-brand-600 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}>
              {n}M
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: months }).map((_, i) => (
            <div key={i} className="min-w-[110px] h-[172px] bg-ink-800 border border-ink-700 rounded-xl animate-pulse shrink-0" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-slate-600 py-8 text-center">
          Cadastre rendas recorrentes ou contas para ver a projeção.
        </p>
      ) : (
        <>
          {/* Legend */}
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-brand-600 inline-block" />Saldo acumulado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-success">↑</span> / <span className="text-danger">↓</span> resultado do mês
            </span>
            <span className="text-slate-600">· Clique para detalhes</span>
          </div>

          {/* Month chips */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {data.map((m) => (
              <MonthChip
                key={m.month}
                data={m}
                maxCum={maxCum}
                minCum={minCum}
                selected={selected === m.month}
                onClick={() => setSelected(selected === m.month ? null : m.month)}
              />
            ))}
          </div>

          {/* Detail panel */}
          {selectedData && (
            <DetailPanel data={selectedData} onClose={() => setSelected(null)} />
          )}

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-ink-800 border border-white/6 rounded-xl p-4">
              <p className="text-xs text-slate-500">Total a receber</p>
              <p className="text-lg font-bold text-success tabular-nums mt-0.5">
                {fmt(data.reduce((s, m) => s + m.totalIncome, 0))}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">em {months} meses</p>
            </div>
            <div className="bg-ink-800 border border-white/6 rounded-xl p-4">
              <p className="text-xs text-slate-500">Total a pagar</p>
              <p className="text-lg font-bold text-danger tabular-nums mt-0.5">
                {fmt(data.reduce((s, m) => s + m.totalExpense, 0))}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">em {months} meses</p>
            </div>
            <div className="bg-ink-800 border border-white/6 rounded-xl p-4">
              <p className="text-xs text-slate-500">Saldo acumulado</p>
              <p className={`text-lg font-bold tabular-nums mt-0.5 ${totalBalance >= 0 ? 'text-success' : 'text-danger'}`}>
                {totalBalance >= 0 ? '+' : ''}{fmt(totalBalance)}
              </p>
              <p className="text-xs text-slate-600 mt-0.5">ao final dos {months} meses</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
