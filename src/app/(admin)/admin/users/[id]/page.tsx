import { notFound } from 'next/navigation'
import Link from 'next/link'
import { serverApi } from '@/lib/api-client'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  ArrowLeft, Crown, TrendingUp, TrendingDown,
  ReceiptText, Target, FileText, PiggyBank, Users,
} from 'lucide-react'
import { PlanToggle, AdminToggle, DeleteButton } from './user-action-buttons'

interface Props { params: Promise<{ id: string }> }

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminUserPage({ params }: Props) {
  const { id }  = await params
  const result = await serverApi.adminUser(id)
  if (!result) notFound()

  const { user, recentTransactions } = result

  const stats = [
    { icon: ReceiptText, label: 'Transações', value: user._count.transactions, color: 'text-brand-400' },
    { icon: Target,      label: 'Metas',      value: user._count.goals,        color: 'text-orange-400' },
    { icon: FileText,    label: 'Contas',      value: user._count.bills,        color: 'text-red-400' },
    { icon: PiggyBank,   label: 'Orçamentos',  value: user._count.budgets,      color: 'text-cyan-400' },
    { icon: Users,       label: 'Pessoas',     value: user._count.people,       color: 'text-amber-400' },
  ]

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      {/* Back */}
      <Link href="/admin/users" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 w-fit transition-colors">
        <ArrowLeft className="size-4" />
        Voltar para usuários
      </Link>

      {/* Profile header */}
      <div className="flex items-start gap-5 flex-wrap">
        <div className="size-16 rounded-2xl bg-brand-800 border border-brand-700/50 flex items-center justify-center text-2xl font-bold text-brand-300 shrink-0">
          {user.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-slate-100">{user.name}</h1>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
              user.plan === 'PRO'
                ? 'bg-amber-900/60 text-amber-400 border border-amber-700/40'
                : 'bg-ink-700 text-slate-500 border border-white/8'
            }`}>
              {user.plan === 'PRO' && <Crown className="size-3" />}
              {user.plan}
            </span>
            {user.isAdmin && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-danger/15 text-danger border border-danger/30">
                ADMIN
              </span>
            )}
          </div>
          <p className="text-slate-400 mt-1">{user.email}</p>
          <p className="text-slate-600 text-xs mt-1">
            Cadastrado em {formatDate(user.createdAt)} · Atualizado em {formatDate(user.updatedAt)}
            {user.whatsappPhone && ` · WhatsApp: ${user.whatsappPhone}`}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <PlanToggle userId={user.id} currentPlan={user.plan} />
        <AdminToggle userId={user.id} isAdmin={user.isAdmin} />
        <DeleteButton userId={user.id} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-ink-800 border border-white/6 rounded-xl p-4 text-center">
            <Icon className={`size-5 mx-auto mb-2 ${color}`} />
            <p className="text-xl font-bold text-slate-100">{value.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-slate-600 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* IDs técnicos */}
      {(user.stripeCustomerId || user.stripeSubscriptionId) && (
        <div className="bg-ink-800 border border-white/6 rounded-xl p-4 flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stripe</p>
          {user.stripeCustomerId && (
            <p className="text-xs font-mono text-slate-400">
              Customer: <span className="text-slate-300">{user.stripeCustomerId}</span>
            </p>
          )}
          {user.stripeSubscriptionId && (
            <p className="text-xs font-mono text-slate-400">
              Subscription: <span className="text-slate-300">{user.stripeSubscriptionId}</span>
            </p>
          )}
        </div>
      )}

      {/* Recent transactions */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-300">
          Últimas transações ({recentTransactions.length})
        </h2>
        {recentTransactions.length === 0 ? (
          <div className="bg-ink-800 border border-white/6 rounded-xl py-8 text-center text-slate-600 text-sm">
            Nenhuma transação registrada.
          </div>
        ) : (
          <div className="bg-ink-800 border border-white/6 rounded-2xl overflow-hidden">
            <div className="divide-y divide-white/5">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                  <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                    tx.type === 'INCOME' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  }`}>
                    {tx.type === 'INCOME'
                      ? <TrendingUp className="size-4" />
                      : <TrendingDown className="size-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate">{tx.description ?? '—'}</p>
                    <p className="text-xs text-slate-600">{tx.category.icon} {tx.category.name} · {formatDate(tx.date)}</p>
                  </div>
                  <span className={`text-sm font-bold tabular-nums shrink-0 ${
                    tx.type === 'INCOME' ? 'text-success' : 'text-danger'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
