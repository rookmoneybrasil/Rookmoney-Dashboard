'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { getLimits } from '@/lib/plans'
import { resolveDefaultAccountId } from '@/lib/account'
import { parseISO, isValid, format } from 'date-fns'

type ImportRow = {
  date: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
}

export type ImportResult = {
  success?: number
  skipped?: number
  error?: string
}

// Normalize common type strings from CSV → INCOME | EXPENSE | null
function normalizeType(raw: string): 'INCOME' | 'EXPENSE' | null {
  const v = raw.trim().toUpperCase()
  if (['INCOME', 'RECEITA', 'ENTRADA', 'C', 'CR', '+'].includes(v)) return 'INCOME'
  if (['EXPENSE', 'DESPESA', 'SAÍDA', 'SAIDA', 'D', 'DB', '-'].includes(v)) return 'EXPENSE'
  return null
}

export async function importTransactions(rows: ImportRow[]): Promise<ImportResult> {
  const session = await getSession()
  if (!session) redirect('/login')

  // Bug 1 fix: enforce plan check in the server action itself
  const user = await db.user.findUnique({ where: { id: session.userId }, select: { plan: true } })
  const limits = getLimits(user?.plan ?? 'FREE')
  if (!limits.import) return { error: 'Importação de CSV é exclusiva do plano PRO.' }

  if (!rows.length) return { error: 'Nenhuma transação para importar.' }

  // Toda Transaction precisa de accountId, senão o valor importado entra no
  // "Receitas/Despesas do mês" e some do saldo das Carteiras.
  const accountId = await resolveDefaultAccountId(session.userId)

  const validated: Array<{
    userId:      string
    date:        Date
    description: string
    amount:      number
    type:        'INCOME' | 'EXPENSE'
    categoryId:  string
    accountId:   string
  }> = []

  // Bug 3 fix: build a fingerprint set to skip exact duplicates in the batch
  const batchSeen = new Set<string>()

  for (const row of rows) {
    const parsedDate = parseISO(row.date)
    if (!isValid(parsedDate)) continue
    if (!row.categoryId) continue
    if (typeof row.amount !== 'number' || isNaN(row.amount) || row.amount <= 0) continue

    // Bug 2 fix: validate + normalize type — don't pass arbitrary strings to Prisma
    const normalizedType = normalizeType(String(row.type ?? ''))
    if (!normalizedType) continue

    // Bug 3 fix: skip if same date+description+amount+type already in this batch
    const fingerprint = `${format(parsedDate, 'yyyy-MM-dd')}|${row.description}|${row.amount}|${normalizedType}`
    if (batchSeen.has(fingerprint)) continue
    batchSeen.add(fingerprint)

    // Bug 3 fix: also skip if already exists in the database (same fingerprint)
    const existing = await db.transaction.findFirst({
      where: {
        userId:      session.userId,
        date:        { gte: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()), lte: new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 23, 59, 59) },
        description: row.description || 'Importado via CSV',
        type:        normalizedType,
      },
      select: { id: true },
    })
    if (existing) continue

    validated.push({
      userId:      session.userId,
      date:        parsedDate,
      description: row.description || 'Importado via CSV',
      amount:      row.amount,
      type:        normalizedType,
      categoryId:  row.categoryId,
      accountId,
    })
  }


  if (!validated.length) {
    return { error: 'Nenhuma transação nova encontrada. Possíveis motivos: formato inválido, tipo não reconhecido, ou transações já existentes.' }
  }

  await db.transaction.createMany({ data: validated })

  revalidatePath('/dashboard')
  revalidatePath('/transactions')
  revalidatePath('/reports')

  return { success: validated.length, skipped: rows.length - validated.length }
}
