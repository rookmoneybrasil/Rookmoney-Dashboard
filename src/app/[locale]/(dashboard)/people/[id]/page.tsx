import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, CheckCircle2, Clock, CalendarDays } from 'lucide-react'
import { addMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { serverApi } from '@/lib/api-client'
import { EntryModal } from '@/components/people/entry-modal'
import { EntryActions } from '@/components/people/entry-actions'
import { EditEntryModal } from '@/components/people/edit-entry-modal'
import { InstallmentGroup } from '@/components/people/installment-group'
import { EditPersonButton } from '@/components/people/person-modal'
import { DeletePersonButton } from '@/components/people/delete-person-button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { PersonEntryRow } from '@/lib/api-client'
import { RecurringEntryCard } from '@/components/people/recurring-entry-card'
import { MigrateRecurringButton } from '@/components/people/migrate-recurring-button'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function PersonAvatar({ name, color, size = 'md' }: { name: string; color: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase()).join('')
  const sizeClass = size === 'lg' ? 'size-14 text-xl' : size === 'md' ? 'size-10 text-sm' : 'size-7 text-xs'
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: color ?? '#6366f1' }}
    >
      {initials}
    </div>
  )
}

/** Group entries that belong to the same installment set */
function groupEntries(entries: PersonEntryRow[]) {
  const singles: PersonEntryRow[]                = []
  const groups = new Map<string, PersonEntryRow[]>()

  for (const e of entries) {
    if (e.installmentGroupId) {
      const arr = groups.get(e.installmentGroupId) ?? []
      arr.push(e)
      groups.set(e.installmentGroupId, arr)
    } else {
      singles.push(e)
    }
  }

  // Sort each group by installmentCurrent
  const groupList = Array.from(groups.values()).map((g) =>
    g.sort((a, b) => (a.installmentCurrent ?? 0) - (b.installmentCurrent ?? 0)),
  )

  return { singles, groupList }
}

// ─── Single entry card ────────────────────────────────────────────────────────

type Category = { id: string; name: string; icon: string; color: string }

