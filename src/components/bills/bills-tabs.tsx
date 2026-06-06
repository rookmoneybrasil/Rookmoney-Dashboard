'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Wifi } from 'lucide-react'
import type { PluggyItemRecord, PluggyBoleto } from '@/lib/api-client'

const PluggySection = dynamic(
  () => import('@/components/pluggy/pluggy-connect-button').then(m => ({ default: m.PluggySection })),
  { ssr: false, loading: () => null }
)

interface Props {
  children:       React.ReactNode
  pluggyItems:    PluggyItemRecord[]
  pluggyBoletos:  PluggyBoleto[]
  openFinanceBadge?: number
}

export function BillsTabs({ children, pluggyItems, pluggyBoletos, openFinanceBadge }: Props) {
  const [tab, setTab] = useState<'contas' | 'openfinance'>('contas')

  return (
    <div className="flex flex-col gap-6">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-white/8 pb-0">
        <TabBtn active={tab === 'contas'} onClick={() => setTab('contas')}>
          Contas a pagar
        </TabBtn>
        <TabBtn active={tab === 'openfinance'} onClick={() => setTab('openfinance')}>
          <span className="flex items-center gap-1.5">
            <Wifi className="size-3.5" />
            Open Finance
            {openFinanceBadge != null && openFinanceBadge > 0 && (
              <span className="size-4 rounded-full bg-blue-500 text-white text-[9px] font-bold flex items-center justify-center">
                {openFinanceBadge}
              </span>
            )}
          </span>
        </TabBtn>
      </div>

      {/* Tab content */}
      {tab === 'contas' ? (
        <>{children}</>
      ) : (
        <PluggySection initialItems={pluggyItems} initialBoletos={pluggyBoletos} />
      )}
    </div>
  )
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active
          ? 'border-brand-400 text-brand-400'
          : 'border-transparent text-slate-500 hover:text-slate-300'
      }`}
    >
      {children}
    </button>
  )
}
