import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { getAllPosts, CATEGORY_LABELS, type BlogCategory } from '@/lib/blog'
import { ArticleCard } from '@/components/blog/article-card'
import { CategoryBadge } from '@/components/blog/category-badge'

export const metadata: Metadata = {
  title: 'Blog · Rook Money',
  description: 'Dicas práticas de finanças pessoais, educação financeira, investimentos e novidades do Rook Money.',
  openGraph: {
    title: 'Blog · Rook Money',
    description: 'Dicas práticas de finanças pessoais, educação financeira e investimentos.',
    type: 'website',
  },
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>
}) {
  const { categoria } = await searchParams
  const allPosts = getAllPosts()
  const posts = categoria
    ? allPosts.filter(p => p.category === categoria)
    : allPosts

  const categories = [...new Set(allPosts.map(p => p.category))] as BlogCategory[]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8">
        <ArrowLeft className="size-4" /> Voltar ao início
      </Link>

      <div className="flex flex-col gap-3 mb-10">
        <div className="flex items-center gap-3">
          <BookOpen className="size-7 text-brand-400" />
          <h1 className="text-3xl font-bold text-slate-100">Blog</h1>
        </div>
        <p className="text-slate-400 max-w-xl">
          Dicas práticas, educação financeira e tudo sobre organização das suas finanças pessoais.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/blog"
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            !categoria
              ? 'bg-brand-600 text-white border-brand-500'
              : 'bg-ink-800 text-slate-400 border-white/8 hover:text-slate-200'
          }`}
        >
          Todos
        </Link>
        {categories.map(cat => (
          <Link
            key={cat}
            href={`/blog?categoria=${cat}`}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              categoria === cat
                ? 'bg-brand-600 text-white border-brand-500'
                : 'bg-ink-800 text-slate-400 border-white/8 hover:text-slate-200'
            }`}
          >
            {CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="text-slate-600 text-center py-16">Nenhum artigo encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      {/* CTA footer */}
      <div className="mt-16 text-center">
        <p className="text-slate-500 text-sm mb-3">Quer colocar essas dicas em prática?</p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-colors"
        >
          Criar conta grátis no Rook Money
        </Link>
      </div>
    </div>
  )
}
