import { Lock, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { serverApi } from '@/lib/api-client'
import { DeleteCategoryButton } from '@/components/ui/delete-buttons'
import { CategoryModal } from '@/components/categories/category-modal'

export default async function CategoriesPage() {
  const categories = await serverApi.categories()

  const defaults = categories.filter((c) => c.isDefault)
  const custom   = categories.filter((c) => !c.isDefault)

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Categorias</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {custom.length} personalizada{custom.length !== 1 ? 's' : ''} · {defaults.length} padrão
          </p>
        </div>
        <CategoryModal />
      </div>

      {/* Custom categories */}
      {custom.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Personalizadas</h2>
          <Card padding="none">
            <CardContent>
              <div className="divide-y divide-white/5">
                {custom.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-4 px-5 py-3.5 group hover:bg-ink-600/30 transition-colors">
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
                      <DeleteCategoryButton id={cat.id} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {custom.length === 0 && (
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
      )}

      {/* Default categories */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Padrão</h2>
        <Card padding="none">
          <CardContent>
            <div className="divide-y divide-white/5">
              {defaults.map((cat) => (
                <div key={cat.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="size-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: cat.color + '22', color: cat.color }}>
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-400">{cat.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded-full border border-white/10" style={{ backgroundColor: cat.color }} />
                    <Badge variant="default" size="sm">
                      <Lock className="size-2.5 mr-1" />Padrão
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
