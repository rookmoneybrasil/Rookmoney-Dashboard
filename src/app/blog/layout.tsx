import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: { default: 'Blog', template: '%s · Blog · Rook Money' },
  description: 'Dicas de finanças pessoais, educação financeira e novidades do Rook Money.',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  return (
    <div className="min-h-screen bg-ink-900 text-slate-100">
      {adsenseId && (
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
      )}
      {children}
    </div>
  )
}
