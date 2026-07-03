'use client'

import { Share2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function SharePersonButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    if (navigator.share) {
      try {
        // text already ends with a "https://rookmoney.com" line (see
        // page.tsx) — WhatsApp auto-links a bare URL found in the message
        // body and generates its own preview card from it. Passing url as
        // a SEPARATE field here as well made WhatsApp show it a second
        // time as a duplicate link.
        await navigator.share({ text })
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-600/20 text-brand-400 border border-brand-600/30 hover:bg-brand-600/30 transition-colors"
    >
      {copied ? (
        <>
          <Check className="size-3.5" />
          Copiado!
        </>
      ) : (
        <>
          <Share2 className="size-3.5" />
          Compartilhar
        </>
      )}
    </button>
  )
}
