import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import Image from 'next/image'
import { MarketTicker } from '@/components/blog/market-ticker'
import { NewsletterInline } from '@/components/blog/newsletter-banner'

export const metadata: Metadata = {
  title: { default: 'Blog', template: '%s · Blog · Rook Money' },
  description: 'Dicas de finanças pessoais, educação financeira e novidades do Rook Money.',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {adsenseId && (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      )}

      {/* Market ticker bar */}
      <MarketTicker />

      {/* Blog header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/SVG/logo branco.svg" alt="Rook Money" width={120} height={28} />
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/blog" className="text-sm font-medium text-white">Blog</Link>
            <Link href="/help" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Ajuda</Link>
            <Link href="/register" className="text-sm font-medium px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors">
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      {children}

      {/* Blog footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-6 pb-6 border-b border-slate-800">
            <div>
              <p className="text-white font-semibold text-sm mb-1">Newsletter</p>
              <p className="text-xs text-slate-500">Receba nossos artigos por email</p>
            </div>
            <NewsletterInline />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">&copy; {new Date().getFullYear()} Rook Money. Todos os direitos reservados.</p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Termos</Link>
              <Link href="/" className="hover:text-white transition-colors">Início</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
