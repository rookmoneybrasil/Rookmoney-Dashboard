import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
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
    <html className={`${poppins.variable} h-full`} suppressHydrationWarning>
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  )
}
