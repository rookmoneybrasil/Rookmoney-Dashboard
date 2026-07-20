import { serverApi } from '@/lib/api-client'
import { WalletsList } from '@/components/wallets/wallets-list'

export const dynamic = 'force-dynamic'

export default async function WalletsPage() {
  const data = await serverApi.accounts().catch(() => ({ accounts: [], total: 0 }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Carteiras</h1>
        <p className="text-sm text-slate-500 mt-1">
          Suas contas e cartões — o saldo é o valor inicial + tudo que entrou − tudo que saiu daquela conta.
        </p>
      </div>
      <WalletsList accounts={data.accounts} total={data.total} />
    </div>
  )
}
