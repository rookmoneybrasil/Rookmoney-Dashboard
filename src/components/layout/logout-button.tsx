'use client'

import { LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      title="Sair"
      className="size-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-ink-700 transition-colors"
    >
      <LogOut className="size-3.5" />
    </button>
  )
}
