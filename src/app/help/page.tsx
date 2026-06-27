import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ArrowLeft, BookOpen, Mail } from 'lucide-react'
import { CATEGORY_INFO, HELP_ARTICLES, type HelpCategory } from '@/lib/help-articles'
import { HelpSearch } from '@/components/support/help-search'
import { ArticleList } from '@/components/support/article-list'

export const metadata: Metadata = {
  title: 'Central de Ajuda · Rook Money',
  description: 'Tire suas dúvidas sobre o Rook Money. Guias, tutoriais e respostas para as perguntas mais frequentes.',
}

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string; categoria?: string; artigo?: string }>
}) {
  const { busca, categoria, artigo } = await searchParams

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/SVG/logo branco.svg" alt="Rook Money" width={120} height={28} />
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/blog" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Blog</Link>
            <Link href="/register" className="text-sm font-medium px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-colors">
              Criar conta
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-3">Central de Ajuda</h1>
          <p className="text-slate-400 mb-8">Como podemos te ajudar?</p>
          <HelpSearch defaultValue={busca ?? ''} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Search results */}
        {busca ? (
          <ArticleList query={busca} />
        ) : artigo ? (
          <ArticleDetail articleId={artigo} />
        ) : categoria ? (
          <CategoryView category={categoria as HelpCategory} />
        ) : (
          <DefaultView />
        )}
      </div>

      {/* Contact footer */}
      <div className="bg-slate-50 border-t border-slate-200 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Não encontrou o que procurava?</h3>
          <p className="text-sm text-slate-500 mb-6">Entre em contato com nossa equipe.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="mailto:contato@rookmoney.com" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 transition-colors">
              <Mail className="size-4" /> contato@rookmoney.com
            </a>
            <Link href="/help?categoria=como-usar" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
              <BookOpen className="size-4" /> Ver todos os guias
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} Rook Money</p>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── Default: categories grid ────────────────────────────────────────────────

function DefaultView() {
  const categories = Object.entries(CATEGORY_INFO) as [HelpCategory, typeof CATEGORY_INFO[HelpCategory]][]

  return (
    <>
      <h2 className="text-lg font-semibold text-slate-800 mb-6">Escolha um tema</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {categories.map(([key, info]) => (
          <Link key={key} href={`/help?categoria=${key}`}
            className="flex items-start gap-4 p-5 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group">
            <span className="text-2xl">{info.icon}</span>
            <div>
              <h3 className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">{info.label}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{info.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-800 mb-4">Artigos populares</h2>
      <div className="flex flex-col divide-y divide-slate-100">
        {HELP_ARTICLES.slice(0, 6).map(article => (
          <Link key={article.id} href={`/help?artigo=${article.id}`}
            className="flex items-center gap-3 py-4 hover:bg-slate-50 rounded-lg px-3 -mx-3 transition-colors">
            <span className="text-lg">{CATEGORY_INFO[article.category].icon}</span>
            <div>
              <p className="text-sm font-medium text-slate-700">{article.title}</p>
              <p className="text-xs text-slate-400">{CATEGORY_INFO[article.category].label}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

// ── Category view ────────────────────────────────────────────────────────────

function CategoryView({ category }: { category: HelpCategory }) {
  const info = CATEGORY_INFO[category]
  const articles = HELP_ARTICLES.filter(a => a.category === category)

  if (!info) return <p className="text-slate-500">Categoria não encontrada.</p>

  return (
    <>
      <Link href="/help" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6">
        <ArrowLeft className="size-4" /> Voltar
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">{info.icon}</span>
        <div>
          <h2 className="text-xl font-bold text-slate-800">{info.label}</h2>
          <p className="text-sm text-slate-500">{info.description}</p>
        </div>
      </div>

      <div className="flex flex-col divide-y divide-slate-100">
        {articles.map(article => (
          <Link key={article.id} href={`/help?artigo=${article.id}`}
            className="flex items-center justify-between py-4 hover:bg-slate-50 rounded-lg px-3 -mx-3 transition-colors group">
            <p className="text-sm font-medium text-slate-700 group-hover:text-brand-600 transition-colors">{article.title}</p>
            <span className="text-slate-400 text-xs shrink-0">→</span>
          </Link>
        ))}
      </div>
    </>
  )
}

// ── Article detail ────────────────────────────────────────────────────────────

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { HelpfulButtons } from '@/components/support/helpful-buttons'

function ArticleDetail({ articleId }: { articleId: string }) {
  const article = HELP_ARTICLES.find(a => a.id === articleId)

  if (!article) return (
    <div className="text-center py-20">
      <p className="text-slate-500 mb-2">Artigo não encontrado.</p>
      <Link href="/help" className="text-sm text-brand-600 hover:underline">Voltar à Central de Ajuda</Link>
    </div>
  )

  const info = CATEGORY_INFO[article.category]

  return (
    <>
      <Link href={`/help?categoria=${article.category}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6">
        <ArrowLeft className="size-4" /> {info.label}
      </Link>

      <h1 className="text-2xl font-bold text-slate-800 mb-2">{article.title}</h1>
      <p className="text-sm text-slate-400 mb-8">{info.icon} {info.label}</p>

      <div className="prose prose-slate max-w-none
        prose-headings:text-slate-800
        prose-p:text-slate-600 prose-p:leading-relaxed
        prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-slate-800
        prose-code:text-brand-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-li:text-slate-600
        prose-th:text-slate-700 prose-td:text-slate-600
        prose-table:text-sm
        prose-blockquote:border-l-brand-500 prose-blockquote:text-slate-500
      ">
        <Markdown remarkPlugins={[remarkGfm]}>{article.content}</Markdown>
      </div>

      <HelpfulButtons articleId={article.id} />

      {/* Related articles */}
      <div className="mt-12 pt-8 border-t border-slate-200">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Artigos relacionados</h3>
        <div className="flex flex-col gap-2">
          {HELP_ARTICLES.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3).map(related => (
            <Link key={related.id} href={`/help?artigo=${related.id}`}
              className="text-sm text-brand-600 hover:underline">
              {related.title}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
