'use client'

import { useState } from 'react'
import React from 'react'
import { X, TrendingUp, TrendingDown, ArrowDownToLine, Wallet, AlertTriangle, ArrowUpRight } from 'lucide-react'
import { formatCurrency, formatDate, classifyBillStatus } from '@/lib/utils'
import type { Bill, Transaction, UpcomingPersonPayable } from '@/lib/api-client'

// ─── Modal shell ──────────────────────────────────────────────────────────────

function StatModal({ title, icon, children, onClose }: {
  title:    string
  icon:     React.ReactNode
  children: React.ReactNode
  onClose:  () => void
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

// ─── Clickable card wrapper ───────────────────────────────────────────────────

export function ClickableCard({ children, modal }: {
  children: React.ReactNode
  modal: React.ReactElement<{ onClose: () => void }>
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div onClick={() => setOpen(true)} className="cursor-pointer group/card relative">
        {children}
        <div className="absolute inset-0 rounded-xl ring-1 ring-white/0 group-hover/card:ring-white/20 transition-all duration-150 pointer-events-none" />
      </div>
      {open && React.cloneElement(modal, { onClose: () => setOpen(false) })}
    </>
  )
}

// ─── Individual modals ────────────────────────────────────────────────────────

export function AReceberModal({ onClose, upcomingPayables, totalIncomeReceivable, totalPeopleReceivable }: {
  onClose: () => void
  upcomingPayables: UpcomingPersonPayable[]
  totalIncomeReceivable: number
  totalPeopleReceivable: number
}) {
  return (
    <StatModal title="A Receber" icon={<ArrowDownToLine className="size-4 text-cyan-400" />} onClose={onClose}>
      {totalPeopleReceivable > 0 && (
        <>
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-1">Pessoas que te devem</p>
          {upcomingPayables.filter(p => p.amount > 0).map(p => (
            <div key={p.id} className="flex items-center justify-between gap-3 p-3 bg-ink-700/60 rounded-xl">
              <div className="min-w-0">
                <p className="text-sm text-slate-200 font-medium truncate">{p.person.name}</p>
                <p className="text-xs text-slate-500 truncate">{p.description} · {formatDate(new Date(p.date))}</p>
              </div>
              <span className="text-sm font-semibold text-success shrink-0">+{formatCurrency(Number(p.amount))}</span>
            </div>
          ))}
        </>
      )}
      {totalIncomeReceivable > 0 && (
        <>
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-1 mt-2">Rendas pendentes</p>
          <div className="p-3 bg-ink-700/60 rounded-xl flex items-center justify-between">
            <p className="text-sm text-slate-300">Rendas recorrentes não processadas</p>
            <span className="text-sm font-semibold text-cyan-400">+{formatCurrency(totalIncomeReceivable)}</span>
          </div>
        </>
      )}
      {totalPeopleReceivable === 0 && totalIncomeReceivable === 0 && <Empty text="Nada a receber no momento." />}
    </StatModal>
  )
}

export function ReceitasModal({ onClose, transactions }: {
  onClose: () => void
  transactions: Transaction[]
}) {
  const incomes = transactions.filter(t => t.type === 'INCOME')
  return (
    <StatModal title="Receitas do mês" icon={<TrendingUp className="size-4 text-success" />} onClose={onClose}>
      {incomes.length === 0
        ? <Empty text="Nenhuma receita registrada este mês." />
        : incomes.map(tx => (
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
  )
}

export function APagarModal({ onClose, bills, personPayables }: {
  onClose: () => void
  bills: Bill[]
  personPayables: UpcomingPersonPayable[]
}) {
  const pending = bills.filter(b => !b.isPaid)
  return (
    <StatModal title="A Pagar" icon={<TrendingDown className="size-4 text-danger" />} onClose={onClose}>
      {pending.length === 0 && personPayables.length === 0
        ? <Empty text="Nenhuma conta pendente. Tudo em dia! 🎉" />
        : <>
            {pending.map(bill => {
              const status = classifyBillStatus(bill.dueDate, bill.isPaid)
              const bad = status === 'overdue' || status === 'urgent'
              return (
                <div key={bill.id} className={`flex items-center gap-3 p-3 rounded-xl ${status === 'overdue' ? 'bg-danger/8 border border-danger/20' : 'bg-ink-700/60'}`}>
                  {bad && <AlertTriangle className={`size-4 shrink-0 ${status === 'overdue' ? 'text-danger' : 'text-warning'}`} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 font-medium truncate">{bill.name}</p>
                    <p className={`text-xs ${status === 'overdue' ? 'text-danger' : 'text-slate-500'}`}>
                      {status === 'overdue' ? 'Em atraso · ' : ''}{formatDate(new Date(bill.dueDate))}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ${status === 'overdue' ? 'text-danger' : 'text-slate-300'}`}>
                    {formatCurrency(Number(bill.amount))}
                  </span>
                </div>
              )
            })}
            {personPayables.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-ink-700/60 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 font-medium truncate">{p.person.name} · {p.description}</p>
                  <p className="text-xs text-slate-500">{formatDate(new Date(p.date))}</p>
                </div>
                <span className="text-sm font-semibold text-danger shrink-0">-{formatCurrency(Number(p.amount))}</span>
              </div>
            ))}
          </>
      }
    </StatModal>
  )
}

export function SaldoModal({ onClose, income, expense, balance, month }: {
  onClose:  () => void
  income:   number
  expense:  number
  balance:  number
  month:    string
}) {
  const savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0
  return (
    <StatModal title={`Saldo — ${month}`} icon={<Wallet className="size-4 text-brand-400" />} onClose={onClose}>
      <div className="flex items-center justify-between p-3 bg-success/8 border border-success/20 rounded-xl">
        <div className="flex items-center gap-2"><TrendingUp className="size-4 text-success" /><span className="text-sm text-slate-300">Receitas</span></div>
        <span className="text-sm font-semibold text-success">+{formatCurrency(income)}</span>
      </div>
      <div className="flex items-center justify-between p-3 bg-danger/8 border border-danger/20 rounded-xl">
        <div className="flex items-center gap-2"><TrendingDown className="size-4 text-danger" /><span className="text-sm text-slate-300">Já pago</span></div>
        <span className="text-sm font-semibold text-danger">-{formatCurrency(expense)}</span>
      </div>
      <div className={`flex items-center justify-between p-3 rounded-xl ${balance >= 0 ? 'bg-brand-800/40 border border-brand-700/30' : 'bg-danger/8 border border-danger/20'}`}>
        <div className="flex items-center gap-2">
          <ArrowUpRight className={`size-4 ${balance >= 0 ? 'text-brand-400' : 'text-danger'}`} />
          <span className="text-sm text-slate-300">Saldo líquido</span>
        </div>
        <span className={`text-sm font-semibold ${balance >= 0 ? 'text-brand-300' : 'text-danger'}`}>
          {balance >= 0 ? '+' : ''}{formatCurrency(balance)}
        </span>
      </div>
      {income > 0 && (
        <p className="text-xs text-slate-500 text-center pt-2">
          Taxa de economia:{' '}
          <span className={`font-semibold ${savingsRate >= 20 ? 'text-success' : savingsRate >= 0 ? 'text-warning' : 'text-danger'}`}>
            {savingsRate}%
          </span>
        </p>
      )}
    </StatModal>
  )
}
