import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import { changelog, type ChangeCategory } from '@/lib/changelog-data'

export const metadata: Metadata = { title: 'Atualizações — Rook Money' }

const categoryLabel: Record<ChangeCategory, string> = {
  novo: 'Novo',
  melhoria: 'Melhoria',
  fix: 'Correção',
}

const categoryStyle: Record<ChangeCategory, string> = {
  novo: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  melhoria: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
  fix: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
}

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-ink-900 text-slate-100">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-10"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>

        <h1 className="text-3xl font-bold mb-1">Atualizações</h1>
        <p className="text-sm text-slate-500 mb-12">O que há de novo no Rook Money.</p>

        <div className="relative">
          {/* linha vertical da timeline */}
          <div className="absolute left-0 top-2 bottom-0 w-px bg-white/6" />

          <div className="flex flex-col gap-10">
            {changelog.map((entry, i) => (
              <div key={i} className="pl-6 relative">
                {/* ponto na linha */}
                <div className="absolute left-[-4px] top-2 size-2 rounded-full bg-slate-600 ring-2 ring-ink-900" />

                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs text-slate-500">{entry.date}</span>
                  {entry.version && (
                    <span className="text-xs font-mono text-slate-600">{entry.version}</span>
                  )}
                </div>

                <h2 className="text-base font-semibold text-slate-100 mb-3">{entry.title}</h2>

                <ul className="flex flex-col gap-2">
                  {entry.changes.map((change, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-slate-400">
                      <span className={`shrink-0 mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${categoryStyle[change.category]}`}>
                        {categoryLabel[change.category]}
                      </span>
                      {change.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-14 text-center">
          Tem alguma sugestão?{' '}
          <a href="mailto:contato@rookmoney.com" className="hover:text-slate-400 transition-colors underline underline-offset-2">
            Fala com a gente
          </a>
        </p>
      </div>
    </div>
  )
}
