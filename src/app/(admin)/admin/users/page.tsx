import { getAdminUsers } from '@/app/actions/admin'
import { formatDate } from '@/lib/utils'
import { Search, ArrowUpRight, Crown } from 'lucide-react'
import Link from 'next/link'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const sp     = await searchParams
  const search = (sp.search as string) ?? ''
  const plan   = (sp.plan   as string) ?? ''
  const page   = Math.max(1, Number(sp.page ?? '1') || 1)

  const { users, total, totalPages } = await getAdminUsers({ search, plan, page })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Usuários</h1>
          <p className="text-sm text-slate-500 mt-1">{total.toLocaleString('pt-BR')} cadastros</p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full bg-ink-800 border border-white/8 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-600/60"
          />
        </div>
        <select
          name="plan"
          defaultValue={plan}
          className="bg-ink-800 border border-white/8 rounded-xl px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-brand-600/60"
        >
          <option value="">Todos os planos</option>
          <option value="PRO">Pro</option>
          <option value="FREE">Gratuito</option>
        </select>
        <button
          type="submit"
          className="bg-brand-600 hover:bg-brand-500 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors"
        >
          Filtrar
        </button>
        {(search || plan) && (
          <Link href="/admin/users" className="text-sm text-slate-500 hover:text-slate-300 px-2">
            Limpar
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-ink-800 border border-white/6 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/6">
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Usuário</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3 hidden md:table-cell">E-mail</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3">Plano</th>
              <th className="text-right text-xs text-slate-500 font-medium px-5 py-3 hidden lg:table-cell">Transações</th>
              <th className="text-right text-xs text-slate-500 font-medium px-5 py-3 hidden lg:table-cell">Metas</th>
              <th className="text-left text-xs text-slate-500 font-medium px-5 py-3 hidden md:table-cell">Cadastro</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate-600 text-sm">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/4 last:border-0 hover:bg-ink-700/40 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-brand-800 border border-brand-700/50 flex items-center justify-center text-xs font-bold text-brand-300 shrink-0">
                      {u.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-200 truncate">{u.name}</p>
                      {u.isAdmin && <span className="text-[10px] text-danger font-semibold">ADMIN</span>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-slate-500 text-xs hidden md:table-cell">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    u.plan === 'PRO'
                      ? 'bg-amber-900/60 text-amber-400 border border-amber-700/40'
                      : 'bg-ink-700 text-slate-500 border border-white/6'
                  }`}>
                    {u.plan === 'PRO' && <Crown className="size-3" />}
                    {u.plan}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-slate-400 tabular-nums hidden lg:table-cell">
                  {u._count.transactions.toLocaleString('pt-BR')}
                </td>
                <td className="px-5 py-3 text-right text-slate-400 tabular-nums hidden lg:table-cell">
                  {u._count.goals}
                </td>
                <td className="px-5 py-3 text-slate-600 text-xs hidden md:table-cell">{formatDate(u.createdAt)}</td>
                <td className="px-5 py-3">
                  <Link
                    href={`/admin/users/${u.id}`}
                    className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    Ver <ArrowUpRight className="size-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/admin/users?search=${search}&plan=${plan}&page=${page - 1}`}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-ink-700 transition-colors"
            >
              ← Anterior
            </Link>
          )}
          <span className="text-sm text-slate-500">
            Página {page} de {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/admin/users?search=${search}&plan=${plan}&page=${page + 1}`}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-400 hover:bg-ink-700 transition-colors"
            >
              Próxima →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
