'use server'

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

export async function submitFeedback(
  _state: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const type  = formData.get('type') as string
  const title = (formData.get('title') as string)?.trim()
  const body  = (formData.get('body')  as string)?.trim()

  if (!['bug', 'suggestion'].includes(type)) return { error: 'Tipo inválido.' }
  if (!title) return { error: 'Título obrigatório.' }
  if (!body)  return { error: 'Descrição obrigatória.' }

  await db.feedback.create({
    data: { type, title, body, userId: session.userId },
  })

  return { success: true }
}
