'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Receipt, TrendingUp, RefreshCw } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'
import type { CalendarEvent, CalendarData } from '@/lib/api-client'

const API = ''  // proxy route: /api/calendar (same-origin)

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const COLOR_MAP: Record<string, string> = {
  success: '#22c55e',
  danger:  '#f43f5e',
  warning: '#f59e0b',
}

const TYPE_ICON = {
  bill:      <Receipt    className="size-3 shrink-0" />,
  income:    <TrendingUp className="size-3 shrink-0" />,
  recurring: <RefreshCw  className="size-3 shrink-0" />,
}

function EventDot({ color }: { color: string }) {
  return <div className="size-1.5 rounded-full shrink-0" style={{ backgroundColor: COLOR_MAP[color] ?? color }} />
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [data, setData]               = useState<CalendarData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)

  const monthStr = format(currentDate, 'yyyy-MM')

  useEffect(() => {
    fetch(`${API}/api/calendar?month=${monthStr}`)
      .then(r => r.json())
      .then(json => { setData(json.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [monthStr])

  const prevMonth = () => { setCurrentDate(d => subMonths(d, 1)); setLoading(true); setSelectedDay(null) }
  const nextMonth = () => { setCurrentDate(d => addMonths(d, 1)); setLoading(true); setSelectedDay(null) }

  const today   = new Date()
  const isToday = (day: number) =>
    today.getFullYear() === currentDate.getFullYear() &&
    today.getMonth()    === currentDate.getMonth() &&
    today.getDate()     === day

  const selectedEvents: CalendarEvent[] = selectedDay && data ? (data.byDay[selectedDay] ?? []) : []

  // Bug 2 fix: totalPending includes 'expected' bills (not-yet-generated templates)
  // totalExpected only counts income-type events (income sources)
  const totalPending  = data?.events
    .filter(e => (e.status === 'pending' || e.status === 'overdue') ||
                 (e.status === 'expected' && e.type === 'bill'))
    .reduce((s, e) => s + Number(e.amount), 0) ?? 0
  const totalExpected = data?.events
    .filter(e => e.status === 'expected' && e.type === 'income')
    .reduce((s, e) => s + Number(e.amount), 0) ?? 0

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Calendário financeiro</h1>
          <p className="text-sm text-slate-500 mt-0.5">Contas, rendas e recorrências do mês</p>
        </div>
      </div>

      {/* Resumo do mês */}
      {data && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-ink-800 border border-white/6 rounded-xl p-4 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
              <Receipt className="size-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500">A pagar este mês</p>
              <p className="text-base font-bold text-danger">{formatCurrency(totalPending)}</p>
            </div>
          </div>
          <div className="bg-ink-800 border border-white/6 rounded-xl p-4 flex items-center gap-3">
            <div className="size-9 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <p className="text-xs text-slate-500">A receber este mês</p>
              <p className="text-base font-bold text-success">{formatCurrency(totalExpected)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendário */}
        <div className="lg:col-span-2 bg-ink-800 border border-white/6 rounded-2xl overflow-hidden">
          {/* Nav do mês */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
            <button onClick={prevMonth} className="size-8 rounded-lg hover:bg-ink-700 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center">
              <ChevronLeft className="size-4" />
            </button>
            <h2 className="text-sm font-semibold text-slate-200 capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button onClick={nextMonth} className="size-8 rounded-lg hover:bg-ink-700 text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center">
              <ChevronRight className="size-4" />
            </button>
          </div>

          {/* Cabeçalho dias semana */}
          <div className="grid grid-cols-7 border-b border-white/6">
            {DAY_NAMES.map(d => (
              <div key={d} className="py-2 text-center text-xs font-medium text-slate-600">{d}</div>
            ))}
          </div>

          {/* Grid de dias */}
          {loading ? (
            <div className="py-16 text-center text-slate-600 text-sm">Carregando...</div>
          ) : data ? (
            <div className="grid grid-cols-7">
              {/* Células vazias antes do dia 1 */}
              {Array.from({ length: data.firstWeekday }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 border-b border-r border-white/4 last:border-r-0" />
              ))}

              {/* Dias do mês */}
              {Array.from({ length: data.daysInMonth }, (_, i) => {
                const day    = i + 1
                const events = data.byDay[day] ?? []
                const active = selectedDay === day
                const todayDay = isToday(day)

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(active ? null : day)}
                    className={`h-20 border-b border-r border-white/4 p-1.5 text-left transition-colors relative ${
                      active
                        ? 'bg-brand-900/60 border-brand-700/40'
                        : 'hover:bg-ink-700/50'
                    } ${(i + data.firstWeekday + 1) % 7 === 0 ? 'border-r-0' : ''}`}
                  >
                    {/* Número do dia */}
                    <span className={`inline-flex items-center justify-center size-6 rounded-full text-xs font-semibold mb-1 ${
                      todayDay
                        ? 'bg-brand-600 text-white'
                        : active
                        ? 'text-brand-300'
                        : 'text-slate-400'
                    }`}>
                      {day}
                    </span>

                    {/* Dots de eventos */}
                    <div className="flex flex-wrap gap-0.5">
                      {events.slice(0, 3).map(ev => (
                        <EventDot key={ev.id} color={ev.color} />
                      ))}
                      {events.length > 3 && (
                        <span className="text-[9px] text-slate-600 leading-none">+{events.length - 3}</span>
                      )}
                    </div>

                    {/* Label primeiro evento */}
                    {events[0] && (
                      <p className="text-[9px] text-slate-500 truncate leading-tight mt-0.5">
                        {events[0].label}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-600 text-sm">Erro ao carregar calendário.</div>
          )}

          {/* Legenda */}
          <div className="flex items-center gap-4 px-5 py-3 border-t border-white/6">
            {[
              { color: 'danger',  label: 'A pagar' },
              { color: 'warning', label: 'Recorrência' },
              { color: 'success', label: 'A receber' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="size-2 rounded-full" style={{ backgroundColor: COLOR_MAP[l.color] }} />
                <span className="text-xs text-slate-500">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Painel lateral — eventos do dia */}
        <div className="bg-ink-800 border border-white/6 rounded-2xl flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6">
            <h3 className="text-sm font-semibold text-slate-200">
              {selectedDay
                ? `${selectedDay} de ${format(currentDate, 'MMMM', { locale: ptBR })}`
                : 'Selecione um dia'}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {!selectedDay && (
              <p className="text-sm text-slate-600 text-center py-8">
                Clique em um dia para ver os eventos.
              </p>
            )}

            {selectedDay && selectedEvents.length === 0 && (
              <p className="text-sm text-slate-600 text-center py-8">
                Nenhum evento neste dia.
              </p>
            )}

            {selectedEvents.length > 0 && (
              <div className="flex flex-col gap-2">
                {selectedEvents.map(ev => (
                  <Link
                    key={ev.id}
                    href={ev.href}
                    className="flex items-start gap-3 p-3 rounded-xl bg-ink-700/60 hover:bg-ink-700 border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <div
                      className="size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: COLOR_MAP[ev.color] + '20', color: COLOR_MAP[ev.color] }}
                    >
                      {TYPE_ICON[ev.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white">
                        {ev.label}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="text-xs font-semibold tabular-nums"
                          style={{ color: COLOR_MAP[ev.color] }}
                        >
                          {(ev.status === 'expected' || ev.status === 'received') && ev.type !== 'bill' ? '+' : '-'}{formatCurrency(ev.amount)}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          ev.status === 'paid'     ? 'bg-success/10 text-success' :
                          ev.status === 'received' ? 'bg-success/10 text-success' :
                          ev.status === 'overdue'  ? 'bg-danger/10 text-danger'  :
                          ev.status === 'expected' ? 'bg-slate-700 text-slate-400' :
                                                     'bg-warning/10 text-warning'
                        }`}>
                          {ev.status === 'paid'     ? 'Pago'     :
                           ev.status === 'received' ? 'Recebido' :
                           ev.status === 'overdue'  ? 'Atrasado' :
                           ev.status === 'expected' ? 'Previsto' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Resumo do dia */}
          {selectedDay && selectedEvents.length > 0 && (
            <div className="border-t border-white/6 px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-slate-500">{selectedEvents.length} evento{selectedEvents.length > 1 ? 's' : ''}</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-danger">-{formatCurrency(selectedEvents.filter(e => e.status !== 'expected').reduce((s,e) => s+e.amount, 0))}</span>
                <span className="text-success">+{formatCurrency(selectedEvents.filter(e => e.status === 'expected').reduce((s,e) => s+e.amount, 0))}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
