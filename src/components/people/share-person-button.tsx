'use client'

import { Share2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function SharePersonButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    if (navigator.share) {
      try {
        // Passing url separately (not just embedded in the text) lets apps
        // that support it (WhatsApp included) render a rich link preview
        // using the site's Open Graph image/title instead of a plain link.
        await navigator.share({ text, url: 'https://rookmoney.com' })
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
