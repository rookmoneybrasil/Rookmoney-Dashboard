'use client'

import { useState } from 'react'
import { X, TrendingUp, TrendingDown, ArrowDownToLine, Wallet, AlertTriangle, ArrowUpRight, Layers, RefreshCw, Users } from 'lucide-react'
import { formatCurrency, formatDate, classifyBillStatus } from '@/lib/utils'
import { BorderGlow } from '@/components/ui/border-glow'
import { StatCard } from '@/components/ui/card'
import { WithTooltip } from '@/components/ui/tooltip'
import { Sparkline } from './sparkline'
import type { Bill, Transaction, UpcomingPersonPayable } from '@/lib/api-client'

// ─── Modal shell ──────────────────────────────────────────────────────────────

function StatModal({ title, icon, children, onClose }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-ink-800 border border-white/8 rounded-2xl shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-4 duration-200"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <div className="flex items-center gap-2">{icon}<h2 className="font-semibold text-slate-100">{title}</h2></div>
          <button onClick={onClose} className="size-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">{children}</div>
      </div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-slate-600 text-center py-8">{text}</p>
}

// ─── Main component — receives ALL data as serializable props ─────────────────

type ModalType = 'receber' | 'receitas' | 'pagar' | 'saldo' | null

interface Props {
  totalReceivable:       number
  totalPeopleReceivable: number
  totalIncomeReceivable: number
  monthIncome:           number
  monthExpense:          number
  monthBalance:          number
  pendingBillsAmount:    number
  personPayablesAmount:  number
  overdueCount:          number
  pendingBillsCount:     number
  incomeChange:          number
  expenseChange:         number
  upcomingBills:            Bill[]
  upcomingPersonPayables:   UpcomingPersonPayable[]
  upcomingPeopleReceivable: UpcomingPersonPayable[]
  pendingIncomeSources:     { id: string; name: string; amount: number; isRecurring: boolean; dayOfMonth: number | null }[]
  recentTransactions:       Transaction[]
  monthIncomeTransactions:  Transaction[]
  monthLabel:            string
  monthlyHistory:        { month: string; income: number; expense: number }[]
}

