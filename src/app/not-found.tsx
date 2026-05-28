import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink-900 flex flex-col items-center justify-center text-center px-4">
      <div className="relative h-16 w-16 mb-6 opacity-60">
        <Image src="/SVG/FAVICON.svg" alt="Rook" fill className="object-contain" />
      </div>
      <p className="text-7xl font-bold text-brand-700 tabular-nums mb-4">404</p>
      <h1 className="text-xl font-semibold text-slate-200 mb-2">Página não encontrada</h1>
      <p className="text-sm text-slate-500 max-w-xs mb-8">
        A página que você tentou acessar não existe ou foi removida.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-medium px-5 py-2.5 rounded-xl transition-colors text-sm"
      >
        Voltar ao Dashboard
      </Link>
    </div>
  )
}
