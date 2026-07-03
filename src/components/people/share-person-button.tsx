'use client'

import { Share2, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function SharePersonButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    // Generated fresh on every click (not baked into the server-rendered
    // text) so WhatsApp never reuses a cached preview from a previous share
    // — reusing the exact same URL across shares is what caused it to show
    // a stale (or, once, no) preview earlier today. WhatsApp auto-links a
    // bare URL found in the message body and builds its own preview card
    // from it, so this doesn't need to be passed as a separate `url` field.
    const shareUrl = `https://rookmoney.com/?ref=${Date.now()}`
    const fullText = `${text} — ${shareUrl}`

    if (navigator.share) {
      try {
        await navigator.share({ text: fullText })
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(fullText)
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
