import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://rookmoney.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts()

  return [
    { url: APP_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${APP_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map(post => ({
      url: `${APP_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${APP_URL}/support`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${APP_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${APP_URL}/changelog`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
