import { Check, Clock, AlertCircle, Layers, ChevronDown, Archive, FileText, RefreshCw, CalendarDays } from 'lucide-react'
import { addMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate, classifyBillStatus } from '@/lib/utils'
import { serverApi } from '@/lib/api-client'
import { DeleteBillButton, DeleteBillGroupButton, DeleteInstallmentGroupButton, MarkBillPaidButton } from '@/components/ui/delete-buttons'
import { BillModal } from '@/components/bills/bill-modal'
import { EditBillModal } from '@/components/bills/edit-bill-modal'
import { RecurringBillRow } from '@/components/bills/recurring-bill-row'
import { PluggySection } from '@/components/pluggy/pluggy-connect-button'

const statusConfig = {
  paid:    { label: 'Pago',     variant: 'success' as const, icon: Check       },
  pending: { label: 'Pendente', variant: 'default' as const, icon: Clock       },
  urgent:  { label: 'Urgente',  variant: 'warning' as const, icon: AlertCircle },
  overdue: { label: 'Atrasado', variant: 'danger'  as const, icon: AlertCircle },
}

export default async function BillsPage() {
  const [bills, categories, recurringBills, pluggyItems, pluggyData] = await Promise.all([
    serverApi.bills(),
    serverApi.categories(),
    serverApi.recurringBills(),
    serverApi.pluggyItems(),
    serverApi.pluggyBoletos(),
  ])

  const grouped = new Map<string, typeof bills>()
  const regular: typeof bills = []

  for (const b of bills) {
    if (b.installmentGroupId) {
      const arr = grouped.get(b.installmentGroupId) ?? []
      arr.push(b)
      grouped.set(b.installmentGroupId, arr)
    } else {
      regular.push(b)
    }
  }

  const allGroups = Array.from(grouped.values()).map((items) => {
    const sorted    = [...items].sort((a, b) => (a.installmentCurrent ?? 0) - (b.installmentCurrent ?? 0))
    const paidCount = items.filter((b) => b.isPaid).length
    const total     = items[0].installmentTotal ?? items.length
    const nextDue   = sorted.find((b) => !b.isPaid) ?? sorted[sorted.length - 1]
    const grandTotal = total * items[0].amount
    return { items: sorted, paidCount, total, nextDue, name: items[0].name, amount: items[0].amount, groupId: items[0].installmentGroupId!, totalPaid: paidCount * items[0].amount, grandTotal }
  })

  const activeGroups    = allGroups.filter((g) => g.paidCount < g.total)
    .sort((a, b) => new Date(a.nextDue.dueDate).getTime() - new Date(b.nextDue.dueDate).getTime())
  const completedGroups = allGroups.filter((g) => g.paidCount === g.total)
    .sort((a, b) => b.grandTotal - a.grandTotal)

  const pending = regular.filter((b) => !b.isPaid)
  const paid    = regular.filter((b) =>  b.isPaid)

  const totalPending = pending.reduce((s, b) => s + Number(b.amount), 0)
    + activeGroups.reduce((s, g) => s + (g.total - g.paidCount) * g.amount, 0)
  const totalPaid = paid.reduce((s, b) => s + Number(b.amount), 0)
    + allGroups.reduce((s, g) => s + g.paidCount * g.amount, 0)

  const activeRecurring = recurringBills.filter(r => r.isActive)
  const pausedRecurring = recurringBills.filter(r => !r.isActive)
  const monthlyFixed    = activeRecurring.reduce((s, r) => s + Number(r.amount), 0)

  const now = new Date()
  const overdueList = pending.filter(b => classifyBillStatus(b.dueDate, false) === 'overdue')
  const overdueTotal = overdueList.reduce((s, b) => s + Number(b.amount), 0)

  // Projection: next 3 months — fixed + avulsos agendados + parcelas
  const projection = Array.from({ length: 3 }, (_, i) => {
    const d  = addMonths(now, i)
    const yr = d.getFullYear()
    const mo = d.getMonth()
    const label = format(d, "MMM/yy", { locale: ptBR })

    const inMonth = (dateStr: string) => {
      const dd = new Date(dateStr)
      return dd.getFullYear() === yr && dd.getMonth() === mo
    }

    // Avulsos agendados para este mês (sem recurringBillId)
    const avulsoAmount = pending
      .filter(b => !b.recurringBillId && inMonth(b.dueDate))
      .reduce((s, b) => s + Number(b.amount), 0)

    // Parcelas devidas neste mês (installment groups)
    const installmentAmount = activeGroups
      .flatMap(g => g.items)
      .filter(inst => !inst.isPaid && inMonth(inst.dueDate))
      .reduce((s, inst) => s + Number(inst.amount), 0)

    let fixedAmount: number
    if (i === 0) {
      // Mês atual: contas fixas JÁ aparecem em pending como bills geradas
      fixedAmount = pending
        .filter(b => !!b.recurringBillId && inMonth(b.dueDate))
        .reduce((s, b) => s + Number(b.amount), 0)
    } else {
      // Meses futuros: usar o valor mensal das fixas ativas
      fixedAmount = monthlyFixed
    }

    return {
      label,
      amount: fixedAmount + avulsoAmount + installmentAmount,
      isCurrent: i === 0,
      breakdown: { fixed: fixedAmount, avulso: avulsoAmount, installment: installmentAmount },
    }
  })

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">

      {/* Open Finance — Pluggy */}
      <PluggySection
        initialItems={pluggyItems}
        initialBoletos={pluggyData.boletos}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-2xl font-black text-brand-400 capitalize tracking-tight leading-none mb-1">
            {format(now, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
          <h1 className="text-xl font-semibold text-slate-100">Contas a pagar</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pending.length + activeGroups.length} pendente{pending.length + activeGroups.length !== 1 ? 's' : ''} ·{' '}
            {paid.length} paga{paid.length !== 1 ? 's' : ''}
          </p>
        </div>
        <BillModal categories={categories} />
      </div>

      {/* Summary */}
      {bills.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-4">
            <Card variant="outline" padding="sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-slate-500">A pagar</span>
                <span className="text-xl font-bold text-slate-100 tabular-nums">{formatCurrency(totalPending)}</span>
                <span className="text-xs text-slate-600">
                  {pending.length} avulsa{pending.length !== 1 ? 's' : ''} + {activeGroups.length} parcelada{activeGroups.length !== 1 ? 's' : ''}
                </span>
              </div>
            </Card>
            <Card variant="outline" padding="sm">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-slate-500">Pagas</span>
                <span className="text-xl font-bold text-success tabular-nums">{formatCurrency(totalPaid)}</span>
                <span className="text-xs text-slate-600">{paid.length} conta{paid.length !== 1 ? 's' : ''}</span>
              </div>
            </Card>
          </div>
          {/* Alerta de atrasadas */}
          {overdueList.length > 0 && (
            <div className="flex items-center gap-3 bg-danger/10 border border-danger/25 rounded-xl px-4 py-3">
              <AlertCircle className="size-4 text-danger shrink-0" />
              <p className="text-sm text-danger flex-1">
                <span className="font-semibold">{overdueList.length} conta{overdueList.length !== 1 ? 's' : ''} em atraso</span>
                {' '}— total de {formatCurrency(overdueTotal)}. Quite o mais rápido possível para evitar juros.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Projeção (topo) ─────────────────────────────────── */}
      {(activeRecurring.length > 0 || pending.length > 0 || activeGroups.length > 0) && (
        <div className="bg-ink-800 rounded-xl border border-ink-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="size-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-slate-300">Projeção de gastos</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {projection.map((m) => (
              <div key={m.label} className={`rounded-lg p-3 border ${m.isCurrent ? 'border-brand-600/40 bg-brand-900/20' : 'border-ink-600 bg-ink-700/50'}`}>
                <p className="text-[11px] text-slate-500 mb-2 flex items-center gap-1">
                  {m.isCurrent && <span className="size-1.5 rounded-full bg-brand-400 inline-block" />}
                  {m.label}
                </p>
                <p className="text-sm font-bold text-danger mb-1.5">-{formatCurrency(m.amount)}</p>
                <div className="flex flex-col gap-0.5">
                  {m.breakdown.fixed > 0 && <p className="text-[10px] text-slate-600">🔁 {formatCurrency(m.breakdown.fixed)} fixas</p>}
                  {m.breakdown.avulso > 0 && <p className="text-[10px] text-slate-600">💸 {formatCurrency(m.breakdown.avulso)} avulso</p>}
                  {m.breakdown.installment > 0 && <p className="text-[10px] text-slate-600">📅 {formatCurrency(m.breakdown.installment)} parcelas</p>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-600 mt-2">Fixas + avulsos agendados + parcelas vencendo em cada mês.</p>
        </div>
      )}

      {bills.length === 0 && recurringBills.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
          <div className="size-14 rounded-2xl bg-ink-700 border border-ink-600 flex items-center justify-center text-slate-600">
            <FileText className="size-6" />
          </div>
          <div>
            <p className="text-slate-300 text-sm font-medium">Nenhuma conta cadastrada</p>
            <p className="text-slate-600 text-xs max-w-xs mt-1">Adicione boletos, parcelas e contas fixas para nunca mais perder um vencimento.</p>
          </div>
        </div>
      )}

      {/* ── Blocos horizontais: Fixas | Pendentes ───────────── */}
      {(bills.length > 0 || recurringBills.length > 0) && (
        <>
          <div className="border-t border-white/6" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Contas Fixas */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-brand-400 shrink-0" />
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <RefreshCw className="size-4 text-brand-400" /> Contas Fixas
                {activeRecurring.length > 0 && (
                  <span className="text-xs font-normal text-slate-500">{formatCurrency(monthlyFixed)}/mês</span>
                )}
              </h2>
            </div>
            <div className="bg-brand-900/20 border border-brand-700/30 rounded-xl px-3 py-2.5 text-[11px] text-slate-400 leading-relaxed">
              🔁 <strong className="text-slate-300">Fixas</strong> se repetem todo mês no dia configurado — cadastre uma vez e aparecem automaticamente.
            </div>
            {recurringBills.length === 0 ? (
              <div className="flex flex-col items-center gap-1 py-8 text-center bg-ink-800/50 rounded-xl border border-ink-700 border-dashed">
                <p className="text-xs text-slate-600">Nenhuma conta fixa</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {activeRecurring.map((r) => (
                  <RecurringBillRow key={r.id} bill={r} categories={categories} />
                ))}
                {pausedRecurring.map((r) => (
                  <RecurringBillRow key={r.id} bill={r} categories={categories} />
                ))}
              </div>
            )}
          </div>

          {/* Pendentes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-slate-500 shrink-0" />
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Clock className="size-4 text-slate-400" /> Pendentes
                {pending.length > 0 && (
                  <span className="text-xs font-normal text-slate-500">{formatCurrency(totalPending)}</span>
                )}
              </h2>
            </div>
            <div className="bg-ink-800 border border-ink-600 rounded-xl px-3 py-2.5 text-[11px] text-slate-400 leading-relaxed">
              💸 <strong className="text-slate-300">Pendentes</strong> são boletos avulsos e as parcelas geradas pelas contas fixas — marque como pago quando quitar.
            </div>
            {pending.length === 0 ? (
              <div className="flex flex-col items-center gap-1 py-8 text-center bg-ink-800/50 rounded-xl border border-ink-700 border-dashed">
                <p className="text-xs text-success">Nenhuma conta pendente 🎉</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {pending.map((bill) => {
                  const status = classifyBillStatus(bill.dueDate, bill.isPaid)
                  const cfg    = statusConfig[status]
                  const Icon   = cfg.icon
                  return (
                    <div key={bill.id} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors group ${
                      status === 'overdue' ? 'bg-danger/8 border-danger/25 hover:bg-danger/12'
                      : status === 'urgent' ? 'bg-warning/5 border-warning/20 hover:bg-warning/8'
                      : 'bg-ink-800 border-ink-700 hover:bg-ink-700/80'
                    }`}>
                      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                        status === 'overdue' ? 'bg-danger/15' : status === 'urgent' ? 'bg-warning/15' : 'bg-ink-600'
                      }`}>
                        {bill.category?.icon
                          ? <span>{bill.category.icon}</span>
                          : bill.recurringBillId
                          ? <RefreshCw className="size-3.5 text-brand-400" />
                          : <Icon className={`size-3.5 ${status === 'overdue' ? 'text-danger' : status === 'urgent' ? 'text-warning' : 'text-slate-500'}`} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-sm font-medium text-slate-200 truncate">{bill.name}</p>
                          {bill.recurringBillId && <span className="text-[10px] text-brand-500">↻ fixa</span>}
                          <Badge variant={cfg.variant} size="sm" dot>{cfg.label}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {bill.category?.name ?? 'Sem categoria'} · vence {formatDate(bill.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-slate-200 tabular-nums">{formatCurrency(bill.amount)}</span>
                        {/* Botão de pagar sempre visível com texto */}
                        <MarkBillPaidButton id={bill.id} isPaid={bill.isPaid} showLabel />
                        {/* Editar e excluir só no hover */}
                        <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <EditBillModal bill={bill} categories={categories} />
                          <DeleteBillButton id={bill.id} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          </div>
        </>
      )}

      {/* ── Parceladas ──────────────────────────────────────── */}
      {activeGroups.length > 0 && (
        <>
          <div className="border-t border-white/6" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-brand-500 shrink-0" />
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="size-4 text-brand-400" /> Parceladas
              </h2>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeGroups.map((group) => {
              const pct = Math.round((group.paidCount / group.total) * 100)
              return (
                <Card key={group.groupId}>
                  <CardContent className="p-0">
                    <details open className="group/det">
                      <summary className="flex items-center gap-3 p-4 cursor-pointer list-none select-none">
                        <div className="size-9 rounded-xl bg-brand-900/60 text-brand-400 flex items-center justify-center shrink-0">
                          <Layers className="size-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate">{group.name}</p>
                          <p className="text-xs text-slate-500">{formatCurrency(group.amount)}/parcela · {group.total}x</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-semibold text-slate-400 tabular-nums">{group.paidCount}/{group.total}</span>
                          <ChevronDown className="size-4 text-slate-600 transition-transform duration-200 group-open/det:rotate-180" />
                        </div>
                      </summary>
                      <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/5 pt-3">
                        <div className="flex flex-col gap-1.5">
                          <Progress value={group.paidCount} max={group.total} variant="brand" size="sm" />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">{pct}% pago</span>
                            <span className="text-xs text-slate-500">Próxima: {formatDate(group.nextDue.dueDate)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          {group.items.map((inst) => {
                            const s = classifyBillStatus(inst.dueDate, inst.isPaid)
                            return (
                              <div key={inst.id} className={`flex items-center justify-between gap-2 py-1.5 ${inst.isPaid ? 'opacity-40' : ''}`}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs tabular-nums text-slate-600 w-7 shrink-0">{inst.installmentCurrent}ª</span>
                                  <span className="text-xs text-slate-500">{formatDate(inst.dueDate)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <Badge variant={inst.isPaid ? 'success' : s === 'overdue' || s === 'urgent' ? 'danger' : 'default'} size="sm">
                                    {inst.isPaid ? 'Pago' : s === 'overdue' ? 'Atrasado' : s === 'urgent' ? 'Urgente' : 'Pendente'}
                                  </Badge>
                                  <EditBillModal bill={inst} categories={categories} />
                                  <MarkBillPaidButton id={inst.id} isPaid={inst.isPaid} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <DeleteBillGroupButton groupId={group.groupId} />
                      </div>
                    </details>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          </div>
        </>
      )}

      {/* ── Pagas ───────────────────────────────────────────── */}
      {paid.length > 0 && (
        <>
          <div className="border-t border-white/6" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-success shrink-0" />
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Check className="size-4 text-success" /> Pagas
              </h2>
            </div>
          <Card padding="none">
            <CardContent>
              <div className="divide-y divide-white/5">
                {paid.map((bill) => (
                  <div key={bill.id} className="flex items-center gap-4 px-5 py-4 opacity-60 group hover:bg-ink-600/20 transition-colors">
                    <div className="size-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
                      <Check className="size-4 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-400 truncate">{bill.name}</p>
                      <p className="text-xs text-slate-600">
                        {bill.category?.name ?? 'Sem categoria'} · {formatDate(bill.dueDate)}
                        {bill.recurringBillId && <span className="ml-1 text-brand-600">↻ fixa</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 tabular-nums">{formatCurrency(bill.amount)}</span>
                      <Badge variant="success" size="sm">Pago</Badge>
                      <MarkBillPaidButton id={bill.id} isPaid={bill.isPaid} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
        </>
      )}

      {/* ── Histórico de parcelamentos ──────────────────────── */}
      {completedGroups.length > 0 && (
        <>
          <div className="border-t border-white/6" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-slate-600 shrink-0" />
              <h2 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Archive className="size-4 text-slate-500" /> Histórico de parcelamentos
              </h2>
            </div>
          <Card padding="none">
            <CardContent>
              <div className="divide-y divide-white/5">
                {completedGroups.map((group) => (
                  <div key={group.groupId} className="flex items-center gap-4 px-5 py-4 opacity-50 hover:opacity-80 transition-opacity group">
                    <div className="size-9 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                      <Check className="size-4 text-success" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-400 truncate">{group.name}</p>
                      <p className="text-xs text-slate-600">{group.total}x de {formatCurrency(group.amount)} · quitado</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-slate-400 tabular-nums">{formatCurrency(group.grandTotal)}</span>
                      <Badge variant="success" size="sm">{group.total}/{group.total}</Badge>
                      <DeleteInstallmentGroupButton groupId={group.groupId} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          </div>
        </>
      )}
    </div>
  )
}
