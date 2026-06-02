import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

const LOCALES = ['pt', 'en', 'es'] as const
type Locale = typeof LOCALES[number]

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw    = cookieStore.get('NEXT_LOCALE')?.value ?? 'pt'
  const locale: Locale = LOCALES.includes(raw as Locale) ? (raw as Locale) : 'pt'

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
