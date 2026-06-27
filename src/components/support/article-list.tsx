import Link from 'next/link'
import { searchArticles, CATEGORY_INFO } from '@/lib/help-articles'
import { ArrowLeft } from 'lucide-react'

export function ArticleList({ query }: { query: string }) {
  const results = searchArticles(query)

  return (
    <>
      <Link href="/support" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6">
        <ArrowLeft className="size-4" /> Voltar
      </Link>

      <p className="text-sm text-slate-500 mb-6">
        {results.length} resultado{results.length !== 1 ? 's' : ''} para &quot;{query}&quot;
      </p>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-2">Nenhum resultado encontrado.</p>
          <p className="text-sm text-slate-400">Tente buscar com outras palavras ou <a href="mailto:contato@rookmoney.com" className="text-brand-600 hover:underline">entre em contato</a>.</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-slate-100">
          {results.map(article => {
            const info = CATEGORY_INFO[article.category]
            return (
              <Link key={article.id} href={`/support?artigo=${article.id}`}
                className="flex items-start gap-3 py-4 hover:bg-slate-50 rounded-lg px-3 -mx-3 transition-colors group">
                <span className="text-lg mt-0.5">{info.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700 group-hover:text-brand-600 transition-colors">{article.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{info.label}</p>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{article.content.slice(0, 150)}...</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </>
  )
}
