import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, CheckCircle2, Clock, RefreshCw, Archive, Check, Layers } from 'lucide-react'
import { addMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { serverApi } from '@/lib/api-client'
import { EntryModal } from '@/components/people/entry-modal'
import { EntryActions } from '@/components/people/entry-actions'
import { EditEntryModal } from '@/components/people/edit-entry-modal'
import { InstallmentGroup } from '@/components/people/installment-group'
import { EditPersonButton } from '@/components/people/person-modal'
import { DeletePersonButton } from '@/components/people/delete-person-button'
import { SharePersonButton } from '@/components/people/share-person-button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PersonEntryRow } from '@/lib/api-client'
import { RecurringEntryCard } from '@/components/people/recurring-entry-card'
import { MigrateRecurringButton } from '@/components/people/migrate-recurring-button'
import { PersonProjectionSection } from '@/components/people/person-projection-section'
import { PendingEntryRow } from '@/components/people/pending-entry-row'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function PersonAvatar({ name, color, size = 'md' }: { name: string; color: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]?.toUpperCase()).join('')
  const sizeClass = size === 'lg' ? 'size-14 text-xl' : size === 'md' ? 'size-10 text-sm' : 'size-7 text-xs'
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ backgroundColor: color ?? '#6366f1', color: '#fff' }}
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

