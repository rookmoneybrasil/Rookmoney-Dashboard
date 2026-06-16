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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rookmoney.com'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title:       { default: 'Rook Money — Controle financeiro inteligente', template: '%s · Rook Money' },
  description: 'Dashboard inteligente, metas financeiras, orçamento por categoria e relatórios detalhados. Organize suas finanças em minutos. Grátis para começar.',
  openGraph: {
    siteName:    'Rook Money',
    title:       'Rook Money — Seu dinheiro no movimento certo',
    description: 'Dashboard inteligente, metas, orçamento e relatórios. Comece grátis.',
    url:         APP_URL,
    type:        'website',
    locale:      'pt_BR',
    images: [{
      url:    '/og-image.png',
      width:  1200,
      height: 630,
      alt:    'Rook Money — Controle financeiro inteligente',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Rook Money — Controle financeiro inteligente',
    description: 'Dashboard, metas, orçamento e relatórios. Organize suas finanças em minutos.',
    images:      ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.svg',  type: 'image/svg+xml' },
    ],
    shortcut: '/icon-192.png',
    apple:    '/icon-192.png',
  },
  other: { 'theme-color': '#020f21', 'mobile-web-app-capable': 'yes' },
}

const LOCALES = ['pt', 'en', 'es'] as const

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const raw    = cookieStore.get('NEXT_LOCALE')?.value ?? 'pt'
  const locale = (LOCALES as readonly string[]).includes(raw) ? raw : 'pt'

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
