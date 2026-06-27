import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function ArticleCTA() {
  return (
    <div className="mt-12 rounded-2xl border border-brand-700/30 bg-gradient-to-r from-brand-900/60 to-ink-800 p-8 sm:p-10 text-center">
      <h3 className="text-xl font-bold text-slate-100 mb-2">
        Organize suas finanças com o Rook Money
      </h3>
      <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
        Crie sua conta grátis e coloque essas dicas em prática hoje mesmo. Controle gastos, metas e contas em um só lugar.
      </p>
      <Link
        href="/register"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors"
      >
        Criar conta grátis <ArrowRight className="size-4" />
      </Link>
    </div>
  )
}
