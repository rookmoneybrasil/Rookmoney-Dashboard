'use client'

import { useRouter } from 'next/navigation'
import { RotateCcw } from 'lucide-react'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

export function RevertReceiptButton({ sourceId }: { sourceId: string }) {
  const router = useRouter()
  const { mutate, pending } = useMutation(
    () => clientApi.revertIncomeReceipt(sourceId),
    { onSuccess: () => router.refresh() },
  )

  return (
    <button
      onClick={() => mutate()}
      disabled={pending}
      title="Desfazer recebimento"
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-300 hover:bg-ink-700 transition-colors"
    >
      <RotateCcw className="size-3.5" />
      Desfazer
    </button>
  )
}
