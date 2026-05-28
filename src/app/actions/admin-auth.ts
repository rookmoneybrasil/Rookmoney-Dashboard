'use server'

import { redirect } from 'next/navigation'
import { createAdminSession, deleteAdminSession } from '@/lib/admin-auth'

export async function adminLogin(formData: FormData): Promise<{ error: string } | void> {
  const password = (formData.get('password') as string)?.trim()

  if (!password) return { error: 'Informe a senha.' }

  const secret = process.env.ADMIN_SECRET
  if (!secret) return { error: 'Backoffice não configurado (ADMIN_SECRET ausente).' }

  if (password !== secret) {
    // Small delay to prevent brute-force
    await new Promise(r => setTimeout(r, 800))
    return { error: 'Senha incorreta.' }
  }

  await createAdminSession()
  redirect('/admin')
}

export async function adminLogout() {
  await deleteAdminSession()
  redirect('/admin-login')
}
