'use client'

import { ConfirmDeleteButton } from '@/components/ui/confirm-delete-button'
import { deleteAccount } from '@/app/actions/settings'

export function DeleteAccountButton() {
  return (
    <ConfirmDeleteButton
      action={deleteAccount}
      icon="trash"
      label="Isso é irreversível!"
      title="Excluir minha conta"
      className="h-8 px-3 rounded-md text-xs font-medium bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 transition-colors flex items-center gap-1.5"
    />
  )
}
