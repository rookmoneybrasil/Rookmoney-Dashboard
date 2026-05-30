import { Check, Clock, AlertCircle, Layers, ChevronDown, Archive, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate, classifyBillStatus } from '@/lib/utils'
import { serverApi } from '@/lib/api-client'
import { DeleteBillButton, DeleteBillGroupButton, DeleteInstallmentGroupButton, MarkBillPaidButton } from '@/components/ui/delete-buttons'
import { BillModal } from '@/components/bills/bill-modal'
import { EditBillModal } from '@/components/bills/edit-bill-modal'

const statusConfig = {
  paid:    { label: 'Pago',     variant: 'success' as const, icon: Check       },
  pending: { label: 'Pendente', variant: 'default' as const, icon: Clock       },
  urgent:  { label: 'Urgente',  variant: 'warning' as const, icon: AlertCircle },
  overdue: { label: 'Atrasado', variant: 'danger'  as const, icon: AlertCircle },
}

export default async function BillsPage() {
  const [bills, categories] = await Promise.all([serverApi.bills(), serverApi.categories()])

  /* ── Split installment groups from regular bills ── */
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
    const totalPaid = paidCount * items[0].amount
    const grandTotal = total * items[0].amount
    return { items: sorted, paidCount, total, nextDue, name: items[0].name, amount: items[0].amount, groupId: items[0].installmentGroupId!, totalPaid, grandTotal }
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

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Contas a pagar</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {pending.length + activeGroups.length} pendente{pending.length + activeGroups.length !== 1 ? 's' : ''} ·{' '}
            {paid.length} paga{paid.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-slate-600 mt-1 max-w-md">Cadastre boletos, parcelas e contas fixas. Ao marcar como paga, uma despesa é gerada automaticamente. Contas recorrentes criam o próximo mês sozinhas.</p>
        </div>
        <BillModal categories={categories} />
      </div>

      {/* Summary */}
      {bills.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Card variant="outline" padding="sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-slate-500">A pagar</span>
              <span className="text-xl font-bold text-danger tabular-nums">{formatCurrency(totalPending)}</span>
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
      )}

      {bills.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <div className="size-14 rounded-2xl bg-ink-700 border border-ink-600 flex items-center justify-center text-slate-600">
            <FileText className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-slate-300 text-sm font-medium">Nenhuma conta cadastrada</p>
            <p className="text-slate-600 text-xs max-w-xs">Adicione boletos, parcelas e contas fixas para nunca mais perder um vencimento.</p>
          </div>
          <BillModal categories={categories} />
        </div>
      )}

      {/* ── Active installment groups ──────────────────────── */}
      {activeGroups.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Layers className="size-3.5" />
            Parceladas
          </h2>
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
                          <span className="text-xs font-semibold text-slate-400 tabular-nums">
                            {group.paidCount}/{group.total}
                          </span>
                          <ChevronDown className="size-4 text-slate-600 transition-transform duration-200 group-open/det:rotate-180" />
                        </div>
                      </summary>

                      {/* Collapsible content */}
                      <div className="px-4 pb-4 flex flex-col gap-3 border-t border-white/5 pt-3">
                        {/* Progress */}
                        <div className="flex flex-col gap-1.5">
                          <Progress value={group.paidCount} max={group.total} variant="brand" size="sm" />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-600">{pct}% pago</span>
                            <span className="text-xs text-slate-500">Próxima: {formatDate(group.nextDue.dueDate)}</span>
                          </div>
                        </div>

                        {/* Installment list */}
                        <div className="flex flex-col gap-0.5">
                          {group.items.map((inst) => {
                            const s = classifyBillStatus(inst.dueDate, inst.isPaid)
                            return (
                              <div key={inst.id} className={`flex items-center justify-between gap-2 py-1.5 group/inst ${inst.isPaid ? 'opacity-40' : ''}`}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-xs tabular-nums text-slate-600 w-7 shrink-0">{inst.installmentCurrent}ª</span>
                                  <span className="text-xs text-slate-500">{formatDate(inst.dueDate)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <Badge
                                    variant={inst.isPaid ? 'success' : s === 'overdue' || s === 'urgent' ? 'danger' : 'default'}
                                    size="sm"
                                  >
                                    {inst.isPaid ? 'Pago' : s === 'overdue' ? 'Atrasado' : s === 'urgent' ? 'Urgente' : 'Pendente'}
                                  </Badge>
                                  <EditBillModal bill={inst} categories={categories} />
                                  <MarkBillPaidButton id={inst.id} isPaid={inst.isPaid} />
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Cancel group */}
                        <DeleteBillGroupButton groupId={group.groupId} />
                      </div>
                    </details>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Regular pending bills ───────────────────────────── */}
      {pending.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendentes</h2>
          <Card padding="none">
            <CardContent>
              <div className="divide-y divide-white/5">
                {pending.map((bill) => {
                  const status = classifyBillStatus(bill.dueDate, bill.isPaid)
                  const cfg    = statusConfig[status]
                  const Icon   = cfg.icon
                  return (
                    <div key={bill.id} className="flex items-center gap-4 px-5 py-4 hover:bg-ink-600/30 transition-colors group">
                      <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                        status === 'overdue' || status === 'urgent' ? 'bg-danger/10 text-danger' : 'bg-ink-600 text-slate-500'
                      }`}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-slate-200 truncate">{bill.name}</p>
                          {bill.isRecurring && <span className="text-xs text-slate-600 shrink-0">↻ mensal</span>}
                        </div>
                        <p className="text-xs text-slate-500">
                          {bill.category?.name ?? 'Sem categoria'} · vence {formatDate(bill.dueDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold text-slate-200 tabular-nums">{formatCurrency(bill.amount)}</span>
                          <Badge variant={cfg.variant} size="sm" dot>{cfg.label}</Badge>
                        </div>
                        <EditBillModal bill={bill} categories={categories} />
                        <MarkBillPaidButton id={bill.id} isPaid={bill.isPaid} />
                        <DeleteBillButton id={bill.id} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Paid regular bills ─────────────────────────────── */}
      {paid.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pagas</h2>
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
                        {bill.isRecurring && <span className="ml-1 text-brand-500">↻ mensal</span>}
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
      )}

      {/* ── Completed installment groups (history) ─────────── */}
      {completedGroups.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Archive className="size-3.5" />
            Histórico de parcelamentos
          </h2>
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
                      <p className="text-xs text-slate-600">
                        {group.total}x de {formatCurrency(group.amount)} · quitado
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-slate-400 tabular-nums">
                        {formatCurrency(group.grandTotal)}
                      </span>
                      <Badge variant="success" size="sm">{group.total}/{group.total}</Badge>
                      <DeleteInstallmentGroupButton groupId={group.groupId} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
