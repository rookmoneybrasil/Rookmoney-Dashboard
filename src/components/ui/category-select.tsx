'use client'

import { useState } from 'react'
import { Plus, Crown, Check, X, Loader2 } from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue,
} from './select'
import { clientApi } from '@/lib/api-client'
import Link from 'next/link'

interface Category { id: string; name: string; icon: string; color: string; isDefault?: boolean; userId?: string | null }

interface Props {
  categories:  Category[]
  value:       string
  onChange:    (id: string) => void
  placeholder?: string
  maxFree?:    number
}

const EMOJI_PRESETS = ['🍔','🚗','🏠','💊','🎮','👕','📚','✈️','💰','🎁','💡','📱','🏋️','🎵','🐾']

export function CategorySelect({ categories, value, onChange, placeholder = 'Selecione', maxFree = 3 }: Props) {
  const [creating,  setCreating]  = useState(false)
  const [name,      setName]      = useState('')
  const [icon,      setIcon]      = useState('📂')
  const [color,     setColor]     = useState('#6366f1')
  const [pending,   setPending]   = useState(false)
  const [error,     setError]     = useState('')
  const [isPro,     setIsPro]     = useState<boolean | null>(null)
  const [extraCats, setExtraCats] = useState<Category[]>([])

  // Merge server categories with newly created ones
  const allCategories = [...categories, ...extraCats]

  // Fetch plan lazily when user opens the create form
  async function checkPlanAndCreate() {
    if (isPro === null) {
      const user = await clientApi.me().catch(() => null)
      const pro  = user?.plan === 'PRO'
      setIsPro(pro)
      const customCount = categories.filter(c => !c.isDefault && c.userId !== null).length
      if (!pro && customCount >= maxFree) { setCreating(true); return }
      setCreating(true)
    } else {
      setCreating(true)
    }
  }

  const customCount = allCategories.filter(c => !c.isDefault && c.userId !== null).length
  const atLimit     = isPro === false && customCount >= maxFree

  const selected = allCategories.find(c => c.id === value)

  async function handleCreate() {
    if (!name.trim()) return
    setPending(true)
    setError('')
    try {
      const cat = await clientApi.createCategory({ name: name.trim(), icon, color })
      // Add to local list so it appears immediately without page reload
      setExtraCats(prev => [...prev, { id: cat.id, name: cat.name, icon: cat.icon, color: cat.color, isDefault: false, userId: 'me' }])
      onChange(cat.id)
      setCreating(false)
      setName('')
      setIcon('📂')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (msg.includes('PRO') || msg.includes('Limite')) {
        setError('upgrade')
      } else {
        setError(msg || 'Erro ao criar categoria.')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Select value={value} onValueChange={(v) => {
        if (v === '__create__') { setCreating(true); return }
        onChange(v)
      }}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder}>
            {selected ? <span>{selected.icon} {selected.name}</span> : placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allCategories.map(cat => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </SelectItem>
          ))}
          <SelectSeparator />
          <SelectItem value="__create__" onMouseDown={e => { e.preventDefault(); checkPlanAndCreate() }}>
            <span className="flex items-center gap-1.5 text-brand-400">
              <Plus className="size-3.5" />
              Nova categoria
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Inline create form */}
      {creating && (
        <div className="flex flex-col gap-2 p-3 bg-ink-800 border border-brand-600/30 rounded-xl">
          {atLimit ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-amber-300 flex items-center gap-1.5">
                <Crown className="size-3.5 fill-amber-400/20" />
                Limite de {maxFree} categorias no plano Free
              </p>
              <Link href="/billing"
                className="text-xs text-center bg-amber-400/15 border border-amber-400/25 text-amber-400 hover:bg-amber-400/25 px-3 py-2 rounded-lg transition-colors font-medium">
                Assinar PRO para criar ilimitadas
              </Link>
              <button onClick={() => setCreating(false)} className="text-xs text-slate-600 hover:text-slate-400 text-center">Cancelar</button>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-slate-400">Nova categoria</p>

              {/* Emoji picker */}
              <div className="flex flex-wrap gap-1">
                {EMOJI_PRESETS.map(e => (
                  <button key={e} type="button" onClick={() => setIcon(e)}
                    className={`text-base w-8 h-8 rounded-lg transition-colors ${icon === e ? 'bg-brand-600/40 ring-1 ring-brand-500' : 'hover:bg-ink-700'}`}>
                    {e}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  autoFocus
                  value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreate() } if (e.key === 'Escape') setCreating(false) }}
                  placeholder="Nome da categoria"
                  className="flex-1 bg-ink-700 border border-white/8 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50"
                />
                <input type="color" value={color} onChange={e => setColor(e.target.value)}
                  className="w-9 h-9 rounded-lg border border-white/8 bg-ink-700 cursor-pointer p-0.5" title="Cor" />
                <button type="button" onClick={handleCreate} disabled={!name.trim() || pending}
                  className="size-9 rounded-lg bg-brand-600 hover:bg-brand-500 flex items-center justify-center disabled:opacity-40 transition-colors">
                  {pending ? <Loader2 className="size-3.5 animate-spin text-white" /> : <Check className="size-3.5 text-white" />}
                </button>
                <button type="button" onClick={() => { setCreating(false); setError('') }}
                  className="size-9 rounded-lg bg-ink-700 hover:bg-ink-600 flex items-center justify-center transition-colors">
                  <X className="size-3.5 text-slate-400" />
                </button>
              </div>

              {error && error !== 'upgrade' && (
                <p className="text-xs text-danger">{error}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
