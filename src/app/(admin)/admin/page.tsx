import { serverApi } from '@/lib/api-client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Users, Crown, TrendingUp, ArrowUpRight, Receipt, Target } from 'lucide-react'
import Link from 'next/link'

function KPICard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string
  icon: React.ElementType; color: string
}) {
  return (
    <div className="bg-ink-800 border border-white/6 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>
        <div className={`size-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default async function AdminDashboard() {
  const s = await serverApi.adminStats()

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Visão geral</h1>
        <p className="text-sm text-slate-500 mt-1">Métricas em tempo real do Rook Money</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total de usuários"
          value={s.totalUsers.toLocaleString('pt-BR')}
          sub={`+${s.newToday} hoje · +${s.newThisWeek} na semana`}
          icon={Users}
          color="bg-brand-800/60 text-brand-400"
        />
        <KPICard
          label="Plano Pro"
          value={s.proUsers.toLocaleString('pt-BR')}
          sub={`${s.proRate}% da base · ${s.freeUsers} gratuitos`}
          icon={Crown}
          color="bg-amber-900/60 text-amber-400"
        />
        <KPICard
          label="MRR"
          value={formatCurrency(s.mrr)}
          sub={`${s.proUsers} assinantes × R$ 19,90`}
          icon={TrendingUp}
          color="bg-success/10 text-success"
        />
        <KPICard
          label="Transações"
          value={s.totalTransactions.toLocaleString('pt-BR')}
          sub={`+${s.transactionsThisMonth.toLocaleString('pt-BR')} este mês`}
          icon={Receipt}
          color="bg-purple-900/60 text-purple-400"
        />
      </div>

      {/* Secondary row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-ink-800 border border-white/6 rounded-2xl p-5 flex flex-col gap-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Novos este mês</p>
          <p className="text-3xl font-bold text-slate-100">{s.newThisMonth}</p>
          <p className="text-xs text-slate-600">usuários cadastrados</p>
        </div>
        <div className="bg-ink-800 border border-white/6 rounded-2xl p-5 flex flex-col gap-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">ARR estimado</p>
          <p className="text-3xl font-bold text-success">{formatCurrency(s.mrr * 12)}</p>
          <p className="text-xs text-slate-600">receita anual recorrente</p>
        </div>
        <div className="bg-ink-800 border border-white/6 rounded-2xl p-5 flex flex-col gap-1">
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Metas ativas</p>
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-slate-100">{s.totalGoals}</p>
            <Target className="size-5 text-orange-400 mb-1" />
          </div>
          <p className="text-xs text-slate-600">na base toda</p>
        </div>
      </div>

      {/* Recent users */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">Últimos cadastros</h2>
          <Link href="/admin/users" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Ver todos <ArrowUpRight className="size-3" />
          </Link>
        </div>
        <div className="bg-ink-800 border border-white/6 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Usuário</th>
                <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">E-mail</th>
                <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Plano</th>
                <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {s.recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-white/4 last:border-0 hover:bg-ink-700/40 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/admin/users/${u.id}`} className="font-medium text-slate-200 hover:text-white transition-colors">
                      {u.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-xs">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      u.plan === 'PRO'
                        ? 'bg-amber-900/60 text-amber-400 border border-amber-700/40'
                        : 'bg-ink-700 text-slate-500 border border-white/6'
                    }`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 text-xs">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
