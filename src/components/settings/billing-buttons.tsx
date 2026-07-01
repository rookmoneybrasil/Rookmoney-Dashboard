'use client'

import { Zap } from 'lucide-react'
import { clientApi } from '@/lib/api-client'

export function UpgradeButton() {
  async function handleUpgrade() {
    try {
      const { url } = await clientApi.createCheckout()
      if (url) window.location.href = url
    } catch (err) {
      console.error('Checkout error:', err)
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-semibold transition-colors"
    >
      <Zap className="size-4" />
      Fazer upgrade para PRO
    </button>
  )
}

export function ManageSubscriptionButton() {
  async function handlePortal() {
    try {
      const { url } = await clientApi.createPortal()
      if (url) window.location.href = url
    } catch (err) {
      console.error('Portal error:', err)
    }
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
