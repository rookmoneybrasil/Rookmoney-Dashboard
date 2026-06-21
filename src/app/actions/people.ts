'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { PersonSchema, PersonEntrySchema } from '@/lib/validations/person'
import { parseISO, addMonths } from 'date-fns'
import { randomUUID } from 'crypto'

// ─── Types ───────────────────────────────────────────────────────────────────

export type PersonWithBalance = {
  id:        string
  name:      string
  notes:     string | null
  color:     string | null
  createdAt: Date
  // positive = they owe you; negative = you owe them
  balance:   number
  // unsettled entry count
  openCount: number
}

export type PersonEntryRow = {
  id:                 string
  type:               'THEY_OWE_ME' | 'I_OWE_THEM'
  description:        string
  amount:             number
  date:               Date
  isSettled:          boolean
  settledAt:          Date | null
  notes:              string | null
  installmentTotal:   number | null
  installmentCurrent: number | null
  installmentGroupId: string | null
  categoryId:         string | null
  category:           { id: string; name: string; icon: string; color: string } | null
  createdAt:          Date
}

export type PersonWithEntries = {
  id:        string
  name:      string
  notes:     string | null
  color:     string | null
  createdAt: Date
  entries:   PersonEntryRow[]
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getPeople(): Promise<PersonWithBalance[]> {
  const session = await getSession()
  if (!session) redirect('/login')

  const people = await db.person.findMany({
    where: { userId: session.userId },
    include: { entries: true },
    orderBy: { createdAt: 'desc' },
  })

  return people.map((p) => {
    let balance  = 0
    let openCount = 0
    for (const e of p.entries) {
      if (!e.isSettled) {
        const val = Number(e.amount)
        balance  += e.type === 'THEY_OWE_ME' ? val : -val
        openCount++
      }
    }
    return {
      id:        p.id,
      name:      p.name,
      notes:     p.notes,
      color:     p.color,
      createdAt: p.createdAt,
      balance,
      openCount,
    }
  })
}

export async function getPerson(id: string): Promise<PersonWithEntries | null> {
  const session = await getSession()
  if (!session) redirect('/login')

  const p = await db.person.findFirst({
    where: { id, userId: session.userId },
    include: {
      entries: {
        include: { category: true },
        orderBy: [{ installmentGroupId: 'asc' }, { installmentCurrent: 'asc' }, { date: 'desc' }],
      },
    },
  })

  if (!p) return null

  return {
    id:        p.id,
    name:      p.name,
    notes:     p.notes,
    color:     p.color,
    createdAt: p.createdAt,
    entries: p.entries.map((e) => ({
      id:                 e.id,
      type:               e.type as 'THEY_OWE_ME' | 'I_OWE_THEM',
      description:        e.description,
      amount:             Number(e.amount),
      date:               e.date,
      isSettled:          e.isSettled,
      settledAt:          e.settledAt,
      notes:              e.notes,
      installmentTotal:   e.installmentTotal,
      installmentCurrent: e.installmentCurrent,
      installmentGroupId: e.installmentGroupId,
      categoryId:         e.categoryId,
      category:           e.category
        ? { id: e.category.id, name: e.category.name, icon: e.category.icon, color: e.category.color }
        : null,
      createdAt:          e.createdAt,
    })),
  }
}

// ─── Person CRUD ─────────────────────────────────────────────────────────────

export async function createPerson(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = {
    name:  formData.get('name'),
    notes: formData.get('notes') || undefined,
    color: formData.get('color') || undefined,
  }

  const validated = PersonSchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.flatten().formErrors[0] ?? 'Dados inválidos.' }
  }

  await db.person.create({
    data: { ...validated.data, userId: session.userId },
  })

  revalidatePath('/people')
  return {}
}

export async function updatePerson(
  id: string,
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = {
    name:  formData.get('name'),
    notes: formData.get('notes') || undefined,
    color: formData.get('color') || undefined,
  }

  const validated = PersonSchema.safeParse(raw)
  if (!validated.success) {
    return { error: 'Dados inválidos.' }
  }

  await db.person.updateMany({
    where: { id, userId: session.userId },
    data:  validated.data,
  })

  revalidatePath('/people')
  revalidatePath(`/people/${id}`)
  return {}
}

export async function deletePerson(id: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.person.deleteMany({ where: { id, userId: session.userId } })

  revalidatePath('/people')
}

// ─── Entry CRUD ──────────────────────────────────────────────────────────────

