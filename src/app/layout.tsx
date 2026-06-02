import type { ReactNode } from 'react'
import { Poppins } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from '@/components/theme-provider'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  icons: {
    icon:    [{ url: '/favicon.svg', type: 'image/svg+xml' }, { url: '/icon-192.png', sizes: '192x192', type: 'image/png' }],
    shortcut: '/favicon.svg',
    apple:    '/icon-192.png',
  },
  other: { 'theme-color': '#020f21', 'mobile-web-app-capable': 'yes' },
}

const LOCALES = ['pt', 'en', 'es'] as const

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const raw    = cookieStore.get('NEXT_LOCALE')?.value ?? 'pt'
  const locale = LOCALES.includes(raw as any) ? raw : 'pt'

  let messages: Record<string, unknown> = {}
  try {
    messages = (await import(`../../messages/${locale}.json`)).default
  } catch { /* fallback to empty messages */ }

  const htmlLang = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es' : 'en'

  return (
    <html lang={htmlLang} className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
