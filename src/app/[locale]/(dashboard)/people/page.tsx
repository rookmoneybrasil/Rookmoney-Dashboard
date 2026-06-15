import { Suspense } from 'react'
import Link from 'next/link'
import { Users, TrendingUp, TrendingDown, ArrowRight, CheckCircle } from 'lucide-react'
import { serverApi } from '@/lib/api-client'
import { PersonModal } from '@/components/people/person-modal'
import { PeopleFilters } from '@/components/people/people-filters'
import { formatCurrency } from '@/lib/utils'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

function PersonAvatar({ name, color }: { name: string; color: string | null }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('')
  return (
    <div
      className="size-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
      style={{ backgroundColor: color ?? '#6366f1' }}
    >
      {initials}
    </div>
  )
}

export default async function PeoplePage({ searchParams }: { searchParams: SearchParams }) {
  const sp     = await searchParams
  const search = ((sp.search as string) ?? '').toLowerCase().trim()
  const filter = (sp.filter as string) ?? 'all'
  const sort   = (sp.sort   as string) ?? 'name'

  const allPeople = await serverApi.people()

  // ── Filter ──────────────────────────────────────────────────────
  let people = allPeople.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search)) return false
    if (filter === 'they_owe') return p.balance > 0
    if (filter === 'i_owe')    return p.balance < 0
    if (filter === 'settled')  return p.balance === 0
    return true
  })

  // ── Sort ────────────────────────────────────────────────────────
  if (sort === 'balance_desc') {
    people = people.sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
  } else if (sort === 'balance_asc') {
    people = people.sort((a, b) => Math.abs(a.balance) - Math.abs(b.balance))
  } else {
    people = people.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }

  const totalTheyOwe = allPeople.reduce((s, p) => s + (p.balance > 0 ? p.balance : 0), 0)
  const totalIOwe    = allPeople.reduce((s, p) => s + (p.balance < 0 ? -p.balance : 0), 0)
  const netBalance   = totalTheyOwe - totalIOwe

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="size-6 text-brand-400" />
            Pessoas
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Controle quem te deve e a quem você deve
          </p>
          <p className="text-xs text-slate-600 mt-1 max-w-md">Registre lançamentos avulsos, parcelados ou recorrentes. Ao acertar uma dívida, a transação correspondente é criada automaticamente.</p>
        </div>
        <PersonModal />
      </div>

      {/* Summary cards */}
      {allPeople.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-ink-800 rounded-xl border border-ink-700 p-4 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="size-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Te devem</p>
              <p className="text-base font-bold text-success">{formatCurrency(totalTheyOwe)}</p>
            </div>
          </div>
          <div className="bg-ink-800 rounded-xl border border-ink-700 p-4 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-danger/10 flex items-center justify-center">
              <TrendingDown className="size-4 text-danger" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Você deve</p>
              <p className="text-base font-bold text-danger">{formatCurrency(totalIOwe)}</p>
            </div>
          </div>
          <div className="bg-ink-800 rounded-xl border border-ink-700 p-4 flex items-center gap-3">
            <div className={`size-9 rounded-lg flex items-center justify-center ${netBalance >= 0 ? 'bg-brand-600/20' : 'bg-danger/10'}`}>
              <CheckCircle className={`size-4 ${netBalance >= 0 ? 'text-brand-400' : 'text-danger'}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Saldo líquido</p>
              <p className={`text-base font-bold ${netBalance >= 0 ? 'text-brand-400' : 'text-danger'}`}>
                {formatCurrency(Math.abs(netBalance))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* People list */}
      {allPeople.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="size-16 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center">
            <Users className="size-7 text-slate-600" />
          </div>
          <div>
            <p className="text-slate-400 font-medium">Nenhuma pessoa cadastrada</p>
            <p className="text-sm text-slate-600 mt-1">
              Adicione pessoas para rastrear dívidas e empréstimos
            </p>
          </div>
          <PersonModal />
        </div>
      ) : (
        <>
          {/* Filters */}
          <Suspense>
            <PeopleFilters
              filter={(filter as 'all' | 'they_owe' | 'i_owe' | 'settled')}
              sort={(sort as 'name' | 'balance_asc' | 'balance_desc')}
              search={search}
            />
          </Suspense>

          {people.length === 0 ? (
            <p className="text-sm text-slate-600 py-8 text-center">
              Nenhuma pessoa encontrada para este filtro.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {people.map((person) => (
                <Link
                  key={person.id}
                  href={`/people/${person.id}`}
                  className="group flex items-center gap-4 p-4 bg-ink-800 rounded-xl border border-ink-700 hover:border-brand-600/40 hover:bg-ink-750 hover:shadow-sm transition-all"
                >
                  <PersonAvatar name={person.name} color={person.color} />

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate group-hover:text-brand-200 transition-colors">{person.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {person.openEntriesCount === 0
                        ? <span className="text-slate-600">Clique para adicionar lançamentos</span>
                        : `${person.openEntriesCount} lançamento${person.openEntriesCount !== 1 ? 's' : ''} pendente${person.openEntriesCount !== 1 ? 's' : ''}`}
                    </p>
                  </div>

                  {/* Botão com os dois valores (te deve + você deve) */}
                  <div className="flex items-center gap-2 shrink-0 bg-ink-700 group-hover:bg-ink-600 border border-ink-600 group-hover:border-ink-500 px-3 py-2 rounded-xl transition-all min-w-[130px]">
                    <div className="flex flex-col gap-0.5 flex-1">
                      {/* Te deve */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-600">te deve</span>
                        <span className={`text-xs font-semibold tabular-nums ${(person.theyOweMe ?? (person.balance > 0 ? person.balance : 0)) > 0 ? 'text-success' : 'text-slate-600'}`}>
                          {formatCurrency(person.theyOweMe ?? (person.balance > 0 ? person.balance : 0))}
                        </span>
                      </div>
                      {/* Você deve */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-600">vc deve</span>
                        <span className={`text-xs font-semibold tabular-nums ${(person.iOweThem ?? (person.balance < 0 ? -person.balance : 0)) > 0 ? 'text-danger' : 'text-slate-600'}`}>
                          {formatCurrency(person.iOweThem ?? (person.balance < 0 ? -person.balance : 0))}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="size-3.5 text-slate-500 group-hover:text-slate-300 transition-colors shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          <p className="text-xs text-slate-600 text-center">
            {people.length} de {allPeople.length} pessoa{allPeople.length !== 1 ? 's' : ''}
          </p>
        </>
      )}
    </div>
  )
}