export async function createPersonEntry(
  personId: string,
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  // Verify person ownership
  const person = await db.person.findFirst({ where: { id: personId, userId: session.userId } })
  if (!person) return { error: 'Pessoa não encontrada.' }

  const raw = {
    type:         formData.get('type'),
    description:  formData.get('description'),
    amount:       formData.get('amount'),
    date:         formData.get('date'),
    notes:        formData.get('notes') || undefined,
    installments: formData.get('installments') || 1,
    categoryId:   formData.get('categoryId') || undefined,
  }

  const validated = PersonEntrySchema.safeParse(raw)
  if (!validated.success) {
    return { error: validated.error.flatten().formErrors[0] ?? 'Dados inválidos.' }
  }

  const { installments, categoryId, ...entryBase } = validated.data
  const baseDate = parseISO(entryBase.date)

  if (installments <= 1) {
    // Single entry
    await db.personEntry.create({
      data: {
        type:        entryBase.type,
        description: entryBase.description,
        amount:      entryBase.amount,
        date:        baseDate,
        notes:       entryBase.notes ?? null,
        categoryId:  categoryId ?? null,
        personId,
        userId:      session.userId,
      },
    })
  } else {
    // Multiple installments — each = total / installments, monthly cadence
    const groupId          = randomUUID()
    const baseInstallment  = Math.floor((entryBase.amount / installments) * 100) / 100
    const lastInstallment  = Math.round((entryBase.amount - baseInstallment * (installments - 1)) * 100) / 100

    await db.personEntry.createMany({
      data: Array.from({ length: installments }, (_, i) => ({
        type:               entryBase.type,
        description:        `${entryBase.description} (${i + 1}/${installments})`,
        amount:             i === installments - 1 ? lastInstallment : baseInstallment,
        date:               addMonths(baseDate, i),
        notes:              entryBase.notes ?? null,
        installmentTotal:   installments,
        installmentCurrent: i + 1,
        installmentGroupId: groupId,
        categoryId:         categoryId ?? null,
        personId,
        userId:             session.userId,
      })),
    })
  }

  revalidatePath(`/people/${personId}`)
  revalidatePath('/people')
  return {}
}

export async function settleEntry(entryId: string, personId: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  // Load the full entry
  const entry = await db.personEntry.findFirst({
    where: { id: entryId, userId: session.userId },
  })
  if (!entry || entry.isSettled) return

  // Resolve a categoryId for the auto-transaction:
  // 1) use the entry's own category; 2) fall back to any available category
  let categoryId = entry.categoryId
  if (!categoryId) {
    const fallback = await db.category.findFirst({
      where: { OR: [{ isDefault: true }, { userId: session.userId }] },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    })
    categoryId = fallback?.id ?? null
  }

  const settledAt = new Date()

  if (categoryId) {
    // Create transaction first, then link it to the entry
    const createdTx = await db.transaction.create({
      data: {
        amount:      entry.amount,
        type:        entry.type === 'THEY_OWE_ME' ? 'INCOME' : 'EXPENSE',
        description: entry.description,
        date:        settledAt,
        userId:      session.userId,
        categoryId,
      },
    })
    await db.personEntry.update({
      where: { id: entryId },
      data:  { isSettled: true, settledAt, settledTransactionId: createdTx.id },
    })
  } else {
    // No category available — just settle without a transaction
    await db.personEntry.update({
      where: { id: entryId },
      data:  { isSettled: true, settledAt },
    })
  }

  revalidatePath(`/people/${personId}`)
  revalidatePath('/people')
  revalidatePath('/dashboard')
  revalidatePath('/transactions')
}

export async function unsettleEntry(entryId: string, personId: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  const entry = await db.personEntry.findFirst({
    where: { id: entryId, userId: session.userId },
  })
  if (!entry) return

  // Delete the auto-created transaction first (if exists)
  if (entry.settledTransactionId) {
    await db.transaction.deleteMany({
      where: { id: entry.settledTransactionId, userId: session.userId },
    })
  }

  await db.personEntry.update({
    where: { id: entryId },
    data:  { isSettled: false, settledAt: null, settledTransactionId: null },
  })

  revalidatePath(`/people/${personId}`)
  revalidatePath('/people')
  revalidatePath('/dashboard')
  revalidatePath('/transactions')
}

export async function deleteEntry(entryId: string, personId: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.personEntry.deleteMany({ where: { id: entryId, userId: session.userId } })

  revalidatePath(`/people/${personId}`)
  revalidatePath('/people')
}
