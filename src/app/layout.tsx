import type { ReactNode } from 'react'
import { Poppins } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { ThemeProvider } from '@/components/theme-provider'
import Script from 'next/script'
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
      url:    '/icon-512.png',
      width:  512,
      height: 512,
      alt:    'Rook Money — Controle financeiro inteligente',
    }],
  },
  twitter: {
    card:        'summary',
    title:       'Rook Money — Controle financeiro inteligente',
    description: 'Dashboard, metas, orçamento e relatórios. Organize suas finanças em minutos.',
    images:      ['/icon-512.png'],
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

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  return (
    <html lang={htmlLang} className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased">
        {adsenseId && (
          <Script
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
          />
        )}
        {pixelId && (
          <>
            <Script id="meta-pixel" strategy="afterInteractive">
              {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
            </Script>
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        )}
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
