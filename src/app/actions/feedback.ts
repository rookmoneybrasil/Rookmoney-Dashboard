'use server'

import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024 // 2 MB (base64 is ~33% larger, so raw file limit is ~1.5 MB)

export async function submitFeedback(
  _state: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const type      = formData.get('type')      as string
  const title     = (formData.get('title')     as string)?.trim()
  const body      = (formData.get('body')      as string)?.trim()
  const imageData = (formData.get('imageData') as string) || null

  if (!['bug', 'suggestion'].includes(type)) return { error: 'Tipo inválido.' }
  if (!title) return { error: 'Título obrigatório.' }
  if (!body)  return { error: 'Descrição obrigatória.' }
  if (imageData && imageData.length > MAX_IMAGE_BYTES * 1.4)
    return { error: 'Imagem muito grande. Máximo 2 MB.' }

  await db.feedback.create({
    data: { type, title, body, userId: session.userId, imageData },
  })

  return { success: true }
}
