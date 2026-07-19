import { formatCurrency, formatDate } from '@/lib/utils'
import type { PersonEntryRow } from '@/lib/api-client'

// Builds the read-only InfoModal props for a person entry (te deve / você deve).
// Shared by the settled + pending rows so both show the same detail popup.
export function personEntryInfo(entry: PersonEntryRow, settled: boolean) {
  const isTheyOwe     = entry.type === 'THEY_OWE_ME'
  const isInstallment = !!entry.installmentTotal && entry.installmentTotal > 1
  const badge: { label: string; variant: 'success' | 'danger' | 'default' } = settled
    ? { label: 'Pago', variant: 'success' }
    : isTheyOwe ? { label: 'Recebível', variant: 'success' } : { label: 'A pagar', variant: 'danger' }
  return {
    typeLabel:   'Pessoas',
    title:       entry.description,
    amount:      `${isTheyOwe ? '+' : '-'}${formatCurrency(entry.amount)}`,
    amountClass: isTheyOwe ? 'text-success' : 'text-danger',
    badge,
    rows: [
      { label: 'Tipo',        value: isTheyOwe ? 'Te deve' : 'Você deve' },
      { label: settled ? 'Acertado em' : 'Data', value: formatDate(settled ? (entry.settledAt ?? entry.createdAt) : entry.date) },
      { label: 'Categoria',   value: entry.category?.name ? `${entry.category.icon ?? ''} ${entry.category.name}`.trim() : '' },
      { label: 'Parcela',     value: isInstallment ? `${entry.installmentCurrent}/${entry.installmentTotal}` : '' },
      { label: 'Observações', value: entry.notes ?? '' },
    ],
  }
}
