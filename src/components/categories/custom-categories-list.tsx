'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Trash2, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { clientApi, type Category } from '@/lib/api-client'
import { CategoryModal } from './category-modal'

interface Props { categories: Category[] }

// Optimistic delete — same pattern as bills/transactions/goals.
export function CustomCategoriesList({ categories }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(categories)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  useEffect(() => { setItems(categories) }, [categories])

  function setBusy(id: string, busy: boolean) {
    setBusyIds(prev => {
      const next = new Set(prev)
      busy ? next.add(id) : next.delete(id)
      return next
    })
  }

  async function deleteCategory(id: string) {
    if (busyIds.has(id)) return
    let rollback: Category[] | null = null
    setItems(prev => { rollback = prev; return prev.filter(c => c.id !== id) })
    setBusy(id, true)
    try {
      await clientApi.deleteCategory(id)
      router.refresh()
    } catch {
      if (rollback) setItems(rollback)
      alert('Erro ao excluir a categoria. Tente novamente.')
    } finally {
      setBusy(id, false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center gap-4 bg-ink-800/50 rounded-2xl border border-dashed border-ink-600">
        <div className="size-12 rounded-xl bg-ink-700 flex items-center justify-center text-slate-600">
          <Tag className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-slate-300 text-sm font-medium">Nenhuma categoria personalizada</p>
          <p className="text-slate-600 text-xs max-w-xs">Crie categorias com cor e emoji para organizar suas transações do seu jeito.</p>
        </div>
        <CategoryModal />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Personalizadas</h2>
      <Card padding="none">
        <CardContent>
          <div className="divide-y divide-white/5">
            {items.map((cat) => {
              const busy = busyIds.has(cat.id)
              return (
                <div key={cat.id} className={`flex items-center gap-4 px-5 py-3.5 group hover:bg-ink-600/30 transition-all ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="size-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: cat.color + '22', color: cat.color }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200">{cat.name}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="size-4 rounded-full border border-white/10" style={{ backgroundColor: cat.color }} />
                    <CategoryModal category={cat} />
                    {confirmingId === cat.id ? (
                      <div className="flex items-center gap-1 animate-in fade-in duration-150">
                        <span className="text-xs text-slate-500 flex items-center gap-1 mr-0.5">
                          <AlertTriangle className="size-3 text-warning shrink-0" />
                          Excluir?
                        </span>
                        <button
                          onClick={() => { setConfirmingId(null); deleteCategory(cat.id) }}
                          className="h-6 px-2 rounded text-xs font-medium bg-danger/15 text-danger hover:bg-danger/25 transition-colors border border-danger/20"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setConfirmingId(null)}
                          className="h-6 px-2 rounded text-xs font-medium bg-ink-600 text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingId(cat.id)}
                        disabled={busy}
                        className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-40"
                        title="Excluir"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
