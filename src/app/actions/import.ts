'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { parseISO, isValid } from 'date-fns'

type ImportRow = {
  date: string
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  categoryId: string
}

export type ImportResult = {
  success?: number
  error?: string
}

export async function importTransactions(rows: ImportRow[]): Promise<ImportResult> {
  const session = await getSession()
  if (!session) redirect('/login')

  if (!rows.length) {
    return { error: 'Nenhuma transação para importar.' }
  }

  // Validate each row minimally
  const validated: Array<{
    userId: string
    date: Date
    description: string
    amount: number
    type: 'INCOME' | 'EXPENSE'
    categoryId: string
  }> = []

  for (const row of rows) {
    const parsedDate = parseISO(row.date)
    if (!isValid(parsedDate)) continue
    if (!row.categoryId) continue
    if (typeof row.amount !== 'number' || isNaN(row.amount) || row.amount <= 0) continue

    validated.push({
      userId: session.userId,
      date: parsedDate,
      description: row.description || 'Importado via CSV',
      amount: row.amount,
      type: row.type,
      categoryId: row.categoryId,
    })
  }

  if (!validated.length) {
    return { error: 'Nenhuma transação válida encontrada. Verifique o mapeamento de colunas.' }
  }

  await db.transaction.createMany({ data: validated })

  revalidatePath('/dashboard')
  revalidatePath('/transactions')
  revalidatePath('/reports')

  return { success: validated.length }
}