function EntryCard({ entry, personId, categories, settled = false }: { entry: PersonEntryRow; personId: string; categories: Category[]; settled?: boolean }) {
  const isTheyOwe = entry.type === 'THEY_OWE_ME'

  if (settled) {
    return (
      <div className="group flex items-center gap-3 p-4 bg-ink-800/50 rounded-xl border border-ink-700/50 opacity-60 hover:opacity-80 transition-opacity">
        <div className="size-9 rounded-lg bg-ink-700 flex items-center justify-center shrink-0">
          <CheckCircle2 className="size-4 text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-400 text-sm truncate line-through">{entry.description}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-slate-600">Acertado em {formatDate(entry.settledAt ?? entry.createdAt)}</p>
            {entry.category && (
              <span className="text-xs text-slate-600">{entry.category.icon} {entry.category.name}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-semibold text-sm text-slate-500">{formatCurrency(entry.amount)}</span>
          <EditEntryModal entry={entry} categories={categories} />
          <EntryActions entryId={entry.id} personId={personId} isSettled={true} />
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-3 p-4 bg-ink-800 rounded-xl border border-ink-700 hover:border-ink-600 transition-colors">
      <div className={`size-9 rounded-lg shrink-0 flex items-center justify-center ${
        isTheyOwe ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
      }`}>
        {isTheyOwe ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm truncate">{entry.description}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <p className="text-xs text-slate-500">{formatDate(entry.date)}</p>
          {entry.category && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full border"
              style={{
                backgroundColor: entry.category.color + '18',
                color: entry.category.color,
                borderColor: entry.category.color + '40',
              }}
            >
              {entry.category.icon} {entry.category.name}
            </span>
          )}
          {entry.notes && <span className="text-xs text-slate-600 truncate max-w-[120px]">{entry.notes}</span>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className={`font-bold text-sm ${isTheyOwe ? 'text-success' : 'text-danger'}`}>
          {isTheyOwe ? '+' : '-'}{formatCurrency(entry.amount)}
        </span>
        <EditEntryModal entry={entry} categories={categories} />
        <EntryActions entryId={entry.id} personId={personId} isSettled={false} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string }>
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params
  const [person, categories, recurring] = await Promise.all([
    serverApi.person(id),
    serverApi.categories(),
    serverApi.personRecurring(id).catch(() => [] as Awaited<ReturnType<typeof serverApi.personRecurring>>),
  ])
  if (!person) notFound()

  const allEntries   = person.entries

  // For each recurring template, find if there's an entry this month (settled or pending)
  const now          = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthStart   = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd     = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // Map: recurringId → matching entry this month (if any)
  const recurringEntryMap = new Map<string, typeof allEntries[number]>()
  for (const r of recurring) {
    const match = allEntries.find(e =>
      !e.isSettled &&
      e.description === r.description &&
      e.type        === r.type &&
      !e.installmentGroupId &&
      new Date(e.date) >= monthStart &&
      new Date(e.date) <= monthEnd
    )
    if (match) recurringEntryMap.set(r.id, match)
  }
  const today        = new Date()
  const cutoff       = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000)

  // For balance: only unsettled entries
  const openEntries    = allEntries.filter((e) => !e.isSettled)
  const settledEntries = allEntries.filter((e) =>  e.isSettled)

  // Balance: for installment groups, count only ONE installment (monthly value, not total debt)
  // For old recurring (>= 24x not migrated): only within 45 days
  const groupSeen = new Set<string>()
  let theyOweTotal = 0
  let iOweTotal    = 0

  for (const e of openEntries) {
    const isOldRecurring = (e.installmentTotal ?? 0) >= 24
    if (isOldRecurring && new Date(e.date) > cutoff) continue

    if (e.installmentGroupId) {
      if (groupSeen.has(e.installmentGroupId)) continue
      groupSeen.add(e.installmentGroupId)
    }

    if (e.type === 'THEY_OWE_ME') theyOweTotal += Number(e.amount)
    else                           iOweTotal    += Number(e.amount)
  }

  // Add recurring templates that DON'T have a generated entry this month yet
  // (if there IS a generated entry, it's already counted in openEntries above)
  let recurringTheyOwe = 0
  let recurringIOwe    = 0
  for (const r of recurring) {
    if (!recurringEntryMap.has(r.id)) {
      if (r.type === 'THEY_OWE_ME') recurringTheyOwe += Number(r.amount)
      else                           recurringIOwe    += Number(r.amount)
    }
  }

  const theyOweTotalWithRecurring = theyOweTotal + recurringTheyOwe
  const iOweTotalWithRecurring    = iOweTotal    + recurringIOwe
  const balance = theyOweTotalWithRecurring - iOweTotalWithRecurring

  // ── Mini projeção: próximos 3 meses ───────────────────────────────────────
  const monthLabel = format(now, 'MMMM', { locale: ptBR })
  const projection = Array.from({ length: 3 }, (_, i) => {
    const d = addMonths(now, i)
    const label = format(d, "MMM 'yy", { locale: ptBR })

    // Installment groups: which entries are due in this month?
    const dueEntries = openEntries.filter(e => {
      const eDate = new Date(e.date)
      return eDate.getFullYear() === d.getFullYear() && eDate.getMonth() === d.getMonth()
    })

    let projTheyOwe = 0
    let projIOwe    = 0
    const seenGroups = new Set<string>()

    for (const e of dueEntries) {
      if (e.installmentGroupId) {
        if (seenGroups.has(e.installmentGroupId)) continue
        seenGroups.add(e.installmentGroupId)
      }
      if (e.type === 'THEY_OWE_ME') projTheyOwe += Number(e.amount)
      else                           projIOwe    += Number(e.amount)
    }

    // Add recurring amounts only if no PersonEntry was already generated for this month
    const dStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const dEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)

    for (const r of recurring) {
      const alreadyHasEntry = allEntries.some(e =>
        !e.isSettled &&
        e.description === r.description &&
        e.type        === r.type &&
        !e.installmentGroupId &&
        new Date(e.date) >= dStart &&
        new Date(e.date) <= dEnd
      )
      if (alreadyHasEntry) continue

      if (r.type === 'THEY_OWE_ME') projTheyOwe += Number(r.amount)
      else                           projIOwe    += Number(r.amount)
    }

    return { label, theyOwe: projTheyOwe, iOwe: projIOwe, balance: projTheyOwe - projIOwe }
  })

  // Detect old-style recurring groups (installmentTotal >= 24, all unsettled)
  const hasOldRecurring = openEntries.some(e => (e.installmentTotal ?? 0) >= 24)

  // For display: group ALL entries (open + settled) by installmentGroupId so we render each
  // group once. A group is "pending" if any entry is unsettled; "settled" if all settled.
  const { singles: singleOpen,   groupList: groupOpen }    = groupEntries(openEntries)
  // Settled singles only (groups with all settled appear in their own grouped section)
  const { singles: singleSettled, groupList: groupSettled } = groupEntries(settledEntries)

  // Groups that have at least one open entry — pull them from the full entries
  const openGroupIds = new Set(openEntries.filter((e) => e.installmentGroupId).map((e) => e.installmentGroupId as string))
  const allGroupMap  = new Map<string, PersonEntryRow[]>()
  for (const e of allEntries) {
    if (e.installmentGroupId) {
      const arr = allGroupMap.get(e.installmentGroupId) ?? []
      arr.push(e)
      allGroupMap.set(e.installmentGroupId, arr)
    }
  }

  // Active groups (any unsettled) — render in Pendentes with all their entries (open + settled inside)
  const activeGroups = Array.from(allGroupMap.entries())
    .filter(([gid]) => openGroupIds.has(gid))
    .map(([, g]) => g.sort((a, b) => (a.installmentCurrent ?? 0) - (b.installmentCurrent ?? 0)))

  // Fully settled installment groups
  const doneGroupIds = new Set(
    Array.from(allGroupMap.keys()).filter((gid) => !openGroupIds.has(gid)),
  )
  const doneGroups = Array.from(allGroupMap.entries())
    .filter(([gid]) => doneGroupIds.has(gid))
    .map(([, g]) => g.sort((a, b) => (a.installmentCurrent ?? 0) - (b.installmentCurrent ?? 0)))

  const pendingCount = singleOpen.length + activeGroups.length
  const settledCount = singleSettled.length + doneGroups.length

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/people"
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors w-fit"
      >
        <ArrowLeft className="size-4" />
        Voltar para Pessoas
      </Link>

      {/* Header */}
      <div className="flex items-start gap-4 flex-wrap">
        <PersonAvatar name={person.name} color={person.color} size="lg" />
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-white">{person.name}</h1>
          {person.notes && <p className="text-sm text-slate-500 mt-1">{person.notes}</p>}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <EditPersonButton person={person} />
            <DeletePersonButton personId={person.id} />
          </div>
        </div>
        <EntryModal personId={person.id} personName={person.name} categories={categories} />
      </div>

      {/* Balance summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-ink-800 rounded-xl border border-ink-700 p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-4 text-success" />
              <span className="text-xs text-slate-500">Te deve</span>
            </div>
            <span className="text-[10px] text-slate-600 capitalize">{monthLabel}</span>
          </div>
          <p className="text-lg font-bold text-success">{formatCurrency(theyOweTotalWithRecurring)}</p>
          {recurringTheyOwe > 0 && theyOweTotal > 0 && (
            <p className="text-[11px] text-slate-600 mt-1">
              {formatCurrency(theyOweTotal)} avulso + {formatCurrency(recurringTheyOwe)} recorrente
            </p>
          )}
          {recurringTheyOwe > 0 && theyOweTotal === 0 && (
            <p className="text-[11px] text-slate-600 mt-1">recorrente mensal</p>
          )}
        </div>
        <div className="bg-ink-800 rounded-xl border border-ink-700 p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingDown className="size-4 text-danger" />
              <span className="text-xs text-slate-500">Você deve</span>
            </div>
            <span className="text-[10px] text-slate-600 capitalize">{monthLabel}</span>
          </div>
          <p className="text-lg font-bold text-danger">{formatCurrency(iOweTotalWithRecurring)}</p>
          {recurringIOwe > 0 && iOweTotal > 0 && (
            <p className="text-[11px] text-slate-600 mt-1">
              {formatCurrency(iOweTotal)} avulso + {formatCurrency(recurringIOwe)} recorrente
            </p>
          )}
          {recurringIOwe > 0 && iOweTotal === 0 && (
            <p className="text-[11px] text-slate-600 mt-1">recorrente mensal</p>
          )}
        </div>
        <div className="bg-ink-800 rounded-xl border border-ink-700 p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className={`size-4 ${balance >= 0 ? 'text-brand-400' : 'text-danger'}`} />
            <span className="text-xs text-slate-500">Saldo líquido</span>
          </div>
          <p className={`text-lg font-bold ${balance >= 0 ? 'text-brand-400' : 'text-danger'}`}>
            {balance === 0
              ? 'Quitado 🎉'
              : balance > 0
              ? `${formatCurrency(balance)} a receber`
              : `${formatCurrency(-balance)} a pagar`}
          </p>
        </div>
      </div>

      {/* ── Mini projeção ────────────────────────────────── */}
      {recurring.length > 0 && (
        <div className="bg-ink-800 rounded-xl border border-ink-700 p-4">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays className="size-4 text-brand-400" />
            <h2 className="text-sm font-semibold text-slate-300">Projeção dos próximos meses</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {projection.map((m, i) => (
              <div key={m.label} className={`rounded-lg p-3 border ${i === 0 ? 'border-brand-600/40 bg-brand-900/20' : 'border-ink-600 bg-ink-700/50'}`}>
                <p className="text-[11px] text-slate-500 capitalize mb-2 flex items-center gap-1">
                  {i === 0 && <span className="size-1.5 rounded-full bg-brand-400 inline-block" />}
                  {m.label}
                </p>
                {m.theyOwe > 0 && (
                  <p className="text-xs text-success font-medium">+{formatCurrency(m.theyOwe)}</p>
                )}
                {m.iOwe > 0 && (
                  <p className="text-xs text-danger font-medium">-{formatCurrency(m.iOwe)}</p>
                )}
                <p className={`text-sm font-bold mt-1 ${m.balance >= 0 ? 'text-success' : 'text-danger'}`}>
                  {m.balance >= 0 ? '+' : ''}{formatCurrency(m.balance)}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-600 mt-2">Baseado nos recorrentes ativos + lançamentos pendentes</p>
        </div>
      )}

      {/* ── Auto-migração silenciosa de recorrentes antigos ── */}
      {hasOldRecurring && <MigrateRecurringButton />}

      {/* ── Recorrentes ativos ──────────────────────── */}
      {recurring.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-widest">
            Recorrentes ativos
          </h2>
          {recurring.map(item => {
            const monthEntry = recurringEntryMap.get(item.id)
            return (
              <RecurringEntryCard
                key={item.id}
                item={item}
                categories={categories}
                monthEntryId={monthEntry?.id ?? null}
                paidThisMonth={monthEntry?.isSettled ?? false}
              />
            )
          })}
        </div>
      )}

      {/* ── Pending ─────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-slate-500" />
          <h2 className="text-base font-semibold text-white">Pendentes ({pendingCount})</h2>
        </div>

        {pendingCount === 0 ? (
          <div className="py-10 text-center text-sm text-slate-600 bg-ink-800 rounded-xl border border-ink-700 border-dashed">
            Nenhum lançamento pendente
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Installment groups */}
            {activeGroups.map((grp) => (
              <InstallmentGroup
                key={grp[0].installmentGroupId}
                personId={person.id}
                entries={grp}
                categories={categories}
              />
            ))}
            {/* Single entries */}
            {singleOpen.map((entry) => (
              <EntryCard key={entry.id} entry={entry} personId={person.id} categories={categories} />
            ))}
          </div>
        )}
      </div>

      {/* ── Settled ─────────────────────────────────── */}
      {settledCount > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-slate-500" />
            <h2 className="text-base font-semibold text-slate-500">Acertados ({settledCount})</h2>
          </div>
          <div className="flex flex-col gap-2">
            {doneGroups.map((grp) => (
              <InstallmentGroup
                key={grp[0].installmentGroupId}
                personId={person.id}
                entries={grp}
                categories={categories}
              />
            ))}
            {singleSettled.map((entry) => (
              <EntryCard key={entry.id} entry={entry} personId={person.id} categories={categories} settled />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
