'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function HelpSearch({ defaultValue = '' }: { defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('busca', query.trim())
    router.push(`/support${params.toString() ? `?${params}` : ''}`)
  }

  function clear() {
    setQuery('')
    router.push('/support')
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-lg mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Buscar na central de ajuda..."
        className="w-full pl-12 pr-10 py-3.5 rounded-xl bg-white text-slate-800 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-lg"
      />
      {query && (
        <button type="button" onClick={clear} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X className="size-4" />
        </button>
      )}
    </form>
  )
}
