'use client'

import Link from 'next/link'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useActionState } from 'react'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { register } from '@/app/actions/auth'
import { GoogleButton } from '@/components/auth/google-button'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction, pending] = useActionState(register, undefined)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-slate-100">Criar conta</h1>
        <p className="text-sm text-slate-500">É grátis. Comece a organizar seu dinheiro hoje.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {state?.message && (
          <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2.5 text-sm text-danger">
            {state.message}
          </div>
        )}

        <FormField label="Nome" htmlFor="name" required error={state?.errors?.name?.[0]}>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Seu nome completo"
            autoComplete="name"
            leftIcon={<User className="size-4" />}
            required
          />
        </FormField>

        <FormField label="E-mail" htmlFor="email" required error={state?.errors?.email?.[0]}>
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

        <FormField
          label="Senha"
          htmlFor="password"
          hint="Mínimo 8 caracteres com letras e números"
          required
          error={state?.errors?.password?.[0]}
        >
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

        <p className="text-xs text-slate-600">
          Ao criar uma conta você concorda com nossos{' '}
          <Link href="/terms" className="text-brand-400 hover:text-brand-300">
            Termos de Uso
          </Link>{' '}
          e{' '}
          <Link href="/privacy" className="text-brand-400 hover:text-brand-300">
            Política de Privacidade
          </Link>
          .
        </p>

        <Button type="submit" size="lg" loading={pending} className="w-full mt-1">
          Criar conta grátis
        </Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-600" />
        <span className="text-xs text-slate-600">ou</span>
        <div className="h-px flex-1 bg-ink-600" />
      </div>

      <Suspense fallback={<div className="h-11 bg-ink-700 rounded-xl animate-pulse" />}>
        <GoogleButton label="Registrar com Google" />
      </Suspense>

      <p className="text-center text-sm text-slate-500">
        Já tem conta?{' '}
        <Link
          href="/login"
          className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
        >
          Entrar
        </Link>
      </p>
    </div>
  )
}
