import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar } from 'lucide-react'
import { CategoryBadge } from './category-badge'
import type { PostFrontmatter } from '@/lib/blog'

export function ArticleCard({ post }: { post: PostFrontmatter }) {
  const dateStr = new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-200">
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute top-3 left-3">
          <CategoryBadge category={post.category} />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-5 flex-1">
        <h2 className="text-base font-semibold text-slate-800 line-clamp-2 group-hover:text-brand-600 transition-colors">
          {post.title}
        </h2>
        <p className="text-sm text-slate-500 line-clamp-2 flex-1">{post.excerpt}</p>
        <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
          <span className="flex items-center gap-1"><Calendar className="size-3" />{dateStr}</span>
          <span className="flex items-center gap-1"><Clock className="size-3" />{post.readingTime}</span>
        </div>
      </div>
    </Link>
  )
}
