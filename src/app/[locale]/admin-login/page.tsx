'use client'

import { useState, useTransition } from 'react'
import { Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react'
import Image from 'next/image'
import { adminLogin } from '@/app/actions/admin-auth'

export default function AdminLoginPage() {
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError]     = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setError('')
    startTransition(async () => {
      const result = await adminLogin(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo + badge */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="relative h-8 w-32">
            <Image src="/SVG/logo branco.svg" alt="Rook Money" fill className="object-contain" />
          </div>
          <span className="text-xs font-bold text-danger bg-danger/10 border border-danger/25 px-3 py-1 rounded-full tracking-widest">
            BACKOFFICE
          </span>
        </div>

        <div className="bg-ink-800 border border-white/8 rounded-2xl p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-bold text-slate-100">Acesso restrito</h1>
            <p className="text-sm text-slate-500">Insira a senha de administrador para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 bg-danger/10 border border-danger/20 rounded-xl px-3 py-2.5">
                <ShieldAlert className="size-4 text-danger shrink-0" />
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500 pointer-events-none" />
              <input
                name="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Senha de administrador"
                required
                autoFocus
                className="w-full bg-ink-700 border border-white/8 rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-600/60 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {pending ? 'Verificando...' : 'Entrar no backoffice'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          Acesso monitorado. Apenas administradores autorizados.
        </p>
      </div>
    </div>
  )
}
