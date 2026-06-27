'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SearchBar({ defaultValue = '' }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('busca', query.trim())
    router.push(`/blog${params.toString() ? `?${params}` : ''}`)
  }

  function clear() {
    setQuery('')
    router.push('/blog')
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Buscar artigo..."
        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
      {query && (
        <button type="button" onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X className="size-4" />
        </button>
      )}
    </form>
  )
}
