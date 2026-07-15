'use server'

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns'
import { isPro } from '@/lib/plans'

export interface AppNotification {
  id:      string
  type:    'bill' | 'goal' | 'budget' | 'person' | 'income' | 'rookinho'
  title:   string
  message: string
  href:    string
  urgency: 'high' | 'medium' | 'low'
  isNew:   boolean
}

function hashId(...parts: string[]): string {
  return parts.join('-').replace(/[^a-z0-9-]/gi, '_')
}

// PushLog.screen is shared with mobile (Expo Router), which uses route-group
// syntax like "/(tabs)" that isn't a real web route — strip any leading
// slashes before re-adding one, and map the mobile home tab to /dashboard.
function webHrefFromScreen(screen: string | null): string {
  if (!screen) return '/'
  const clean = screen.replace(/^\/+/, '')
  if (clean === '(tabs)')  return '/dashboard'
  if (clean === 'ai-chat') return '/chat'
  return `/${clean}`
}

export async function markNotificationsRead(): Promise<void> {
  const session = await getSession()
  if (!session) redirect('/login')
  await db.user.update({ where: { id: session.userId }, data: { notificationsReadAt: new Date() } })
}

export async function getNotifications(): Promise<{ notifications: AppNotification[]; newCount: number }> {
  const session = await getSession()
  if (!session) redirect('/login')

  const now          = new Date()
  const in3Days      = addDays(now, 3)
  const in7Days      = addDays(now, 7)
  const currentMonth = format(now, 'yyyy-MM')
  const mS           = startOfMonth(now)
  const mE           = endOfMonth(now)

  const [
    user,
    overdueBills,
    upcomingBills,
    goals,
    budgets,
    transactions,
    personPayables,
    incomeSources,
  ] = await Promise.all([
    db.user.findUnique({
      where: { id: session.userId },
      select: { name: true, plan: true, lastActiveAt: true, createdAt: true, notificationsReadAt: true },
    }),
    // Contas em ATRASO
    db.bill.findMany({
      where: { userId: session.userId, isPaid: false, dueDate: { lt: now } },
      orderBy: { dueDate: 'asc' },
    }),

    // Contas vencendo nos próximos 3 dias
    db.bill.findMany({
      where: { userId: session.userId, isPaid: false, dueDate: { gte: now, lte: in3Days } },
      orderBy: { dueDate: 'asc' },
    }),

    // Metas com prazo em 7 dias
    db.goal.findMany({
      where: { userId: session.userId, isCompleted: false, deadline: { gte: now, lte: in7Days } },
      orderBy: { deadline: 'asc' },
    }),

    // Orçamentos do mês
    db.budget.findMany({
      where: { userId: session.userId, month: currentMonth },
      include: { category: { select: { name: true } } },
    }),

    // Transações de despesa do mês
    db.transaction.findMany({
      where: { userId: session.userId, type: 'EXPENSE', date: { gte: mS, lte: mE } },
      select: { categoryId: true, amount: true },
    }),

    // Compromissos com pessoas vencendo em 3 dias
    db.personEntry.findMany({
      where: {
        userId: session.userId,
        type: 'I_OWE_THEM',
        isSettled: false,
        date: { gte: now, lte: in3Days },
      },
      include: { person: { select: { name: true } } },
    }),

    // Rendas recorrentes não recebidas este mês cujo dia já passou
    db.incomeSource.findMany({
      where: {
        userId: session.userId,
        isRecurring: true,
        lastAutoPayMonth: { not: currentMonth },
      },
    }),
  ])

  const readAt = user?.notificationsReadAt ?? null
  const notifications: AppNotification[] = []

  // ── Contas em atraso ────────────────────────────────────────────
  for (const bill of overdueBills) {
    const daysLate = Math.floor((now.getTime() - new Date(bill.dueDate).getTime()) / 86400000)
    notifications.push({
      id:      hashId('overdue', bill.id),
      type:    'bill',
      title:   bill.name,
      message: `Atrasada há ${daysLate === 0 ? '1' : daysLate} dia${daysLate > 1 ? 's' : ''} · R$ ${Number(bill.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      href:    '/bills',
      urgency: 'high',
      isNew:   !readAt || new Date(bill.createdAt) > readAt,
    })
  }

  // ── Contas vencendo em breve ─────────────────────────────────────
  for (const bill of upcomingBills) {
    const diffDays  = Math.ceil((new Date(bill.dueDate).getTime() - now.getTime()) / 86400000)
    const whenLabel = diffDays <= 0 ? 'vence hoje' : diffDays === 1 ? 'vence amanhã' : `vence em ${diffDays} dias`
    notifications.push({
      id:      hashId('bill', bill.id),
      type:    'bill',
      title:   bill.name,
      message: `R$ ${Number(bill.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — ${whenLabel}`,
      href:    '/bills',
      urgency: diffDays <= 1 ? 'high' : 'medium',
      isNew:   !readAt || new Date(bill.createdAt) > readAt,
    })
  }

  // ── Metas próximas do prazo ──────────────────────────────────────
  for (const goal of goals) {
    if (!goal.deadline) continue
    const diffDays = Math.ceil((new Date(goal.deadline).getTime() - now.getTime()) / 86400000)
    const pct      = Number(goal.targetAmount) > 0 ? Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100) : 0
    notifications.push({
      id:      hashId('goal', goal.id),
      type:    'goal',
      title:   goal.name,
      message: `${pct}% concluída — prazo ${diffDays <= 0 ? 'hoje' : diffDays === 1 ? 'amanhã' : `em ${diffDays} dias`}`,
      href:    '/goals',
      urgency: diffDays <= 3 ? 'high' : 'medium',
      isNew:   !readAt || new Date(goal.createdAt) > readAt,
    })
  }

  // ── Orçamentos acima de 80% ──────────────────────────────────────
  const spentMap: Record<string, number> = {}
  for (const tx of transactions) {
    spentMap[tx.categoryId] = (spentMap[tx.categoryId] ?? 0) + Number(tx.amount)
  }
  for (const budget of budgets) {
    const limit = Number(budget.amount)
    const spent = spentMap[budget.categoryId] ?? 0
    if (limit <= 0 || spent / limit < 0.8) continue
    const pct   = Math.round((spent / limit) * 100)
    notifications.push({
      id:      hashId('budget', budget.id),
      type:    'budget',
      title:   budget.category.name,
      message: pct >= 100 ? `Limite ultrapassado (${pct}%)` : `${pct}% do limite atingido`,
      href:    '/budget',
      urgency: pct >= 100 ? 'high' : 'medium',
      isNew:   !readAt,
    })
  }

  // ── Compromissos com pessoas vencendo ────────────────────────────
  for (const p of personPayables) {
    const diffDays = Math.ceil((new Date(p.date).getTime() - now.getTime()) / 86400000)
    notifications.push({
      id:      hashId('person', p.id),
      type:    'person',
      title:   `${(p as typeof p & { person: { name: string } }).person.name} · ${p.description}`,
      message: `R$ ${Number(p.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — vence ${diffDays <= 0 ? 'hoje' : 'amanhã'}`,
      href:    '/people',
      urgency: 'high',
      isNew:   !readAt || new Date(p.createdAt) > readAt,
    })
  }

  // ── Rendas recorrentes não recebidas (dia já passou) ─────────────
  for (const src of incomeSources) {
    const day = src.dayOfMonth ?? 1
    if (day > now.getDate()) continue  // Dia ainda não chegou
    notifications.push({
      id:      hashId('income', src.id),
      type:    'income',
      title:   src.name,
      message: `R$ ${Number(src.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} — renda do dia ${day} ainda não confirmada`,
      href:    '/income',
      urgency: 'low',
      isNew:   !readAt,
    })
  }

  // ── PushLogs (cron + broadcast, last 7 days, max 10) ──────────────
  const pushLogs = await db.pushLog.findMany({
    where: { userId: session.userId, createdAt: { gte: addDays(now, -7) } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })
  for (const log of pushLogs) {
    notifications.push({
      id:      `push-${log.id}`,
      type:    'rookinho',
      title:   log.title,
      message: log.body,
      href:    webHrefFromScreen(log.screen),
      urgency: 'low',
      isNew:   !readAt || new Date(log.createdAt) > readAt,
    })
  }

  // ── Rookinho daily message ────────────────────────────────────────
  const firstName = (user?.name ?? '').split(' ')[0] || 'aí'
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))

  if (user && !isPro(user.plan)) {
    const proTips = [
      { title: `💎 Tá perdendo coisa boa, ${firstName}`, message: 'Os PRO têm orçamento ilimitado, relatórios e o Rookinho IA. Você tá de fora!', href: '/settings' },
      { title: `😤 ${firstName}, sério mesmo?`, message: 'Ainda no grátis? Quem é PRO já tá controlando tudo. Não fica pra trás!', href: '/settings' },
      { title: '🤖 Quer falar comigo?', message: `${firstName}, no PRO eu viro seu assistente financeiro pessoal. Bora?`, href: '/chat' },
      { title: `💬 ${firstName}, posso ser honesto?`, message: 'O grátis é bom, mas o PRO é outro nível. R$19,90/mês. Menos que um iFood.', href: '/settings' },
      { title: '🧮 Faz as contas', message: `R$0,66 por dia, ${firstName}. Isso é menos que um café. E muda sua vida financeira.`, href: '/settings' },
      { title: `😎 Rookinho sincerão`, message: `${firstName}, quer organizar de verdade ou só de brincadeira? PRO é pra quem leva a sério.`, href: '/settings' },
      { title: '🚀 Todo mundo tá virando PRO', message: 'Quem assina não volta pro grátis. Será que sabem algo que você não sabe?', href: '/settings' },
    ]
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const readToday = readAt && readAt >= todayStart
    notifications.push({ id: 'rookinho-pro', type: 'rookinho', ...proTips[dayOfYear % proTips.length], urgency: 'low', isNew: !readToday })
  }

  const dailyTips = [
    { title: `💡 Dica do Rookinho`, message: `${firstName}, sabia que dá pra dividir uma conta em parcelas? Tenta lá em Contas!`, href: '/bills' },
    { title: `🗺️ Ô ${firstName}`, message: 'Já criou seu orçamento do mês? Sem orçamento é igual dirigir sem GPS!', href: '/budget' },
    { title: '📝 Rookinho ensina', message: `${firstName}, sabia que dá pra registrar quem te deve? Vai em Pessoas!`, href: '/people' },
    { title: `🎯 E aí ${firstName}`, message: 'Já cadastrou suas metas? Viagem, celular novo, reserva... Bora sonhar!', href: '/goals' },
    { title: '✨ Dica esperta', message: `${firstName}, cadastra rendas fixas e elas entram sozinhas todo mês. Magia!`, href: '/income' },
    { title: `📊 Fala ${firstName}`, message: 'Sabia que dá pra ver relatórios completos dos seus gastos?', href: '/reports' },
    { title: '📅 Psiu', message: `${firstName}, já experimentou o calendário financeiro? Vê tudo que entra e sai!`, href: '/calendar' },
    { title: `☀️ Bom dia, ${firstName}!`, message: 'Registrar gastos todo dia é o segredo. 2 minutinhos e pronto!', href: '/' },
    { title: '🔄 Rookinho avisa', message: `${firstName}, contas tipo Netflix e internet podem ser automáticas. Já configurou?`, href: '/recurring' },
    { title: `🍔 Ei ${firstName}`, message: 'Quanto gastou no iFood esse mês? Categoriza certinho que eu te mostro!', href: '/transactions' },
    { title: '📐 Curiosidade', message: `Regra 50/30/20: 50% necessidades, 30% desejos, 20% poupança. Bora tentar, ${firstName}?`, href: '/budget' },
    { title: `🔍 ${firstName}!`, message: 'Já olhou quanto gastou por categoria esse mês? Às vezes a gente se assusta!', href: '/reports' },
    { title: '🏆 Dica de ouro', message: `${firstName}, paga as contas assim que cair o salário. Futuro-você vai agradecer!`, href: '/bills' },
    { title: `📥 Opa ${firstName}`, message: 'Importar extrato bancário é rapidinho. Vai em Transações e tenta!', href: '/transactions' },
  ]
  const todayStart2 = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const readToday2 = readAt && readAt >= todayStart2
  notifications.push({ id: 'rookinho-tip', type: 'rookinho', ...dailyTips[dayOfYear % dailyTips.length], urgency: 'low', isNew: !readToday2 })

  notifications.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.urgency] - order[b.urgency]
  })

  return { notifications, newCount: notifications.filter(n => n.isNew).length }
}
