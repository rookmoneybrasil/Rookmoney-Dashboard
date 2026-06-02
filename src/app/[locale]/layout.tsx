import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { ThemeProvider } from '@/components/theme-provider'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rookmoney.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'landing' })

  const ogLocale = locale === 'pt' ? 'pt_BR' : locale === 'es' ? 'es_419' : 'en_US'

  return {
    title:       { default: 'Rook Money — ' + (locale === 'pt' ? 'Controle financeiro inteligente' : locale === 'es' ? 'Control financiero inteligente' : 'Smart financial control'), template: '%s · Rook Money' },
    description: locale === 'pt'
      ? 'Dashboard inteligente, metas financeiras, orçamento por categoria e relatórios detalhados. Organize suas finanças em minutos. Grátis para começar.'
      : locale === 'es'
      ? 'Panel inteligente, metas financieras, presupuesto por categoría e informes detallados. Organiza tus finanzas en minutos. Gratis para empezar.'
      : 'Smart dashboard, financial goals, category budget and detailed reports. Organize your finances in minutes. Free to start.',
    metadataBase: new URL(APP_URL),
    openGraph: {
      siteName: 'Rook Money',
      locale:   ogLocale,
      type:     'website',
      url:      APP_URL,
      images:   [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    appleWebApp: {
      capable:        true,
      statusBarStyle: 'black-translucent',
      title:          'Rook Money',
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()
  const htmlLang = locale === 'pt' ? 'pt-BR' : locale === 'es' ? 'es' : 'en'

  return (
    <html lang={htmlLang} suppressHydrationWarning>
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
