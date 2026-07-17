import type { MetadataRoute } from 'next'
import { APP_URL } from '@/lib/app-url'
import { getAllPosts } from '@/lib/blog'

// Regenera a cada hora — pega os posts novos do gerador diário sem rebuild.
export const revalidate = 3600

// Posts evergreen em markdown (src/content/blog). Ficam de fora do getAllPosts()
// em produção porque o readdirSync do diretório não é traçado no bundle
// serverless — então listamos os slugs aqui pra garantir que sejam indexados.
const STATIC_BLOG_SLUGS = [
  '5-dicas-economizar-dinheiro',
  'como-comecar-a-investir',
  'como-organizar-financas-pessoais',
  'o-que-e-reserva-de-emergencia',
  'orcamento-mensal-passo-a-passo',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${APP_URL}`,           changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${APP_URL}/blog`,      changeFrequency: 'daily',   priority: 0.8 },
    { url: `${APP_URL}/blog/sobre`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/blog/cotacoes`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${APP_URL}/help`,      changeFrequency: 'monthly', priority: 0.6 },
    { url: `${APP_URL}/changelog`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${APP_URL}/privacy`,   changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${APP_URL}/terms`,     changeFrequency: 'yearly',  priority: 0.3 },
    ...STATIC_BLOG_SLUGS.map(slug => ({
      url: `${APP_URL}/blog/${slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  const seen = new Set(staticRoutes.map(r => r.url))

  let postRoutes: MetadataRoute.Sitemap = []
  try {
    const posts = await getAllPosts()
    postRoutes = posts
      .map(post => ({
        url: `${APP_URL}/blog/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
      .filter(r => !seen.has(r.url)) // não duplica um slug estático que também esteja no DB
  } catch {
    // Se a API estiver fora, ainda servimos as rotas estáticas.
  }

  return [...staticRoutes, ...postRoutes]
}
