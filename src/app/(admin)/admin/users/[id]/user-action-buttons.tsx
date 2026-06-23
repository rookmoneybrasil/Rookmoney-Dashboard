'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Crown, Shield, Trash2, Sparkles, ChevronDown } from 'lucide-react'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'

interface PlanToggleProps { userId: string; currentPlan: string }
interface AdminToggleProps { userId: string; isAdmin: boolean }
interface DeleteButtonProps { userId: string }

const PLAN_OPTIONS: { value: 'FREE' | 'PRO' | 'PRO_PLUS'; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'FREE',     label: 'Free',  icon: null,                                      color: 'text-slate-400' },
  { value: 'PRO',      label: 'Pro',   icon: <Crown className="size-3" />,               color: 'text-amber-400' },
  { value: 'PRO_PLUS', label: 'Pro+',  icon: <Sparkles className="size-3" />,            color: 'text-orange-400' },
]

export function PlanToggle({ userId, currentPlan }: PlanToggleProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const { mutate, pending } = useMutation<void>(
    async () => { /* placeholder, overridden by setPlan below */ },
    { onSuccess: () => router.refresh() },
  )

  function setPlan(plan: 'FREE' | 'PRO' | 'PRO_PLUS') {
    if (plan === currentPlan) { setOpen(false); return }
    setOpen(false)
    clientApi.adminSetPlan(userId, plan).then(() => {
      window.location.reload()
    })
  }

  const current = PLAN_OPTIONS.find(p => p.value === currentPlan) ?? PLAN_OPTIONS[0]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={pending}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 bg-ink-700 hover:bg-ink-600 border border-white/8 text-slate-300"
      >
        <Crown className="size-4" />
        Plano: <span className={current.color}>{current.label}</span>
        <ChevronDown className="size-3.5" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-ink-800 border border-white/10 rounded-xl shadow-xl py-1 min-w-[160px]">
          {PLAN_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPlan(opt.value)}
              className={`flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-ink-700 transition-colors ${
                opt.value === currentPlan ? 'font-bold' : 'font-medium'
              } ${opt.color}`}
            >
              {opt.icon}
              {opt.label}
              {opt.value === currentPlan && <span className="ml-auto text-[10px] text-slate-600">atual</span>}
            </button>
          ))}
        </div>
      )}
    </div>
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
