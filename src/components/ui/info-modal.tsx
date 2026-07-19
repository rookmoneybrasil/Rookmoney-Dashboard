'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'

export interface InfoRow { label: string; value: string }

// Read-only detail popup opened by the ⓘ button on a list item (recurring bill,
// one-off bill, income). No actions — edit/pay/delete stay on the row. Mirrors
// the mobile InfoSheet.
export function InfoModal({ typeLabel, title, amount, amountClass, badge, rows }: {
  typeLabel:   string
  title:       string
  amount?:     string
  amountClass?: string
  badge?:      { label: string; variant: 'success' | 'danger' | 'warning' | 'default' } | null
  rows:        InfoRow[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <Modal open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="size-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-brand-400 hover:bg-brand-400/10 transition-colors"
        title="Ver detalhes"
      >
        <Info className="size-3.5" />
      </button>

      <ModalContent size="sm">
        <ModalHeader>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-0.5">{typeLabel}</p>
            <ModalTitle>{title}</ModalTitle>
          </div>
        </ModalHeader>

        <div className="flex items-center gap-3">
          {amount && <p className={`text-2xl font-extrabold ${amountClass ?? 'text-slate-100'}`}>{amount}</p>}
          {badge && <Badge variant={badge.variant} size="sm">{badge.label}</Badge>}
        </div>

        <div className="mt-4 flex flex-col">
          {rows.filter(r => r.value).map((r) => (
            <div key={r.label} className="flex items-start justify-between gap-4 py-2.5 border-b border-white/6 last:border-0">
              <span className="text-sm text-slate-500 shrink-0">{r.label}</span>
              <span className="text-sm font-semibold text-slate-200 text-right">{r.value}</span>
            </div>
          ))}
        </div>
      </ModalContent>
    </Modal>
  )
}
