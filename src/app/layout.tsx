import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rookmoney.com.br'

export const metadata: Metadata = {
  title:       { default: 'Rook Money — Controle financeiro inteligente', template: '%s · Rook Money' },
  description: 'Dashboard inteligente, metas financeiras, orçamento por categoria e relatórios detalhados. Organize suas finanças em minutos. Grátis para começar.',
  metadataBase: new URL(APP_URL),
  keywords:    ['finanças pessoais', 'controle financeiro', 'orçamento', 'metas financeiras', 'dashboard financeiro', 'app financeiro'],
  openGraph: {
    title:       'Rook Money — Seu dinheiro no movimento certo',
    description: 'Dashboard inteligente, metas, orçamento por categoria e relatórios detalhados. Comece grátis, sem cartão.',
    url:         APP_URL,
    siteName:    'Rook Money',
    locale:      'pt_BR',
    type:        'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Rook Money — Controle financeiro inteligente' }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Rook Money — Controle financeiro inteligente',
    description: 'Dashboard, metas, orçamento e relatórios. Organize suas finanças em minutos. Grátis.',
    images:      ['/og-image.png'],
  },
  appleWebApp: {
    capable:        true,
    statusBarStyle: 'black-translucent',
    title:          'Rook Money',
  },
  icons: {
    icon:  [
      { url: '/favicon.svg',  type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple:    '/icon-192.png',
  },
  other: {
    'mobile-web-app-capable':       'yes',
    'apple-mobile-web-app-capable': 'yes',
    'msapplication-TileColor':      '#020f21',
    'theme-color':                  '#020f21',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} h-full`}>
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
