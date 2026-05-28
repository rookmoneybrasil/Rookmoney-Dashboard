'use client'

import { useRouter } from 'next/navigation'
import { Crown, Shield, Trash2 } from 'lucide-react'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface PlanToggleProps { userId: string; currentPlan: string }
interface AdminToggleProps { userId: string; isAdmin: boolean }
interface DeleteButtonProps { userId: string }

export function PlanToggle({ userId, currentPlan }: PlanToggleProps) {
  const isProNow = currentPlan === 'PRO'
  const nextPlan = isProNow ? 'FREE' : 'PRO'
  const router   = useRouter()

  const { mutate, pending } = useMutation<void>(
    () => clientApi.adminSetPlan(userId, nextPlan as 'FREE' | 'PRO'),
    { onSuccess: () => router.refresh() },
  )

  return (
    <button
      onClick={() => mutate()}
      disabled={pending}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${
        isProNow
          ? 'bg-ink-700 hover:bg-ink-600 border border-white/8 text-slate-300'
          : 'bg-amber-900/60 hover:bg-amber-800/60 border border-amber-700/40 text-amber-300'
      }`}
    >
      <Crown className="size-4" />
      {isProNow ? 'Rebaixar para Free' : 'Promover para Pro'}
    </button>
  )
}

export function AdminToggle({ userId, isAdmin }: AdminToggleProps) {
  const router = useRouter()

  const { mutate, pending } = useMutation<void>(
    () => clientApi.adminSetAdmin(userId, !isAdmin),
    { onSuccess: () => router.refresh() },
  )

  return (
    <button
      onClick={() => mutate()}
      disabled={pending}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-ink-700 hover:bg-ink-600 border border-white/8 text-slate-300 transition-colors disabled:opacity-60"
    >
      <Shield className="size-4" />
      {isAdmin ? 'Remover admin' : 'Tornar admin'}
    </button>
  )
}

export function DeleteButton({ userId }: DeleteButtonProps) {
  const router = useRouter()

  const { mutate, pending } = useMutation<void>(
    () => clientApi.adminDeleteUser(userId),
    { onSuccess: () => router.push('/admin/users') },
  )

  return (
    <button
      onClick={() => {
        if (confirm('Tem certeza? Esta ação é irreversível e deleta TODOS os dados do usuário.')) {
          mutate()
        }
      }}
      disabled={pending}
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger transition-colors disabled:opacity-60"
    >
      <Trash2 className="size-4" />
      {pending ? 'Deletando...' : 'Deletar conta'}
    </button>
  )
}
