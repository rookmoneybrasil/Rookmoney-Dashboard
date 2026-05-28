'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSession, createSession, deleteSession } from '@/lib/auth'
import { UpdateProfileSchema, ChangePasswordSchema } from '@/lib/validations/settings'
import bcrypt from 'bcryptjs'

export async function updateProfile(
  _state: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const validated = UpdateProfileSchema.safeParse({
    name:  formData.get('name'),
    email: formData.get('email'),
  })
  if (!validated.success) {
    return { error: validated.error.flatten().formErrors[0] ?? 'Dados inválidos.' }
  }

  const { name, email } = validated.data

  // Check email uniqueness if changed
  if (email !== session.email) {
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return { error: 'Este e-mail já está em uso.' }
  }

  await db.user.update({
    where: { id: session.userId },
    data:  { name, email },
  })

  // Refresh session cookie with new name/email
  await createSession(session.userId, name, email)

  revalidatePath('/settings')
  return { success: true }
}

export async function changePassword(
  _state: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const validated = ChangePasswordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword:     formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!validated.success) {
    const errs = validated.error.flatten()
    const first = [...(errs.formErrors ?? []), ...Object.values(errs.fieldErrors ?? {}).flat()][0]
    return { error: first ?? 'Dados inválidos.' }
  }

  const user = await db.user.findUnique({ where: { id: session.userId } })
  if (!user) redirect('/login')

  if (!user.password) return { error: 'Conta sem senha definida (use OAuth).' }
  const ok = await bcrypt.compare(validated.data.currentPassword, user.password)
  if (!ok) return { error: 'Senha atual incorreta.' }

  const hashed = await bcrypt.hash(validated.data.newPassword, 12)
  await db.user.update({ where: { id: session.userId }, data: { password: hashed } })

  return { success: true }
}

export async function deleteAccount(): Promise<void> {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.user.delete({ where: { id: session.userId } })
  await deleteSession()
  redirect('/')
}

export async function getProfile() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await db.user.findUnique({
    where:  { id: session.userId },
    select: { id: true, name: true, email: true, createdAt: true },
  })
  if (!user) redirect('/login')
  return user
}
