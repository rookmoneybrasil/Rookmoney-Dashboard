import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getAllPosts, getPostBySlug } from '@/lib/blog'
import { ArticleHeader } from '@/components/blog/article-header'
import { ArticleCTA } from '@/components/blog/article-cta'
import { ShareButtons } from '@/components/blog/share-buttons'
import { AdSenseUnit } from '@/components/blog/adsense-unit'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rookmoney.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: post.image, width: 1200, height: 630, alt: post.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const parts = post.content.split('<!-- ad -->')

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    author: { '@type': 'Person', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'Rook Money',
      logo: { '@type': 'ImageObject', url: `${APP_URL}/icon-512.png` },
    },
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <ArticleHeader post={post} />

      <AdSenseUnit slot="top-article" format="horizontal" />

      <div className="prose prose-slate max-w-none
        prose-headings:text-slate-800 prose-headings:font-bold
        prose-p:text-slate-600 prose-p:leading-relaxed
        prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-slate-800
        prose-blockquote:border-l-brand-500 prose-blockquote:text-slate-500 prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
        prose-code:text-brand-600 prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
        prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-200
        prose-li:text-slate-600 prose-li:marker:text-slate-400
        prose-hr:border-slate-200
        prose-img:rounded-xl prose-img:border prose-img:border-slate-200
        prose-th:text-slate-700 prose-td:text-slate-600
        prose-table:text-sm
      ">
        {parts.map((part, i) => (
          <div key={i}>
            <Markdown remarkPlugins={[remarkGfm]}>{part}</Markdown>
            {i < parts.length - 1 && (
              <AdSenseUnit slot="mid-article" format="rectangle" />
            )}
          </div>
        ))}
      </div>

      <ShareButtons title={post.title} />
      <ArticleCTA />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  )
}
