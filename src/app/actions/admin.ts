'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'

// ─── Auth guard ────────────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getSession()
  if (!session) redirect('/login')
  const user = await db.user.findUnique({ where: { id: session.userId }, select: { isAdmin: true } })
  if (!user?.isAdmin) redirect('/dashboard')
  return session
}

// ─── Dashboard KPIs ────────────────────────────────────────────────────────────

export async function getAdminStats() {
  await requireAdmin()

  const now      = new Date()
  const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo  = new Date(today.getTime() - 7  * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalUsers,
    proUsers,
    newToday,
    newThisWeek,
    newThisMonth,
    totalTransactions,
    transactionsThisMonth,
    totalGoals,
    recentUsers,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { plan: 'PRO' } }),
    db.user.count({ where: { createdAt: { gte: today } } }),
    db.user.count({ where: { createdAt: { gte: weekAgo } } }),
    db.user.count({ where: { createdAt: { gte: monthStart } } }),
    db.transaction.count(),
    db.transaction.count({ where: { createdAt: { gte: monthStart } } }),
    db.goal.count({ where: { isCompleted: false } }),
    db.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, name: true, email: true, plan: true, createdAt: true },
    }),
  ])

  const MRR_PRO = 14.90
  const mrr = proUsers * MRR_PRO

  return {
    totalUsers,
    proUsers,
    freeUsers: totalUsers - proUsers,
    proRate: totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100) : 0,
    newToday,
    newThisWeek,
    newThisMonth,
    mrr,
    totalTransactions,
    transactionsThisMonth,
    totalGoals,
    recentUsers,
  }
}

// ─── Users list ────────────────────────────────────────────────────────────────

export async function getAdminUsers({
  search = '',
  plan   = '',
  page   = 1,
  pageSize = 20,
}: {
  search?:   string
  plan?:     string
  page?:     number
  pageSize?: number
} = {}) {
  await requireAdmin()

  const where: Record<string, unknown> = {}
  if (plan === 'PRO' || plan === 'FREE') where.plan = plan
  if (search.trim()) {
    where.OR = [
      { name:  { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
      select: {
        id:          true,
        name:        true,
        email:       true,
        plan:        true,
        isAdmin:     true,
        hasOnboarded: true,
        createdAt:   true,
        _count: {
          select: { transactions: true, goals: true, bills: true },
        },
      },
    }),
    db.user.count({ where }),
  ])

  return { users, total, totalPages: Math.ceil(total / pageSize), page }
}

// ─── User detail ───────────────────────────────────────────────────────────────

export async function getAdminUser(id: string) {
  await requireAdmin()

  const user = await db.user.findUnique({
    where: { id },
    select: {
      id:                  true,
      name:                true,
      email:               true,
      plan:                true,
      isAdmin:             true,
      hasOnboarded:        true,
      whatsappPhone:       true,
      stripeCustomerId:    true,
      stripeSubscriptionId: true,
      createdAt:           true,
      updatedAt:           true,
      _count: {
        select: {
          transactions: true,
          goals:        true,
          bills:        true,
          budgets:      true,
          people:       true,
          incomeSources: true,
        },
      },
    },
  })

  if (!user) return null

  const recentTransactions = await db.transaction.findMany({
    where:   { userId: id },
    orderBy: { date: 'desc' },
    take:    10,
    include: { category: { select: { name: true, icon: true, color: true } } },
  })

  return { user, recentTransactions }
}

// ─── Plan management ────────────────────────────────────────────────────────────

export async function setUserPlan(userId: string, plan: 'FREE' | 'PRO') {
  await requireAdmin()
  await db.user.update({ where: { id: userId }, data: { plan } })
  revalidatePath('/admin/users')
  revalidatePath(`/admin/users/${userId}`)
}

export async function toggleUserAdmin(userId: string, isAdmin: boolean) {
  const session = await requireAdmin()
  if (userId === session.userId) return { error: 'Você não pode alterar seu próprio status de admin.' }
  await db.user.update({ where: { id: userId }, data: { isAdmin } })
  revalidatePath(`/admin/users/${userId}`)
}

export async function deleteUserAsAdmin(userId: string) {
  const session = await requireAdmin()
  if (userId === session.userId) return { error: 'Você não pode deletar sua própria conta pelo admin.' }
  await db.user.delete({ where: { id: userId } })
  revalidatePath('/admin/users')
}
