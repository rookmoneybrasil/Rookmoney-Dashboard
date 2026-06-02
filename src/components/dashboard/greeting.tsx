'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { WithTooltip } from '@/components/ui/tooltip'
import { MASCOT_SRCS, type MascotMood } from '@/lib/mascot'
import { format, type Locale } from 'date-fns'
import { ptBR, enUS, es } from 'date-fns/locale'
import { useTranslations, useLocale } from 'next-intl'

const DATE_LOCALES: Record<string, Locale> = { pt: ptBR, en: enUS, es }

interface Props {
  firstName: string
  mood:      MascotMood
  moodLabel: string
}

export function DashboardGreeting({ firstName, mood, moodLabel }: Props) {
  const t          = useTranslations('dashboard.greeting')
  const locale     = useLocale()
  const dateLocale = DATE_LOCALES[locale] ?? ptBR

  const [greeting, setGreeting]     = useState('')
  const [monthLabel, setMonthLabel] = useState('')

  useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? t('morning') : h < 18 ? t('afternoon') : t('evening'))
    setMonthLabel(format(new Date(), 'MMMM yyyy', { locale: dateLocale }))
  }, [locale])

  return (
    <div className="flex items-center gap-3">
      <WithTooltip content={moodLabel} side="right">
        <div className="shrink-0 size-20 relative cursor-default">
          <Image
            src={MASCOT_SRCS[mood === 'idle' ? 'happy' : mood]}
            alt="humor"
            fill
            className="object-contain"
          />
        </div>
      </WithTooltip>
      <div>
        <h1 className="text-xl font-semibold text-slate-100 capitalize">
          {greeting}, {firstName}.
        </h1>
        <p className="text-sm text-slate-500 mt-0.5 capitalize">
          {monthLabel}
        </p>
      </div>
    </div>
  )
}
