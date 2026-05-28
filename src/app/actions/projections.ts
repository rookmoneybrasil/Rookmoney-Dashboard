'use server'

import { redirect } from 'next/navigation'
import { startOfMonth, endOfMonth, addMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export type ProjectionItem = {
  id:          string
  label:       string
  amount:      number
  sublabel?:   string
  icon?:       string
}

export type MonthProjection = {
  month:            string   // 'yyyy-MM'
  label:            string   // 'jun. 26'
  income:           number
  expense:          number
  balance:          number   // monthly net (income - expense)
  cumulativeBalance: number  // running total from current real balance
  incomeItems: {
    sources:    ProjectionItem[]   // IncomeSource recorrentes
    recurring:  ProjectionItem[]   // RecurringTransaction INCOME
    people:     ProjectionItem[]   // PersonEntry THEY_OWE_ME
  }
  expenseItems: {
    bills:      ProjectionItem[]   // Bills (parcelas + recorrentes)
    recurring:  ProjectionItem[]   // RecurringTransaction EXPENSE
    people:     ProjectionItem[]   // PersonEntry I_OWE_THEM
  }
}

export async function getProjections(monthsAhead = 5): Promise<MonthProjection[]> {
  const session = await getSession()
  if (!session) redirect('/login')

  const { userId } = session
  const now         = new Date()
  const futureEnd   = endOfMonth(addMonths(now, monthsAhead))
  const futureStart = startOfMonth(addMonths(now, 1))

  const [
    recurringIncomeSources,
    monthlyRecurringTxs,
    recurringBills,
    futureBills,
    futurePersonEntries,
    allTransactions,
  ] = await Promise.all([
    db.incomeSource.findMany({ where: { userId, isRecurring: true } }),
    db.recurringTransaction.findMany({
      where:   { userId, isActive: true, frequency: 'MONTHLY' },
      include: { category: true },
    }),
    db.bill.findMany({ where: { userId, isRecurring: true, isPaid: false } }),
    db.bill.findMany({
      where:   { userId, isPaid: false, dueDate: { gte: futureStart, lte: futureEnd } },
      include: { category: true },
      orderBy: { dueDate: 'asc' },
    }),
    db.personEntry.findMany({
      where:   { userId, isSettled: false, date: { gte: futureStart, lte: futureEnd } },
      include: { person: { select: { id: true, name: true, color: true } } },
      orderBy: { date: 'asc' },
    }),
    // All-time transactions to compute current real balance
    db.transaction.findMany({
      where:  { userId, date: { lte: now } },
      select: { type: true, amount: true },
    }),
  ])

  // Current real balance (all-time income minus expenses up to today)
  const startingBalance = allTransactions.reduce((s, t) =>
    s + (t.type === 'INCOME' ? Number(t.amount) : -Number(t.amount)), 0)

  // Fixed items repeated every month
  const fixedIncomeSourceItems: ProjectionItem[] = recurringIncomeSources.map(s => ({
    id:    s.id,
    label: s.name,
    amount: Number(s.amount),
    sublabel: s.type === 'EMPLOYMENT' ? 'Emprego/PJ'
            : s.type === 'FREELANCE'  ? 'Freelance'
            : s.type === 'RENTAL'     ? 'Aluguel'
            : 'Outro',
    icon: s.type === 'EMPLOYMENT' ? '💼' : s.type === 'FREELANCE' ? '🧑‍💻' : s.type === 'RENTAL' ? '🏠' : '💡',
  }))

  const fixedRecurringTxIncome: ProjectionItem[] = monthlyRecurringTxs
    .filter(t => t.type === 'INCOME')
    .map(t => ({ id: t.id, label: t.name, amount: Number(t.amount), sublabel: 'Recorrência', icon: t.category.icon }))

  const fixedRecurringTxExpense: ProjectionItem[] = monthlyRecurringTxs
    .filter(t => t.type === 'EXPENSE')
    .map(t => ({ id: t.id, label: t.name, amount: Number(t.amount), sublabel: 'Recorrência', icon: t.category.icon }))

  // Recurring bill names to estimate unspawned months
  const recurringBillsByName = new Map<string, { amount: number; categoryIcon: string | null }>()
  for (const b of recurringBills) {
    if (!recurringBillsByName.has(b.name)) {
      recurringBillsByName.set(b.name, { amount: Number(b.amount), categoryIcon: null })
    }
  }

  let runningBalance = startingBalance

  return Array.from({ length: monthsAhead }, (_, i) => {
    const d     = addMonths(now, i + 1)
    const start = startOfMonth(d)
    const end   = endOfMonth(d)

    // Bills for this month (already in DB)
    const spawnedBills = futureBills.filter(b => {
      const due = new Date(b.dueDate)
      return due >= start && due <= end
    })
    const spawnedNames = new Set(spawnedBills.filter(b => b.isRecurring).map(b => b.name))

    const billItems: ProjectionItem[] = spawnedBills.map(b => ({
      id:       b.id,
      label:    b.name,
      amount:   Number(b.amount),
      sublabel: b.installmentTotal
        ? `Parcela ${b.installmentCurrent}/${b.installmentTotal}`
        : b.isRecurring ? 'Recorrente' : 'Avulsa',
      icon: b.category?.icon ?? '📄',
    }))

    // Recurring bills not yet spawned for this month
    for (const [name, { amount }] of recurringBillsByName) {
      if (!spawnedNames.has(name)) {
        billItems.push({
          id:       `est-${name}-${i}`,
          label:    name,
          amount,
          sublabel: 'Recorrente (estimado)',
          icon:     '📄',
        })
      }
    }

    // Person entries
    const personIncomeItems: ProjectionItem[] = futurePersonEntries
      .filter(e => e.type === 'THEY_OWE_ME' && new Date(e.date) >= start && new Date(e.date) <= end)
      .map(e => ({
        id:       e.id,
        label:    e.person.name,
        amount:   Number(e.amount),
        sublabel: e.description.replace(/\s*\(\d+\/\d+\)$/, ''),  // strip "(X/Y)"
        icon:     '👤',
      }))

    const personExpenseItems: ProjectionItem[] = futurePersonEntries
      .filter(e => e.type === 'I_OWE_THEM' && new Date(e.date) >= start && new Date(e.date) <= end)
      .map(e => ({
        id:       e.id,
        label:    e.person.name,
        amount:   Number(e.amount),
        sublabel: e.description.replace(/\s*\(\d+\/\d+\)$/, ''),
        icon:     '👤',
      }))

    const income  = fixedIncomeSourceItems.reduce((s, i) => s + i.amount, 0)
                  + fixedRecurringTxIncome.reduce((s, i) => s + i.amount, 0)
                  + personIncomeItems.reduce((s, i) => s + i.amount, 0)

    const expense = billItems.reduce((s, i) => s + i.amount, 0)
                  + fixedRecurringTxExpense.reduce((s, i) => s + i.amount, 0)
                  + personExpenseItems.reduce((s, i) => s + i.amount, 0)

    const monthlyNet = income - expense
    runningBalance  += monthlyNet

    return {
      month:            format(d, 'yyyy-MM'),
      label:            format(d, "MMM 'yy", { locale: ptBR }),
      income,
      expense,
      balance:          monthlyNet,
      cumulativeBalance: runningBalance,
      incomeItems: {
        sources:   fixedIncomeSourceItems,
        recurring: fixedRecurringTxIncome,
        people:    personIncomeItems,
      },
      expenseItems: {
        bills:     billItems,
        recurring: fixedRecurringTxExpense,
        people:    personExpenseItems,
      },
    }
  })
}
