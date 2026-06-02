import type { Metadata } from 'next'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rookmoney.com'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const ogLocale = locale === 'pt' ? 'pt_BR' : locale === 'es' ? 'es_419' : 'en_US'

  return {
    title: {
      default: 'Rook Money — ' + (locale === 'pt' ? 'Controle financeiro inteligente' : locale === 'es' ? 'Control financiero inteligente' : 'Smart financial control'),
      template: '%s · Rook Money',
    },
    description: locale === 'pt'
      ? 'Dashboard inteligente, metas financeiras e relatórios. Grátis para começar.'
      : locale === 'es'
      ? 'Panel inteligente, metas financieras e informes. Gratis para empezar.'
      : 'Smart dashboard, financial goals and reports. Free to start.',
    metadataBase: new URL(APP_URL),
    openGraph: { siteName: 'Rook Money', locale: ogLocale, type: 'website', url: APP_URL },
    appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Rook Money' },
  }
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

// Pure passthrough — html/body/CSS/providers are in the root app/layout.tsx
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as any)) notFound()
  return <>{children}</>
}
