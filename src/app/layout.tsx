import type { ReactNode } from 'react'
import { Poppins } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { ThemeProvider } from '@/components/theme-provider'
import type { Metadata } from 'next'
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

export default async function RootLayout({ children }: { children: ReactNode }) {
  // getLocale/getMessages may throw if called outside a request context (static build).
  // Fallback to 'pt' so the root layout always renders correctly.
  let locale = 'pt'
  let messages: Record<string, unknown> = {}
  try {
    locale   = await getLocale()
    messages = await getMessages() as Record<string, unknown>
  } catch { /* static render / no request context */ }

  const htmlLang = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es' : 'en'

  return (
    <html lang={htmlLang} className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
