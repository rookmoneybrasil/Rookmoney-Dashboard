'use client'

import { useLocale } from 'next-intl'

const LOCALES = [
  { code: 'pt', label: 'PT', flag: '🇧🇷' },
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'es', label: 'ES', flag: '🇲🇽' },
]

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale()

  function switchLocale(next: string) {
    if (next === locale) return
    // Set NEXT_LOCALE cookie — middleware picks it up on next request
    // eslint-disable-next-line react-hooks/immutability -- browser cookie write in click handler, not component state
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; SameSite=Lax`
    window.location.reload()
  }

  return (
    <div className={`flex items-center gap-1 ${className ?? ''}`}>
      {LOCALES.map(l => (
        <button
          key={l.code}
          onClick={() => switchLocale(l.code)}
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
