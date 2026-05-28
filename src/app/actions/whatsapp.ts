'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

function normalizePhone(raw: string): string | null {
  // Accept: (11) 99999-9999 | 11999999999 | +5511999999999 | 5511999999999
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11) return `+55${digits}`          // 11999999999
  if (digits.length === 12) return `+${digits}`            // 5511999999999
  if (digits.length === 13) return `+${digits}`            // 55119...
  return null
}

export async function saveWhatsAppPhone(
  _state: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const raw = (formData.get('phone') as string ?? '').trim()

  if (!raw) {
    // Clear phone
    await db.user.update({
      where: { id: session.userId },
      data:  { whatsappPhone: null },
    })
    revalidatePath('/settings')
    return { success: true }
  }

  const phone = normalizePhone(raw)
  if (!phone) {
    return { error: 'Número inválido. Use o formato: (11) 99999-9999' }
  }

  // Check if number is already used by another account
  const existing = await db.user.findUnique({ where: { whatsappPhone: phone } })
  if (existing && existing.id !== session.userId) {
    return { error: 'Este número já está vinculado a outra conta.' }
  }

  await db.user.update({
    where: { id: session.userId },
    data:  { whatsappPhone: phone },
  })

  revalidatePath('/settings')
  return { success: true }
}

export async function getWhatsAppPhone(): Promise<string | null> {
  const session = await getSession()
  if (!session) return null

  const user = await db.user.findUnique({
    where:  { id: session.userId },
    select: { whatsappPhone: true },
  })
  return user?.whatsappPhone ?? null
}
