'use client'

import { useEffect, useState } from 'react'
import { clientApi, type Account } from '@/lib/api-client'
import { FormField } from '@/components/ui/input'

// Reusable "Conta" chip selector for the money forms (bill, recurring, income).
// Self-fetches the accounts so parent modals don't have to thread them through.
// value = accountId (null/'' = none → API falls back to the default account).
export function AccountPicker({ value, onChange, label = 'Conta' }: {
  value:    string | null
  onChange: (id: string) => void
  label?:   string
}) {
  const [accounts, setAccounts] = useState<Account[]>([])
  useEffect(() => {
    clientApi.accounts().then(d => setAccounts(d.accounts.filter(a => !a.archived))).catch(() => {})
  }, [])
  if (accounts.length === 0) return null

  return (
    <FormField label={label} htmlFor="account">
      <div className="flex flex-wrap gap-2">
        {accounts.map(a => (
          <button
            type="button"
            key={a.id}
            onClick={() => onChange(a.id)}
            className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${value === a.id ? 'bg-brand-900/40 border-brand-600 text-brand-300' : 'bg-ink-700 border-white/8 text-slate-400 hover:text-slate-200'}`}
          >
            {a.icon} {a.name}
          </button>
        ))}
      </div>
    </FormField>
  )
}