export function DashboardKPIs(p: Props) {
  const [modal, setModal] = useState<ModalType>(null)
  const cardHover = 'cursor-pointer group/card relative transition-all duration-150'
  const overlay   = 'absolute inset-0 rounded-xl pointer-events-none ring-1 ring-white/0 group-hover/card:ring-white/20 transition-all duration-150'

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* A Receber */}
        <WithTooltip content="Clique para ver detalhes" side="bottom">
          <div className={cardHover} onClick={() => setModal('receber')}>
            <BorderGlow backgroundColor="#062828" glowColor="187 80 50" colors={['#22d3ee', '#67e8f9', '#0891b2']} borderRadius={12} glowRadius={20} glowIntensity={1.0} coneSpread={25} fillOpacity={0.5}>
              <StatCard label="A Receber" value={formatCurrency(p.totalReceivable)} variant="info" icon={<ArrowDownToLine className="size-4" />}
                sub={p.totalReceivable === 0 ? 'Nada pendente' : [p.totalPeopleReceivable > 0 && `${formatCurrency(p.totalPeopleReceivable, true)} de pessoas`, p.totalIncomeReceivable > 0 && `${formatCurrency(p.totalIncomeReceivable, true)} de rendas`].filter(Boolean).join(' · ')}
                className="bg-transparent border-transparent" />
            </BorderGlow>
            <div className={overlay} />
          </div>
        </WithTooltip>

        {/* Receitas */}
        <WithTooltip content="Clique para ver detalhes" side="bottom">
          <div className={cardHover} onClick={() => setModal('receitas')}>
            <BorderGlow backgroundColor="#052E16" glowColor="142 71 45" colors={['#22c55e', '#4ade80', '#16a34a']} borderRadius={12} glowRadius={20} glowIntensity={1.0} coneSpread={25} fillOpacity={0.5}>
              <div className="relative">
                <StatCard label="Receitas" value={formatCurrency(p.monthIncome)} variant="income" icon={<TrendingUp className="size-4" />}
                  trend={p.incomeChange !== 0 ? { value: p.incomeChange, label: 'vs mês ant.' } : undefined}
                  sub="Total recebido" className="bg-transparent border-transparent" />
                <div className="absolute bottom-3 right-3 opacity-50">
                  <Sparkline data={p.monthlyHistory.map(h => h.income)} color="#22c55e" />
                </div>
              </div>
            </BorderGlow>
            <div className={overlay} />
          </div>
        </WithTooltip>

        {/* A Pagar */}
        <WithTooltip content="Clique para ver detalhes" side="bottom">
          <div className={cardHover} onClick={() => setModal('pagar')}>
            <BorderGlow backgroundColor="#450A0A" glowColor="0 84 60" colors={['#ef4444', '#f87171', '#dc2626']} borderRadius={12} glowRadius={20} glowIntensity={1.0} coneSpread={25} fillOpacity={0.5}>
              <div className="relative">
                <StatCard label="A Pagar" value={formatCurrency(p.pendingBillsAmount + p.personPayablesAmount)} variant="expense" icon={<TrendingDown className="size-4" />}
                  sub={p.overdueCount > 0 ? `${p.overdueCount} em atraso · ${p.pendingBillsCount} conta${p.pendingBillsCount !== 1 ? 's' : ''}` : `${p.pendingBillsCount} conta${p.pendingBillsCount !== 1 ? 's' : ''} pendente${p.pendingBillsCount !== 1 ? 's' : ''}`}
                  className="bg-transparent border-transparent" />
                <div className="absolute bottom-3 right-3 opacity-50">
                  <Sparkline data={p.monthlyHistory.map(h => h.expense)} color="#ef4444" />
                </div>
              </div>
            </BorderGlow>
            <div className={overlay} />
          </div>
        </WithTooltip>

        {/* Saldo */}
        <WithTooltip content="Clique para ver detalhes" side="bottom">
          <div className={cardHover} onClick={() => setModal('saldo')}>
            <BorderGlow backgroundColor="#111E32" glowColor="221 83 53" colors={['#2563EB', '#6366f1', '#3B82F6']} borderRadius={12} glowRadius={20} glowIntensity={1.0} coneSpread={25} fillOpacity={0.5}>
              <div className="relative">
                <StatCard label="Saldo do mês" value={formatCurrency(p.monthBalance)} variant="default" icon={<Wallet className="size-4" />}
                  sub={`Já pago: ${formatCurrency(p.monthExpense)}`} className="bg-transparent border-transparent" />
                <div className="absolute bottom-3 right-3 opacity-50">
                  <Sparkline data={p.monthlyHistory.map(h => h.income - h.expense)} color="#6366f1" />
                </div>
              </div>
            </BorderGlow>
            <div className={overlay} />
          </div>
        </WithTooltip>
      </div>

      {/* ── Modals ── */}
      {modal === 'receber' && (
        <StatModal title="A Receber" icon={<ArrowDownToLine className="size-4 text-cyan-400" />} onClose={() => setModal(null)}>
          {p.upcomingPeopleReceivable.length > 0 && (() => {
            // Group by person name and sum amounts
            const byPerson = p.upcomingPeopleReceivable.reduce<Record<string, number>>((acc, up) => {
              acc[up.person.name] = (acc[up.person.name] ?? 0) + Number(up.amount)
              return acc
            }, {})
            return <>
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-1">Pessoas que te devem</p>
              {Object.entries(byPerson).map(([name, total]) => (
                <div key={name} className="flex items-center justify-between gap-3 p-3 bg-ink-700/60 rounded-xl">
                  <p className="text-sm text-slate-200 font-medium truncate">{name}</p>
                  <span className="text-sm font-semibold text-success shrink-0">+{formatCurrency(total)}</span>
                </div>
              ))}
            </>
          })()}
          {p.pendingIncomeSources.length > 0 && <>
            <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-1 mt-2">Fontes de renda pendentes</p>
            {p.pendingIncomeSources.map(src => (
              <div key={src.id} className="flex items-center justify-between gap-3 p-3 bg-ink-700/60 rounded-xl">
                <div className="min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">{src.name}</p>
                  <p className="text-xs text-slate-500">
                    {src.isRecurring ? `Recorrente · dia ${src.dayOfMonth ?? 1}` : 'Eventual · pendente'}
                  </p>
                </div>
                <span className="text-sm font-semibold text-cyan-400 shrink-0">+{formatCurrency(src.amount)}</span>
              </div>
            ))}
          </>}
          {/* Fallback: API ainda sem pendingIncomeSources mas há valor a receber */}
          {p.pendingIncomeSources.length === 0 && p.totalIncomeReceivable > 0 && (
            <div className="p-3 bg-ink-700/60 rounded-xl flex items-center justify-between">
              <p className="text-sm text-slate-300">Fontes de renda pendentes este mês</p>
              <span className="text-sm font-semibold text-cyan-400">+{formatCurrency(p.totalIncomeReceivable)}</span>
            </div>
          )}
          {p.totalReceivable === 0 && <Empty text="Nada a receber no momento." />}
        </StatModal>
      )}

      {modal === 'receitas' && (
        <StatModal title="Receitas do mês" icon={<TrendingUp className="size-4 text-success" />} onClose={() => setModal(null)}>
          {(p.monthIncomeTransactions ?? []).length === 0
            ? <Empty text="Nenhuma receita registrada este mês." />
            : (p.monthIncomeTransactions ?? []).map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-3 bg-ink-700/60 rounded-xl">
                <div className="size-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: tx.category.color + '22', color: tx.category.color }}>
                  {tx.category.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">{tx.description ?? tx.category.name}</p>
                  <p className="text-xs text-slate-500">{tx.category.name} · {formatDate(new Date(tx.date))}</p>
                </div>
                <span className="text-sm font-semibold text-success shrink-0">+{formatCurrency(Number(tx.amount))}</span>
              </div>
            ))
          }
        </StatModal>
      )}

      {modal === 'pagar' && (() => {
        const unpaid      = p.upcomingBills.filter(b => !b.isPaid)
        const overdue     = unpaid.filter(b => classifyBillStatus(b.dueDate, false) === 'overdue')
        const installment = unpaid.filter(b => !!b.installmentGroupId && classifyBillStatus(b.dueDate, false) !== 'overdue')
        const recAvulso   = unpaid.filter(b => !b.installmentGroupId && classifyBillStatus(b.dueDate, false) !== 'overdue')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

        // Pessoas: aggregate by person name
        const peopleMap = p.upcomingPersonPayables.reduce<Record<string, number>>((acc, up) => {
          acc[up.person.name] = (acc[up.person.name] ?? 0) + Number(up.amount)
          return acc
        }, {})
        const peopleEntries = Object.entries(peopleMap)

        const sumOf = (arr: Bill[]) => arr.reduce((s, b) => s + Number(b.amount), 0)
        const peopleTotal = peopleEntries.reduce((s, [, v]) => s + v, 0)

        const blocks = [
          { label: 'Em atraso',     icon: AlertTriangle, color: 'text-danger',    bg: 'bg-danger/10',    border: 'border-danger/20',    total: sumOf(overdue),     count: overdue.length     },
          { label: 'Parceladas',    icon: Layers,        color: 'text-brand-400', bg: 'bg-brand-500/10', border: 'border-brand-500/20', total: sumOf(installment), count: installment.length },
          { label: 'Contas',        icon: RefreshCw,     color: 'text-slate-300', bg: 'bg-ink-600',      border: 'border-white/8',      total: sumOf(recAvulso),   count: recAvulso.length   },
          { label: 'Pessoas',       icon: Users,         color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', total: peopleTotal,      count: peopleEntries.length },
        ].filter(b => b.count > 0)

        const hasAnything = unpaid.length > 0 || peopleEntries.length > 0

        return (
          <StatModal title="A Pagar" icon={<TrendingDown className="size-4 text-danger" />} onClose={() => setModal(null)}>
            {!hasAnything ? <Empty text="Nenhuma conta pendente. Tudo em dia! 🎉" /> : <>

              {/* Summary blocks */}
              <div className={`grid gap-2 mb-1 ${blocks.length <= 2 ? 'grid-cols-2' : blocks.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                {blocks.map(b => (
                  <div key={b.label} className={`rounded-xl border ${b.bg} ${b.border} p-3 flex flex-col gap-0.5`}>
                    <div className={`flex items-center gap-1.5 ${b.color}`}>
                      <b.icon className="size-3" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide">{b.label}</span>
                    </div>
                    <p className={`text-sm font-bold tabular-nums ${b.color}`}>{formatCurrency(b.total)}</p>
                    <p className="text-[10px] text-slate-600">{b.count} item{b.count !== 1 ? 's' : ''}</p>
                  </div>
                ))}
              </div>

              {/* Em atraso */}
              {overdue.length > 0 && <>
                <p className="text-[10px] font-semibold text-danger/80 uppercase tracking-wider px-1 pt-2 flex items-center gap-1.5">
                  <AlertTriangle className="size-3" /> Em atraso
                </p>
                {overdue.map(bill => (
                  <div key={bill.id} className="flex items-center gap-3 p-3 rounded-xl bg-danger/8 border border-danger/20">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">{bill.name}</p>
                      <p className="text-xs text-danger">{formatDate(new Date(bill.dueDate))}</p>
                    </div>
                    <span className="text-sm font-semibold text-danger shrink-0">{formatCurrency(Number(bill.amount))}</span>
                  </div>
                ))}
              </>}

              {/* Parceladas */}
              {installment.length > 0 && <>
                <p className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider px-1 pt-2 flex items-center gap-1.5">
                  <Layers className="size-3" /> Parceladas
                </p>
                {installment.map(bill => (
                  <div key={bill.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-700/60">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">
                        {bill.name}
                        {bill.installmentCurrent && bill.installmentTotal && (
                          <span className="ml-1.5 text-[10px] text-slate-600">{bill.installmentCurrent}/{bill.installmentTotal}</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(new Date(bill.dueDate))}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-300 shrink-0">{formatCurrency(Number(bill.amount))}</span>
                  </div>
                ))}
              </>}

              {/* Fixas + Avulsas */}
              {recAvulso.length > 0 && <>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-1 pt-2 flex items-center gap-1.5">
                  <RefreshCw className="size-3" /> Contas
                </p>
                {recAvulso.map(bill => {
                  const status = classifyBillStatus(bill.dueDate, false)
                  return (
                    <div key={bill.id} className="flex items-center gap-3 p-3 rounded-xl bg-ink-700/60">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-200 font-medium truncate">{bill.name}</p>
                        <p className={`text-xs ${status === 'urgent' ? 'text-warning' : 'text-slate-500'}`}>
                          {bill.recurringBillId ? '🔁 fixa · ' : ''}{formatDate(new Date(bill.dueDate))}
                        </p>
                      </div>
                      <span className={`text-sm font-semibold shrink-0 ${status === 'urgent' ? 'text-warning' : 'text-slate-300'}`}>
                        {formatCurrency(Number(bill.amount))}
                      </span>
                    </div>
                  )
                })}
              </>}

              {/* Pessoas */}
              {peopleEntries.length > 0 && <>
                <p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider px-1 pt-2 flex items-center gap-1.5">
                  <Users className="size-3" /> Pessoas
                </p>
                {peopleEntries.map(([name, total]) => (
                  <div key={name} className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/8 border border-purple-500/15">
                    <div className="size-8 rounded-full bg-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300 shrink-0">
                      {name[0].toUpperCase()}
                    </div>
                    <p className="flex-1 text-sm text-slate-200 font-medium truncate">{name}</p>
                    <span className="text-sm font-semibold text-purple-300 shrink-0">{formatCurrency(total)}</span>
                  </div>
                ))}
              </>}
            </>}
          </StatModal>
        )
      })()}

      {modal === 'saldo' && (
        <StatModal title={`Saldo — ${p.monthLabel}`} icon={<Wallet className="size-4 text-brand-400" />} onClose={() => setModal(null)}>
          <div className="flex items-center justify-between p-3 bg-success/8 border border-success/20 rounded-xl">
            <div className="flex items-center gap-2"><TrendingUp className="size-4 text-success" /><span className="text-sm text-slate-300">Receitas</span></div>
            <span className="text-sm font-semibold text-success">+{formatCurrency(p.monthIncome)}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-danger/8 border border-danger/20 rounded-xl">
            <div className="flex items-center gap-2"><TrendingDown className="size-4 text-danger" /><span className="text-sm text-slate-300">Já pago</span></div>
            <span className="text-sm font-semibold text-danger">-{formatCurrency(p.monthExpense)}</span>
          </div>
          <div className={`flex items-center justify-between p-3 rounded-xl ${p.monthBalance >= 0 ? 'bg-brand-800/40 border border-brand-700/30' : 'bg-danger/8 border border-danger/20'}`}>
            <div className="flex items-center gap-2">
              <ArrowUpRight className={`size-4 ${p.monthBalance >= 0 ? 'text-brand-400' : 'text-danger'}`} />
              <span className="text-sm text-slate-300">Saldo líquido</span>
            </div>
            <span className={`text-sm font-semibold ${p.monthBalance >= 0 ? 'text-brand-300' : 'text-danger'}`}>
              {p.monthBalance >= 0 ? '+' : ''}{formatCurrency(p.monthBalance)}
            </span>
          </div>
          {p.monthIncome > 0 && (
            <p className="text-xs text-slate-500 text-center pt-2">
              Taxa de economia:{' '}
              <span className={`font-semibold ${Math.round(((p.monthIncome - p.monthExpense) / p.monthIncome) * 100) >= 20 ? 'text-success' : 'text-warning'}`}>
                {Math.round(((p.monthIncome - p.monthExpense) / p.monthIncome) * 100)}%
              </span>
            </p>
          )}
        </StatModal>
      )}
    </>
  )
}
