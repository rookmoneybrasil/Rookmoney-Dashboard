'use client'

import { BorderGlow } from '@/components/ui/border-glow'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowUpFromLine } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useDashboardTheme } from '@/components/layout/dashboard-shell'
import Link from 'next/link'

interface Props {
  pendingBillsCount:   number
  pendingBillsAmount:  number
  personPayablesAmount: number
  overdueCount:        number
}

export function ThemedBillCard({ pendingBillsCount, pendingBillsAmount, personPayablesAmount, overdueCount }: Props) {
  const total = (pendingBillsAmount ?? 0) + (personPayablesAmount ?? 0)
  const { theme } = useDashboardTheme()
  const bg = theme === 'light' ? '#FFE7EC' : '#1A0505'

  return (
    <BorderGlow backgroundColor={bg} glowColor="0 84 60" colors={['#ef4444', '#f87171', '#dc2626']}
      borderRadius={12} glowRadius={24} glowIntensity={1.2} coneSpread={30} fillOpacity={0.6}>
      <Card className="bg-transparent border-transparent h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpFromLine className="size-4 text-danger" />
            A Pagar
          </CardTitle>
        </CardHeader>
        <CardContent>
          {total === 0 ? (
            <p className="text-sm text-slate-600 py-2 text-center">Nenhum compromisso pendente.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {pendingBillsCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">{pendingBillsCount} conta{pendingBillsCount !== 1 ? 's' : ''}</span>
                  <span className="text-sm font-semibold tabular-nums text-slate-300">{formatCurrency(pendingBillsAmount)}</span>
                </div>
              )}
              {(personPayablesAmount ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Dívidas com pessoas</span>
                  <span className="text-sm font-semibold tabular-nums text-slate-300">{formatCurrency(personPayablesAmount)}</span>
                </div>
              )}
              {overdueCount > 0 && (
                <div className="p-2 rounded-lg bg-danger/8 border border-danger/15">
                  <span className="text-xs font-semibold text-danger">⚠ {overdueCount} em atraso</span>
                </div>
              )}
              <div className="flex items-center justify-between border-t border-white/6 pt-2 mt-1">
                <span className="text-sm font-semibold text-slate-300">Total</span>
                <span className="text-base font-bold text-danger">{formatCurrency(total)}</span>
              </div>
              <Link href="/bills" className="text-xs text-brand-400 hover:text-brand-300 transition-colors text-center mt-1">
                Ver contas →
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </BorderGlow>
  )
}
