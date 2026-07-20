import Link from 'next/link'
import { Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { Account } from '@/lib/api-client'

export function WalletsSummary({ accounts, total }: { accounts: Account[]; total: number }) {
  const active = accounts.filter(a => !a.archived)
  if (active.length === 0) return null
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-brand-400" />
            <h3 className="text-sm font-bold text-slate-200">Carteiras</h3>
          </div>
          <Link href="/wallets" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Ver todas →</Link>
        </div>
        <p className={`text-2xl font-extrabold mb-3 ${total < 0 ? 'text-danger' : 'text-slate-100'}`}>{formatCurrency(total)}</p>
        <div className="flex flex-col gap-1.5">
          {active.slice(0, 5).map((a) => (
            <div key={a.id} className="flex items-center gap-2.5">
              <div className="size-7 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: a.color + '22' }}>{a.icon}</div>
              <span className="text-sm text-slate-300 flex-1 truncate">{a.name}</span>
              <span className={`text-sm font-semibold tabular-nums ${a.balance < 0 ? 'text-danger' : 'text-slate-200'}`}>{formatCurrency(a.balance)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