// Mirrors Bills' paid-history row (components/bills/page.tsx) — used only
// for settled entries. Pending entries use PendingEntryRow instead, which
// mirrors PendingBillsList.
function SettledEntryRow({ entry, personId, categories }: { entry: PersonEntryRow; personId: string; categories: Category[] }) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 opacity-50 hover:opacity-80 transition-opacity group">
      <div className="size-9 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
        <Check className="size-4 text-success" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-400 truncate">{entry.description}</p>
        <p className="text-xs text-slate-600">
          {entry.category?.name ?? 'Sem categoria'} · {formatDate(entry.settledAt ?? entry.createdAt)}
          {entry.recurringEntryId && <span className="ml-1 text-brand-600">↻ recorrente</span>}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm text-slate-500 tabular-nums">{formatCurrency(entry.amount)}</span>
        <Badge variant="success" size="sm">Pago</Badge>
        <EditEntryModal entry={entry} categories={categories} />
        <EntryActions entryId={entry.id} personId={personId} isSettled={true} />
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
  const monthStart   = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd     = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  // Map: recurringId → ANY entry this month (settled or not)
  // Used for: monthEntryId (card tracking) + balance (if settled → payment done, don't add again)
  // Matched via the recurringEntryId FK (set by processRecurringPersonEntries /
  // the "pay recurring" endpoint) instead of a description/type/date heuristic.
  const recurringEntryMap = new Map<string, typeof allEntries[number]>()
  for (const r of recurring) {
    // Scoped to the current month — recurringEntryId alone isn't enough since
    // a template accumulates one entry per month it's been active; matching
    // without a date range would find last month's (already-settled) entry
    // and wrongly skip adding this month's not-yet-generated amount below.
    const match = allEntries.find(e =>
      e.recurringEntryId === r.id &&
      new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd
    )
    if (match) recurringEntryMap.set(r.id, match)
  }
  const today        = new Date()
  const cutoff       = new Date(today.getTime() + 45 * 24 * 60 * 60 * 1000)

  // For balance: only unsettled entries
  const openEntries    = allEntries.filter((e) => !e.isSettled)
  const settledEntries = allEntries.filter((e) =>  e.isSettled)

  // Balance: for installment groups, count only the installment due in the CURRENT MONTH
  // (future installments belong in the projection, not in the current-month balance card)
  // For old recurring (>= 24x not migrated): only within 45 days
  let theyOweTotal = 0
  let iOweTotal    = 0

  const balMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  for (const e of openEntries) {
    const isOldRecurring = (e.installmentTotal ?? 0) >= 24
    if (isOldRecurring && new Date(e.date) > cutoff) continue

    // Count everything owed up to the end of the current month (overdue + this
    // month), for both single entries AND installments. Future installments
    // belong to the projection, not the current "Você deve". This keeps
    // "Você deve", the current-month projection and the share total consistent
    // (before, overdue installments were dropped here → 3 different totals).
    if (new Date(e.date) > balMonthEnd) continue

    if (e.type === 'THEY_OWE_ME') theyOweTotal += Number(e.amount)
    else                           iOweTotal    += Number(e.amount)
  }

  // Add recurring templates only if NO entry exists this month (settled or pending).
  // - If unsettled entry exists → already counted in openEntries/iOweTotal
  // - If settled entry exists → payment done, nothing owed
  // - If no entry at all → still pending payment, add to balance
  let recurringTheyOwe = 0
  let recurringIOwe    = 0
  for (const r of recurring) {
    if (recurringEntryMap.has(r.id)) continue // entry exists (settled or not) — skip
    if (r.type === 'THEY_OWE_ME') recurringTheyOwe += Number(r.amount)
    else                           recurringIOwe    += Number(r.amount)
  }

  const theyOweTotalWithRecurring = theyOweTotal + recurringTheyOwe
  const iOweTotalWithRecurring    = iOweTotal    + recurringIOwe
  const balance = theyOweTotalWithRecurring - iOweTotalWithRecurring

  // Total quitado este mês — exibido no card "Quitado 🎉"
  const settledThisMonth = settledEntries
    .filter(e => new Date(e.date) >= monthStart && new Date(e.date) <= monthEnd)
    .reduce((s, e) => s + Number(e.amount), 0)

  // ── Mini projeção: próximos 3 meses ───────────────────────────────────────
  const monthLabel = format(now, 'MMMM', { locale: ptBR })
  type ProjectionItem = { id: string; desc: string; amount: number; category: Category | null }
  const projection = Array.from({ length: 3 }, (_, i) => {
    const d = addMonths(now, i)
    const label = format(d, "MMM/yy", { locale: ptBR })

    // Which entries are due in this month? The CURRENT month (i === 0) also
    // absorbs everything overdue (past-due unpaid), so the projection matches
    // "Você deve" instead of hiding money owed from earlier months.
    const dMonthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
    const dueEntries = openEntries.filter(e => {
      const eDate = new Date(e.date)
      if (i === 0) return eDate <= dMonthEnd  // overdue + current month
      return eDate.getFullYear() === d.getFullYear() && eDate.getMonth() === d.getMonth()
    })

    let projTheyOwe = 0
    let projIOwe    = 0
    const theyOweItems: ProjectionItem[] = []
    const iOweItems: ProjectionItem[]    = []
    const seenGroups = new Set<string>()

    for (const e of dueEntries) {
      // Dedup installments only for future months (one parcela per month). In the
      // current month each overdue parcela is genuinely still owed → count them all.
      if (e.installmentGroupId && i > 0) {
        if (seenGroups.has(e.installmentGroupId)) continue
        seenGroups.add(e.installmentGroupId)
      }
      const amount = Number(e.amount)
      const desc = e.installmentGroupId
        ? `${e.description} (parcela ${e.installmentCurrent ?? 1}/${e.installmentTotal ?? 1})`
        : e.description
      if (e.type === 'THEY_OWE_ME') { projTheyOwe += amount; theyOweItems.push({ id: e.id, desc, amount, category: e.category }) }
      else                           { projIOwe    += amount; iOweItems.push({ id: e.id, desc, amount, category: e.category }) }
    }

    // Add recurring monthly amounts — but only if there's no PersonEntry already
    // generated for this month for that recurring template (avoid double-counting,
    // matched via the recurringEntryId FK, not a description/type/date heuristic).
    const dStart = new Date(d.getFullYear(), d.getMonth(), 1)
    const dEnd   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)

    for (const r of recurring) {
      // Match ANY entry (settled or not) — settled means paid (nothing to
      // add), unsettled means it's already counted via dueEntries above.
      // Filtering to unsettled-only here made a paid recurring entry look
      // like it was never generated, so its amount got added a second time.
      const alreadyHasEntry = allEntries.some(e =>
        e.recurringEntryId === r.id &&
        new Date(e.date) >= dStart && new Date(e.date) <= dEnd
      )
      if (alreadyHasEntry) continue // already counted in dueEntries (or already settled)

      const amount = Number(r.amount)
      const desc = `${r.description} (recorrente)`
      if (r.type === 'THEY_OWE_ME') { projTheyOwe += amount; theyOweItems.push({ id: `r-${r.id}`, desc, amount, category: r.category }) }
      else                           { projIOwe    += amount; iOweItems.push({ id: `r-${r.id}`, desc, amount, category: r.category }) }
    }

    return { label, isCurrent: i === 0, theyOwe: projTheyOwe, iOwe: projIOwe, balance: projTheyOwe - projIOwe, theyOweItems, iOweItems }
  })

  // Show the projection card whenever there's something projected (recurring
  // entries OR open installments due in the next 3 months) — not just recurring.
  const hasProjectionData = projection.some(m => m.theyOwe > 0 || m.iOwe > 0)

  // Detect old-style recurring groups (installmentTotal >= 24, all unsettled)
  const hasOldRecurring = openEntries.some(e => (e.installmentTotal ?? 0) >= 24)

  // For display: group ALL entries (open + settled) by installmentGroupId so we render each
  // group once. A group is "pending" if any entry is unsettled; "settled" if all settled.
  const { singles: singleOpen }    = groupEntries(openEntries)
  // Settled singles only (groups with all settled appear in their own grouped section)
  const { singles: singleSettled } = groupEntries(settledEntries)

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

  const settledCount = singleSettled.length + doneGroups.length

  // ── Share text ────────────────────────────────────────────────────────────
  const capMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
  const shareLines: string[] = [`📋 *${person.name}* — ${capMonth}/${now.getFullYear()}`, '']

  // Collect ALL entries for the current month (pending + settled), including recurring
  type ShareItem = { desc: string; amount: number; settled: boolean }
  const shareIOwe: ShareItem[] = []
  const shareTheyOwe: ShareItem[] = []

  // Recurring templates — only the ones still owed this month (skip if already paid)
  for (const r of recurring) {
    const entry = recurringEntryMap.get(r.id)
    if (entry?.isSettled) continue
    const bucket = r.type === 'I_OWE_THEM' ? shareIOwe : shareTheyOwe
    bucket.push({ desc: `${r.description} (recorrente, dia ${r.dayOfMonth})`, amount: Number(r.amount), settled: false })
  }

  // Unsettled single entries owed up to the end of this month (overdue + current),
  // skip only the current month's recurring-generated entry (already covered by
  // the "recorrente" line above) — matched by entry id via the FK-scoped
  // recurringEntryMap, not by description+type, which would also swallow
  // genuinely separate overdue months for the same template.
  const currentMonthRecurringEntryIds = new Set(Array.from(recurringEntryMap.values()).map(e => e.id))
  const allSingles = allEntries.filter(e => {
    const d = new Date(e.date)
    return !e.installmentGroupId && !e.isSettled && d <= monthEnd
  })
  for (const e of allSingles) {
    if (currentMonthRecurringEntryIds.has(e.id)) continue
    const bucket = e.type === 'I_OWE_THEM' ? shareIOwe : shareTheyOwe
    bucket.push({ desc: e.description, amount: Number(e.amount), settled: e.isSettled })
  }

  // Unsettled installment parcelas owed up to end of this month (overdue + current)
  for (const [, grp] of allGroupMap.entries()) {
    const due = grp.find(e => !e.isSettled && new Date(e.date) <= monthEnd)
    if (!due) continue
    const total = due.installmentTotal ?? grp.length
    const current = due.installmentCurrent ?? 1
    const remaining = total - current
    const bucket = due.type === 'I_OWE_THEM' ? shareIOwe : shareTheyOwe
    bucket.push({
      desc: `${due.description} (parcela ${current}/${total}, faltam ${remaining})`,
      amount: Number(due.amount),
      settled: due.isSettled,
    })
  }

  function renderShareSection(title: string, items: ShareItem[]) {
    if (items.length === 0) return
    shareLines.push(title)
    let subtotal = 0
    for (const item of items) {
      const check = item.settled ? ' ✅' : ''
      shareLines.push(`  • ${item.desc} — ${formatCurrency(item.amount)}${check}`)
      subtotal += item.amount
    }
    if (items.length > 1) shareLines.push(`  *Total: ${formatCurrency(subtotal)}*`)
    shareLines.push('')
  }

  renderShareSection('💸 Eu devo:', shareIOwe)
  renderShareSection('💰 Me deve:', shareTheyOwe)

  const nextMonth = projection[1]
  if (nextMonth && (nextMonth.iOwe > 0 || nextMonth.theyOwe > 0)) {
    shareLines.push(`📅 Próximo mês (${nextMonth.label}):`)
    if (nextMonth.iOwe > 0)    shareLines.push(`  Eu devo: ${formatCurrency(nextMonth.iOwe)}`)
    if (nextMonth.theyOwe > 0) shareLines.push(`  Me deve: ${formatCurrency(nextMonth.theyOwe)}`)
    shareLines.push('')
  }

  shareLines.push('— Enviado pelo Rook Money 🐂')
  const shareText = shareLines.join('\n')

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
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
            <SharePersonButton text={shareText} />
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
          {balance === 0 && settledThisMonth > 0 && (
            <p className="text-[11px] text-slate-600 mt-1">
              {formatCurrency(settledThisMonth)} quitado este mês
            </p>
          )}
        </div>
      </div>

      {/* ── Mini projeção ────────────────────────────────── */}
      {hasProjectionData && <PersonProjectionSection months={projection} />}

      {/* ── Auto-migração silenciosa de recorrentes antigos ── */}
      {hasOldRecurring && <MigrateRecurringButton />}

      {/* ── Blocos horizontais: Recorrentes | Pendentes ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Recorrentes ativos */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-brand-400 shrink-0" />
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <RefreshCw className="size-4 text-brand-400" /> Recorrentes ativos
            </h2>
          </div>
          <div className="bg-brand-900/20 border border-brand-700/30 rounded-xl px-3 py-2.5 text-[11px] text-slate-400 leading-relaxed">
            🔁 <strong className="text-slate-300">Recorrentes</strong> geram automaticamente um lançamento pendente no dia configurado, todo mês — acerte pelo bloco <strong className="text-slate-300">Pendentes</strong> ao lado.
          </div>
          {recurring.length === 0 ? (
            <div className="flex flex-col items-center gap-1 py-8 text-center bg-ink-800/50 rounded-xl border border-ink-700 border-dashed">
              <p className="text-xs text-slate-600">Nenhum recorrente ativo</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recurring.map(item => (
                <RecurringEntryCard key={item.id} item={item} categories={categories} />
              ))}
            </div>
          )}
        </div>

        {/* Pendentes — avulsos e recorrentes gerados (parceladas ficam numa seção própria abaixo, igual Contas) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full bg-slate-500 shrink-0" />
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Clock className="size-4 text-slate-400" /> Pendentes ({singleOpen.length})
            </h2>
          </div>

          {singleOpen.length === 0 ? (
            <div className="py-10 flex flex-col items-center gap-3 text-sm text-slate-600 bg-ink-800/50 rounded-xl border border-ink-700 border-dashed">
              Nenhum lançamento pendente
              <EntryModal personId={person.id} personName={person.name} categories={categories} label="Criar primeiro lançamento" variant="secondary" />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {singleOpen.map((entry) => (
                <PendingEntryRow key={entry.id} entry={entry} personId={person.id} categories={categories} />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Parceladas ────────────────────────────────── */}
      {activeGroups.length > 0 && (
        <>
          <div className="border-t border-white/6" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-brand-500 shrink-0" />
              <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Layers className="size-4 text-brand-400" /> Parceladas
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {activeGroups.map((grp) => (
                <InstallmentGroup
                  key={grp[0].installmentGroupId}
                  personId={person.id}
                  entries={grp}
                  categories={categories}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Acertados (histórico) ───────────────────── */}
      {settledCount > 0 && (
        <>
          <div className="border-t border-white/6" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-1 h-5 rounded-full bg-slate-600 shrink-0" />
              <h2 className="text-sm font-bold text-slate-400 flex items-center gap-2">
                <Archive className="size-4 text-slate-500" /> Histórico de acertados ({settledCount})
              </h2>
            </div>

            {doneGroups.length > 0 && (
              <div className="flex flex-col gap-2">
                {doneGroups.map((grp) => (
                  <InstallmentGroup
                    key={grp[0].installmentGroupId}
                    personId={person.id}
                    entries={grp}
                    categories={categories}
                  />
                ))}
              </div>
            )}

            {singleSettled.length > 0 && (
              <Card padding="none">
                <CardContent>
                  <div className="divide-y divide-white/5">
                    {singleSettled.map((entry) => (
                      <SettledEntryRow key={entry.id} entry={entry} personId={person.id} categories={categories} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
