'use client'

import { useRouter } from 'next/navigation'

export function BudgetMonthPicker({ month }: { month: string }) {
  const router = useRouter()

  return (
    <input
      type="month"
      defaultValue={month}
      onChange={(e) => {
        if (e.target.value) router.push(`/budget?month=${e.target.value}`)
      }}
      className="h-8 bg-ink-800 border border-ink-600 rounded-lg px-3 text-sm text-slate-300 focus:outline-none focus:border-brand-500 [color-scheme:dark] cursor-pointer"
    />
  )
}
