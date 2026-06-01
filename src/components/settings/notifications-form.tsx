'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { clientApi } from '@/lib/api-client'
import { Check } from 'lucide-react'

interface Props {
  notifBillReminder:  boolean
  notifCategoryLimit: boolean
  notifMonthlyEmail:  boolean
}

interface Notifs {
  notifBillReminder:  boolean
  notifCategoryLimit: boolean
  notifMonthlyEmail:  boolean
}

export function NotificationsForm({ notifBillReminder, notifCategoryLimit, notifMonthlyEmail }: Props) {
  const [values, setValues] = useState<Notifs>({ notifBillReminder, notifCategoryLimit, notifMonthlyEmail })
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  async function toggle(key: keyof Notifs, val: boolean) {
    const next = { ...values, [key]: val }
    setValues(next)
    setSaving(true)
    setSaved(false)
    try {
      await clientApi.updateNotifications(next)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch { /* rollback on error */ setValues(values) }
    finally  { setSaving(false) }
  }

  const rows: { key: keyof Notifs; label: string; sub: string }[] = [
    { key: 'notifBillReminder',  label: 'Lembrete de contas',      sub: 'Aviso 3 dias antes do vencimento'  },
    { key: 'notifCategoryLimit', label: 'Limite de orçamento',     sub: 'Quando atingir 80% de uma categoria' },
    { key: 'notifMonthlyEmail',  label: 'Resumo mensal por e-mail', sub: 'Relatório financeiro todo dia 1'   },
  ]

  return (
    <div className="flex flex-col divide-y divide-white/5">
      {rows.map(({ key, label, sub }) => (
        <div key={key} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
          <div>
            <p className="text-sm text-slate-300">{label}</p>
            <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
          </div>
          <Switch
            checked={values[key]}
            onCheckedChange={(v) => toggle(key, v)}
            disabled={saving}
          />
        </div>
      ))}
      {saved && (
        <div className="flex items-center gap-1.5 pt-3 text-xs text-success">
          <Check className="size-3" /> Salvo
        </div>
      )}
    </div>
  )
}
