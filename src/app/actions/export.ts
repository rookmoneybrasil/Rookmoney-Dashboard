'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function exportUserData() {
  const session = await getSession()
  if (!session) redirect('/login')

  const { userId } = session

  const [
    transactions,
    categories,
    goals,
    bills,
    budgets,
    incomeSources,
    recurringTransactions,
    people,
    personEntries,
  ] = await Promise.all([
    db.transaction.findMany({
      where:   { userId },
      include: { category: { select: { name: true, icon: true } } },
      orderBy: { date: 'desc' },
    }),
    db.category.findMany({
      where:   { userId },
      orderBy: { name: 'asc' },
    }),
    db.goal.findMany({
      where:   { userId },
      include: { contributions: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.bill.findMany({
      where:   { userId },
      include: { category: { select: { name: true, icon: true } } },
      orderBy: { dueDate: 'asc' },
    }),
    db.budget.findMany({
      where:   { userId },
      include: { category: { select: { name: true } } },
      orderBy: { month: 'desc' },
    }),
    db.incomeSource.findMany({
      where:   { userId },
      orderBy: { name: 'asc' },
    }),
    db.recurringTransaction.findMany({
      where:   { userId },
      include: { category: { select: { name: true, icon: true } } },
      orderBy: { name: 'asc' },
    }),
    db.person.findMany({
      where:   { userId },
      orderBy: { name: 'asc' },
    }),
    db.personEntry.findMany({
      where:   { userId },
      include: { person: { select: { name: true } } },
      orderBy: { date: 'desc' },
    }),
  ])

  return {
    exportedAt: new Date().toISOString(),
    version:    '1.0',
    user: {
      name:  session.name,
      email: session.email,
    },
    data: {
      transactions:         transactions.map(t => ({
        id: t.id, type: t.type, amount: Number(t.amount),
        description: t.description, date: t.date,
        category: t.category.name,
      })),
      categories:           categories.map(c => ({
        id: c.id, name: c.name, icon: c.icon, color: c.color,
      })),
      goals:                goals.map(g => ({
        id: g.id, name: g.name,
        targetAmount: Number(g.targetAmount), currentAmount: Number(g.currentAmount),
        deadline: g.deadline, isCompleted: g.isCompleted,
        contributions: g.contributions.map(c => ({ amount: Number(c.amount), note: c.note, createdAt: c.createdAt })),
      })),
      bills:                bills.map(b => ({
        id: b.id, name: b.name, amount: Number(b.amount), dueDate: b.dueDate,
        isPaid: b.isPaid, isRecurring: b.isRecurring,
        installmentCurrent: b.installmentCurrent, installmentTotal: b.installmentTotal,
        category: b.category?.name ?? null,
      })),
      budgets:              budgets.map(b => ({
        id: b.id, month: b.month, amount: Number(b.amount), category: b.category.name,
      })),
      incomeSources:        incomeSources.map(s => ({
        id: s.id, name: s.name, type: s.type, amount: Number(s.amount), isRecurring: s.isRecurring,
      })),
      recurringTransactions: recurringTransactions.map(r => ({
        id: r.id, name: r.name, type: r.type, amount: Number(r.amount),
        frequency: r.frequency, isActive: r.isActive, category: r.category.name,
      })),
      people:               people.map(p => ({
        id: p.id, name: p.name, notes: p.notes,
      })),
      personEntries:        personEntries.map(e => ({
        id: e.id, type: e.type, description: e.description,
        amount: Number(e.amount), date: e.date,
        isSettled: e.isSettled, person: e.person.name,
      })),
    },
  }
}
