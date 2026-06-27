'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import type { PostFrontmatter } from '@/lib/blog'

const CATEGORY_COLORS: Record<string, string> = {
  'dicas': 'bg-blue-600',
  'educacao-financeira': 'bg-emerald-600',
  'investimentos': 'bg-amber-600',
  'rook-updates': 'bg-violet-600',
  'cripto': 'bg-orange-600',
  'curiosidades': 'bg-pink-600',
}

const CATEGORY_LABELS: Record<string, string> = {
  'dicas': 'Dicas',
  'educacao-financeira': 'Educação Financeira',
  'investimentos': 'Investimentos',
  'rook-updates': 'Rook Updates',
  'cripto': 'Cripto',
  'curiosidades': 'Curiosidades',
}

export function HeroSlider({ posts }: { posts: PostFrontmatter[] }) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => setCurrent(i => (i + 1) % posts.length), [posts.length])
  const prev = useCallback(() => setCurrent(i => (i - 1 + posts.length) % posts.length), [posts.length])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  if (posts.length === 0) return null

  const post = posts[current]
  const dateStr = new Date(post.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="relative w-full aspect-[21/9] sm:aspect-[21/7] rounded-2xl overflow-hidden group">
      <Link href={`/blog/${post.slug}`} className="block size-full">
        <Image
          src={post.image}
          alt={post.imageAlt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 1200px) 100vw, 1200px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <span className={`inline-block text-xs font-semibold text-white px-2.5 py-1 rounded-md mb-3 ${CATEGORY_COLORS[post.category] ?? 'bg-slate-600'}`}>
            {CATEGORY_LABELS[post.category] ?? post.category}
          </span>
          <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 line-clamp-2">{post.title}</h2>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <span>{dateStr}</span>
            <span className="flex items-center gap-1"><Clock className="size-3.5" />{post.readingTime}</span>
          </div>
        </div>
      </Link>

      {posts.length > 1 && (
        <>
          <button onClick={(e) => { e.preventDefault(); prev() }}
            className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
            <ChevronLeft className="size-5" />
          </button>
          <button onClick={(e) => { e.preventDefault(); next() }}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60">
            <ChevronRight className="size-5" />
          </button>

          <div className="absolute bottom-3 right-6 sm:right-8 flex gap-1.5">
            {posts.map((_, i) => (
              <button key={i} onClick={(e) => { e.preventDefault(); setCurrent(i) }}
                className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
