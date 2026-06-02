'use client'

import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { requestPasswordReset } from '@/app/actions/auth'

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, undefined)

  if (state?.success) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-slate-100">Verifique seu e-mail</h1>
          <p className="text-sm text-slate-500">Instruções de redefinição enviadas.</p>
        </div>

        <div className="rounded-xl bg-success/10 border border-success/20 p-5 flex gap-3">
          <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300 leading-relaxed">
            Se existe uma conta com esse e-mail, você receberá um link de redefinição de senha
            nos próximos minutos. Verifique também a pasta de spam.
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Voltar para o login
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-slate-100">Esqueci a senha</h1>
        <p className="text-sm text-slate-500">
          Digite seu e-mail e enviaremos um link para criar uma nova senha.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state?.error && (
          <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2.5 text-sm text-danger">
            {state.error}
          </div>
        )}

        <FormField label="E-mail" htmlFor="email" required>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            autoComplete="email"
            leftIcon={<Mail className="size-4" />}
            required
          />
        </FormField>

        <Button type="submit" size="lg" loading={pending} className="w-full mt-2">
          Enviar link de redefinição
        </Button>
      </form>

      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm text-brand-400 hover:text-brand-300 transition-colors justify-center"
      >
        <ArrowLeft className="size-4" />
        Voltar para o login
      </Link>
    </div>
  )
}
