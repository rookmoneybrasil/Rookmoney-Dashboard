'use client'

import { Zap } from 'lucide-react'

export function UpgradeButton() {
  async function handleUpgrade() {
    const res  = await fetch('/api/billing/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <button
      onClick={handleUpgrade}
      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-ink-900 text-sm font-semibold transition-colors"
    >
      <Zap className="size-4" />
      Fazer upgrade para PRO
    </button>
  )
}

export function ManageSubscriptionButton() {
  async function handlePortal() {
    const res  = await fetch('/api/billing/portal', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  return (
    <button
      onClick={handlePortal}
      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-ink-700 hover:bg-ink-600 text-slate-300 text-sm font-medium transition-colors border border-white/8"
    >
      Gerenciar assinatura
    </button>
  )
}
