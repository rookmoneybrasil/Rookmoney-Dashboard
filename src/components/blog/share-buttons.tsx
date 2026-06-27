'use client'

import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'

const SHARE_TARGETS = [
  { name: 'WhatsApp', icon: '💬', url: (t: string, u: string) => `https://wa.me/?text=${encodeURIComponent(`${t}\n${u}`)}` },
  { name: 'Twitter', icon: '𝕏', url: (t: string, u: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(u)}` },
  { name: 'LinkedIn', icon: 'in', url: (_t: string, u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}` },
]

export function ShareButtons({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-3 mt-8 pt-8 border-t border-slate-200">
      <span className="flex items-center gap-1.5 text-sm text-slate-400">
        <Share2 className="size-3.5" /> Compartilhar
      </span>
      {SHARE_TARGETS.map(s => (
        <a
          key={s.name}
          href={s.url(title, typeof window !== 'undefined' ? window.location.href : '')}
          target="_blank"
          rel="noopener noreferrer"
          className="size-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-sm text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors"
          title={s.name}
        >
          {s.icon}
        </a>
      ))}
      <button
        onClick={copyLink}
        className="size-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors"
        title="Copiar link"
      >
        {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
      </button>
    </div>
  )
}
