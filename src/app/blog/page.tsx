import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { getAllPosts, CATEGORY_LABELS, type BlogCategory } from '@/lib/blog'
import { ArticleCard } from '@/components/blog/article-card'
import { HeroSlider } from '@/components/blog/hero-slider'
import { SearchBar } from '@/components/blog/search-bar'

export const metadata: Metadata = {
  title: 'Blog · Rook Money',
  description: 'Dicas práticas de finanças pessoais, educação financeira, investimentos, cripto e novidades do Rook Money.',
  openGraph: {
    title: 'Blog · Rook Money',
    description: 'Dicas práticas de finanças pessoais, educação financeira e investimentos.',
    type: 'website',
  },
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; busca?: string }>
}) {
  const { categoria, busca } = await searchParams
  const allPosts = await getAllPosts()

  let posts = allPosts
  if (categoria) posts = posts.filter(p => p.category === categoria)
  if (busca) {
    const q = busca.toLowerCase()
    posts = posts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.excerpt.toLowerCase().includes(q) ||
      (CATEGORY_LABELS[p.category] ?? '').toLowerCase().includes(q)
    )
  }

  const categories = [...new Set(allPosts.map(p => p.category))] as BlogCategory[]
  const featured = allPosts.slice(0, 5)
  const showSlider = !categoria && !busca

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <BookOpen className="size-7 text-brand-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Blog</h1>
            <p className="text-sm text-slate-500">Finanças, investimentos, cripto e dicas práticas</p>
          </div>
        </div>
        <SearchBar defaultValue={busca ?? ''} />
      </div>

      {showSlider && <div className="mb-10"><HeroSlider posts={featured} /></div>}

      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/blog"
          className={`text-xs font-medium px-3.5 py-2 rounded-full border transition-colors ${!categoria && !busca ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
          Todos
        </Link>
        {categories.map(cat => (
          <Link key={cat} href={`/blog?categoria=${cat}`}
            className={`text-xs font-medium px-3.5 py-2 rounded-full border transition-colors ${categoria === cat ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}>
            {CATEGORY_LABELS[cat]}
          </Link>
        ))}
      </div>

      {busca && (
        <p className="text-sm text-slate-500 mb-4">
          {posts.length} resultado{posts.length !== 1 ? 's' : ''} para &quot;{busca}&quot;
        </p>
      )}

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 mb-2">Nenhum artigo encontrado.</p>
          <Link href="/blog" className="text-sm text-brand-600 hover:underline">Ver todos os artigos</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      )}

      <div className="mt-16 py-12 px-8 rounded-2xl bg-slate-900 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Organize suas finanças com o Rook Money</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">Controle gastos, metas e contas em um só lugar. Grátis para começar.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors">
          Criar conta grátis
        </Link>
      </div>
    </div>
  )
}
