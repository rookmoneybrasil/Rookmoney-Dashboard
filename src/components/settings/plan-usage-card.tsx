import { Crown, Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { UserUsage, UserLimits } from '@/lib/api-client'

interface Props {
  plan:   string
  usage:  UserUsage
  limits: UserLimits
}

function Bar({ used, limit, label }: { used: number; limit: number | null; label: string }) {
  if (limit === null) {
    return (
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-400 font-medium">{used.toLocaleString('pt-BR')} <span className="text-slate-600">/ ilimitado</span></span>
      </div>
    )
  }
  const pct = Math.min(Math.round((used / limit) * 100), 100)
  const color = pct >= 90 ? 'bg-danger' : pct >= 70 ? 'bg-warning' : 'bg-brand-500'
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className={`font-medium ${pct >= 90 ? 'text-danger' : pct >= 70 ? 'text-warning' : 'text-slate-400'}`}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function PlanUsageCard({ plan, usage, limits }: Props) {
  const isPro = plan === 'PRO'

  return (
    <div className="flex flex-col gap-5">
      {/* Plan header */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${
        isPro ? 'bg-amber-400/5 border-amber-400/20' : 'bg-ink-700/60 border-white/6'
      }`}>
        <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
          isPro ? 'bg-amber-400/15' : 'bg-ink-600'
        }`}>
          {isPro
            ? <Crown className="size-5 text-amber-400 fill-amber-400/30" />
            : <Zap   className="size-5 text-brand-400" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-200">Plano {isPro ? 'PRO' : 'Gratuito'}</p>
          <p className="text-xs text-slate-500 mt-0.5">
            {isPro ? 'Todos os recursos desbloqueados' : 'Até atingir os limites do plano Free'}
          </p>
        </div>
        {!isPro && (
          <Link href="/billing"
            className="flex items-center gap-1.5 text-xs font-semibold bg-amber-400/15 text-amber-400 border border-amber-400/25 px-3 py-1.5 rounded-lg hover:bg-amber-400/25 transition-colors shrink-0">
            <Crown className="size-3" /> Upgrade
          </Link>
        )}
      </div>

      {/* Usage bars */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Uso este mês</p>
        <Bar used={usage.transactionsThisMonth} limit={limits.transactionsPerMonth} label="Transações"  />
        <Bar used={usage.bills}                 limit={limits.bills}                label="Contas"       />
        <Bar used={usage.goals}                 limit={limits.goals}                label="Metas"        />
        <Bar used={usage.people}                limit={limits.people}               label="Pessoas"      />
        <Bar used={usage.customCategories}      limit={limits.customCategories}     label="Categorias"   />
        <Bar used={usage.recurring}             limit={limits.recurring}            label="Recorrentes"  />
      </div>

      {/* Features */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Recursos</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { label: 'Relatórios',   enabled: limits.reports     },
            { label: 'Projeção',     enabled: limits.projection  },
            { label: 'Orçamento',    enabled: limits.budget      },
            { label: 'Importação',   enabled: limits.import      },
            { label: 'Chat IA',      enabled: false },
            { label: 'Scanner',      enabled: false },
          ].map(({ label, enabled }) => (
            <div key={label} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${
              enabled
                ? 'border-success/20 bg-success/5 text-success'
                : 'border-white/5 bg-ink-700/40 text-slate-600'
            }`}>
              <span>{enabled ? '✓' : '✗'}</span> {label}
            </div>
          ))}
        </div>
      </div>

      {!isPro && (
        <Link href="/billing"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-amber-400/10 hover:bg-amber-400/15 border border-amber-400/20 text-amber-400 text-sm font-semibold transition-colors">
          Ver planos e preços <ArrowRight className="size-4" />
        </Link>
      )}
    </div>
  )
}
