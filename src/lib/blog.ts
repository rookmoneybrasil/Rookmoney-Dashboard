import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

export type BlogCategory = 'dicas' | 'educacao-financeira' | 'investimentos' | 'rook-updates' | 'cripto' | 'curiosidades'

export interface PostFrontmatter {
  title: string
  excerpt: string
  date: string
  category: BlogCategory
  image: string
  imageAlt: string
  author: string
  slug: string
  readingTime: string
  published: boolean
}

export interface Post extends PostFrontmatter {
  content: string
}

const API_URL = process.env.API_URL ?? 'http://localhost:3000'
const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog')

// ── Read from DB via API ──────────────────────────────────────────────────────

async function fetchFromAPI(path: string): Promise<unknown> {
  try {
    const res = await fetch(`${API_URL}/api/v1/blog${path}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch { return null }
}

function apiPostToFrontmatter(post: Record<string, unknown>): PostFrontmatter {
  const content = (post.content as string) ?? ''
  const rt = readingTime(content)
  return {
    title: post.title as string,
    excerpt: post.excerpt as string,
    date: (post.createdAt as string) ?? new Date().toISOString(),
    category: post.category as BlogCategory,
    image: post.image as string,
    imageAlt: post.imageAlt as string,
    author: post.author as string,
    slug: post.slug as string,
    readingTime: rt.text.replace('read', 'leitura'),
    published: post.published as boolean,
  }
}

function apiPostToPost(post: Record<string, unknown>): Post {
  return {
    ...apiPostToFrontmatter(post),
    content: (post.content as string) ?? '',
  }
}

// ── Read from static files ────────────────────────────────────────────────────

function getStaticPosts(): PostFrontmatter[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))
  return files.map(filename => {
    const slug = filename.replace(/\.md$/, '')
    const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
    const { data, content } = matter(raw)
    const rt = readingTime(content)
    return { ...data, slug, readingTime: rt.text.replace('read', 'leitura'), published: data.published ?? true } as PostFrontmatter
  }).filter(p => p.published)
}

function getStaticPost(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const rt = readingTime(content)
  return { ...data, slug, content, readingTime: rt.text.replace('read', 'leitura'), published: data.published ?? true } as Post
}

// ── Combined: DB + static files ───────────────────────────────────────────────

export async function getAllPosts(): Promise<PostFrontmatter[]> {
  const staticPosts = getStaticPosts()

  const apiData = await fetchFromAPI('?pageSize=100') as { items: Record<string, unknown>[] } | null
  const dbPosts = apiData?.items?.map(apiPostToFrontmatter) ?? []

  const dbSlugs = new Set(dbPosts.map(p => p.slug))
  const combined = [
    ...dbPosts,
    ...staticPosts.filter(p => !dbSlugs.has(p.slug)),
  ]

  return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const apiPost = await fetchFromAPI(`/${slug}`) as Record<string, unknown> | null
  if (apiPost) return apiPostToPost(apiPost)
  return getStaticPost(slug)
}

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  'dicas': 'Dicas',
  'educacao-financeira': 'Educação Financeira',
  'investimentos': 'Investimentos',
  'rook-updates': 'Rook Updates',
  'cripto': 'Cripto',
  'curiosidades': 'Curiosidades',
}

export const CATEGORY_COLORS: Record<BlogCategory, { bg: string; text: string; border: string }> = {
  'dicas': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'educacao-financeira': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'investimentos': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'rook-updates': { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  'cripto': { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'curiosidades': { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
}
