'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Trash2 } from 'lucide-react'
import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button'
import { deletePerson } from '@/app/actions/people'

export function DeletePersonButton({ personId }: { personId: string }) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  return (
    <ConfirmDeleteButton
      action={async () => {
        await deletePerson(personId)
        router.push('/people')
      }}
      icon="trash"
      label="Excluir pessoa e todos os lançamentos?"
      title="Excluir pessoa"
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-danger/10 hover:bg-danger/20 text-danger text-sm font-medium transition-colors border border-danger/20"
    />
  )
}
