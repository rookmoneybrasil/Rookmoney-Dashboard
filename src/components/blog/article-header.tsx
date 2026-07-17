import Image from 'next/image'
import { Clock, Calendar, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CategoryBadge } from './category-badge'
import type { PostFrontmatter } from '@/lib/blog'

export function ArticleHeader({ post }: { post: PostFrontmatter }) {
  const dateStr = new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  return (
    <header className="flex flex-col gap-6 mb-10">
      <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors w-fit">
        <ArrowLeft className="size-4" />
        Voltar ao blog
      </Link>

      <div className="flex flex-col gap-4">
        <CategoryBadge category={post.category} />
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">{post.title}</h1>
        <p className="text-lg text-slate-500">{post.excerpt}</p>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400">
        <Link href="/blog/sobre" className="flex items-center gap-1.5 hover:text-slate-600 transition-colors">
          <User className="size-3.5" />{post.author}
        </Link>
        <span className="flex items-center gap-1.5"><Calendar className="size-3.5" />{dateStr}</span>
        <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{post.readingTime}</span>
      </div>

      <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
      </div>
    </header>
  )
}
