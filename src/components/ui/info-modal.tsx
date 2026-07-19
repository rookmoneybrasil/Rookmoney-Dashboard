'use client'

import { useState, type ReactNode } from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'

export interface InfoRow { label: string; value: string }

// Wraps the clickable content of a list row: tapping it opens a read-only detail
// popup. No extra ⓘ button — the row itself is the trigger (keeps the row from
// getting crowded with buttons). Mirrors the mobile "tap the row" behavior.
export function InfoModal({ children, className, typeLabel, title, amount, amountClass, badge, rows }: {
  children:     ReactNode
  className?:   string
  typeLabel:    string
  title:        string
  amount?:      string
  amountClass?: string
  badge?:       { label: string; variant: 'success' | 'danger' | 'warning' | 'default' } | null
  rows:         InfoRow[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true) } }}
        className={`cursor-pointer ${className ?? ''}`}
      >
        {children}
      </div>

      <Modal open={open} onOpenChange={setOpen}>
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
    </>
  )
}
