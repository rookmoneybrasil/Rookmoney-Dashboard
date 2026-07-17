import type { MetadataRoute } from 'next'
import { APP_URL } from '@/lib/app-url'
import { getAllPosts } from '@/lib/blog'

// Regenera a cada hora — pega os posts novos do gerador diário sem rebuild.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${APP_URL}`,           changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${APP_URL}/blog`,      changeFrequency: 'daily',   priority: 0.8 },
    { url: `${APP_URL}/blog/cotacoes`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${APP_URL}/help`,      changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/changelog`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/privacy`,   changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${APP_URL}/terms`,     changeFrequency: 'yearly',  priority: 0.3 },
  ]

  let postRoutes: MetadataRoute.Sitemap = []
  try {
    const posts = await getAllPosts()
    postRoutes = posts.map(post => ({
      url: `${APP_URL}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    // Se a API estiver fora, ainda servimos as rotas estáticas.
  }

  return [...staticRoutes, ...postRoutes]
}
