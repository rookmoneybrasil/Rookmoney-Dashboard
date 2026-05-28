'use server'

import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { createSession, deleteSession } from '@/lib/auth'
import { LoginSchema, RegisterSchema } from '@/lib/validations/auth'
import { sendPasswordResetEmail } from '@/lib/email'
import type { AuthFormState } from '@/types'

export async function login(state: AuthFormState | undefined, formData: FormData): Promise<AuthFormState> {
  const raw = {
    email:    formData.get('email')    as string,
    password: formData.get('password') as string,
  }
  const rememberMe = formData.get('remember') === 'on'
  const from = (formData.get('from') as string | null)?.trim() ?? ''
  // Only allow internal redirects (starts with /)
  const redirectTo = from.startsWith('/') && !from.startsWith('//') ? from : '/dashboard'

  const validated = LoginSchema.safeParse(raw)
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  let user
  try {
    user = await db.user.findUnique({ where: { email: validated.data.email } })
  } catch {
    return { message: 'Erro ao conectar ao banco de dados.' }
  }

  if (!user) return { message: 'E-mail ou senha incorretos.' }

  // OAuth-only user (no password set)
  if (!user.password) {
    return { message: 'Esta conta usa login pelo Google. Clique em "Entrar com Google".' }
  }

  const valid = await bcrypt.compare(validated.data.password, user.password)
  if (!valid) return { message: 'E-mail ou senha incorretos.' }

  await createSession(user.id, user.name, user.email, rememberMe)
  redirect(redirectTo)
}

export async function register(state: AuthFormState | undefined, formData: FormData): Promise<AuthFormState> {
  const raw = {
    name:     formData.get('name')     as string,
    email:    formData.get('email')    as string,
    password: formData.get('password') as string,
  }

  const validated = RegisterSchema.safeParse(raw)
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  let existing
  try {
    existing = await db.user.findUnique({ where: { email: validated.data.email } })
  } catch {
    return { message: 'Erro ao conectar ao banco de dados.' }
  }

  if (existing) return { message: 'Este e-mail já está cadastrado.' }

  const hashedPassword = await bcrypt.hash(validated.data.password, 12)

  const user = await db.user.create({
    data: {
      name:     validated.data.name,
      email:    validated.data.email,
      password: hashedPassword,
    },
  })

  await createSession(user.id, user.name, user.email)
  redirect('/onboarding')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

// ─── Forgot / Reset Password ─────────────────────────────────────────

export async function requestPasswordReset(
  _state: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  if (!email) return { error: 'Informe seu e-mail.' }

  const user = await db.user.findUnique({ where: { email } })

  // Always return success to avoid email enumeration
  if (user) {
    const token   = randomBytes(32).toString('hex')
    const expiry  = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    await db.user.update({
      where: { id: user.id },
      data:  { passwordResetToken: token, passwordResetExpiry: expiry },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
    await sendPasswordResetEmail(user.email, user.name, resetUrl)
  }

  return { success: true }
}

export async function resetPassword(
  _state: { error?: string; success?: boolean } | undefined,
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const token    = formData.get('token')    as string
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm')  as string

  if (!token)    return { error: 'Token inválido.' }
  if (!password || password.length < 8) return { error: 'Senha deve ter no mínimo 8 caracteres.' }
  if (password !== confirm) return { error: 'As senhas não coincidem.' }

  const user = await db.user.findFirst({
    where: {
      passwordResetToken:  token,
      passwordResetExpiry: { gt: new Date() },
    },
  })

  if (!user) return { error: 'Link inválido ou expirado. Solicite um novo.' }

  const hashed = await bcrypt.hash(password, 12)

  await db.user.update({
    where: { id: user.id },
    data:  { password: hashed, passwordResetToken: null, passwordResetExpiry: null },
  })

  redirect('/login?reset=1')
}
