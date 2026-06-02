'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'

const LOCALES = [
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇲🇽' },
]

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale    = useLocale()
  const router    = useRouter()
  const pathname  = usePathname()
  const [pending, startTransition] = useTransition()

  function switchLocale(next: string) {
    if (next === locale) return
    startTransition(() => {
      // Strip current locale prefix from pathname
      let path = pathname
      for (const l of ['pt', 'en', 'es']) {
        if (path === `/${l}`) { path = ''; break }
        if (path.startsWith(`/${l}/`)) { path = path.slice(l.length + 1); break }
      }
      // With localePrefix: 'always', all locales have a prefix
      router.replace(`/${next}${path ? `/${path}` : ''}`)
    })
  }

  return (
    <div className={`flex items-center gap-1 ${className ?? ''}`}>
      {LOCALES.map(l => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
          disabled={pending}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
            locale === l.code
              ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <span>{l.flag}</span>
          <span>{l.label}</span>
        </button>
      ))}
    </div>
  )
}
