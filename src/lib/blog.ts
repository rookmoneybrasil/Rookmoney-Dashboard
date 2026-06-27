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

const BLOG_DIR = path.join(process.cwd(), 'src', 'content', 'blog')

export function getAllPosts(): PostFrontmatter[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md'))

  return files
    .map(filename => {
      const slug = filename.replace(/\.md$/, '')
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), 'utf-8')
      const { data, content } = matter(raw)
      const rt = readingTime(content)

      return {
        ...data,
        slug,
        readingTime: rt.text.replace('read', 'leitura'),
        published: data.published ?? true,
      } as PostFrontmatter
    })
    .filter(p => p.published)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const rt = readingTime(content)

  return {
    ...data,
    slug,
    content,
    readingTime: rt.text.replace('read', 'leitura'),
    published: data.published ?? true,
  } as Post
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
