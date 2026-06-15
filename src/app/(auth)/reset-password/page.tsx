'use client'

import Link from 'next/link'
import { Lock, Eye, EyeOff, XCircle } from 'lucide-react'
import { useState, useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { resetPassword } from '@/app/actions/auth'

function ResetPasswordForm() {
  const [showPassword, setShowPassword]   = useState(false)
  const [showConfirm,  setShowConfirm]    = useState(false)
  const [state, formAction, pending]      = useActionState(resetPassword, undefined)
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') ?? ''

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-slate-100">Link inválido</h1>
        </div>
        <div className="rounded-xl bg-danger/10 border border-danger/20 p-5 flex gap-3">
          <XCircle className="size-5 text-danger shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300">
            Este link de redefinição é inválido ou expirou.
            Solicite um novo link na página de recuperação de senha.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm text-brand-400 hover:text-brand-300 transition-colors text-center"
        >
          Solicitar novo link
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-slate-100">Nova senha</h1>
        <p className="text-sm text-slate-500">Escolha uma senha forte para sua conta.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state?.error && (
          <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2.5 text-sm text-danger">
            {state.error}
          </div>
        )}

        {/* Hidden token field */}
        <input type="hidden" name="token" value={token} />

        <FormField label="Nova senha" htmlFor="password" required>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            leftIcon={<Lock className="size-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            required
          />
        </FormField>

        <FormField label="Confirmar senha" htmlFor="confirm" required>
          <Input
            id="confirm"
            name="confirm"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repita a nova senha"
            autoComplete="new-password"
            leftIcon={<Lock className="size-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="hover:text-slate-300 transition-colors"
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            required
          />
        </FormField>

        <Button type="submit" size="lg" loading={pending} className="w-full mt-2">
          Redefinir senha
        </Button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col gap-6">
        <div className="h-8 w-48 bg-ink-700 rounded animate-pulse" />
        <div className="h-12 bg-ink-700 rounded animate-pulse" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
