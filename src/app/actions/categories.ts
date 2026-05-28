'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { CategorySchema } from '@/lib/validations/category'
import { checkFreeLimit } from '@/lib/plan'

export async function getCategories() {
  const session = await getSession()
  if (!session) redirect('/login')

  return db.category.findMany({
    where: {
      OR: [
        { isDefault: true },
        { userId: session.userId },
      ],
    },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
  })
}

export async function createCategory(
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const limitErr = await checkFreeLimit(session.userId, 'categories')
  if (limitErr) return { error: limitErr }

  const validated = CategorySchema.safeParse({
    name:  formData.get('name'),
    icon:  formData.get('icon'),
    color: formData.get('color'),
  })
  if (!validated.success) {
    return { error: validated.error.flatten().formErrors[0] ?? 'Dados inválidos.' }
  }

  await db.category.create({
    data: { ...validated.data, userId: session.userId },
  })

  revalidatePath('/categories')
  revalidatePath('/transactions')
  return {}
}

export async function updateCategory(
  id: string,
  _state: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const validated = CategorySchema.safeParse({
    name:  formData.get('name'),
    icon:  formData.get('icon'),
    color: formData.get('color'),
  })
  if (!validated.success) {
    return { error: validated.error.flatten().formErrors[0] ?? 'Dados inválidos.' }
  }

  await db.category.updateMany({
    where: { id, userId: session.userId },
    data:  validated.data,
  })

  revalidatePath('/categories')
  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  return {}
}

export async function deleteCategory(id: string) {
  const session = await getSession()
  if (!session) redirect('/login')

  await db.category.deleteMany({ where: { id, userId: session.userId } })

  revalidatePath('/categories')
  revalidatePath('/transactions')
}
