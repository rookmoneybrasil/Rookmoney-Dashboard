'use client'

import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { clientApi } from '@/lib/api-client'
import { GoogleButton } from '@/components/auth/google-button'

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending]           = useState(false)
  const [error, setError]               = useState('')
  const searchParams = useSearchParams()
  const router       = useRouter()
  const resetOk      = searchParams.get('reset') === '1'
  const from         = searchParams.get('from') ?? ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const fd         = new FormData(e.currentTarget)
    const email      = fd.get('email') as string
    const password   = fd.get('password') as string
    const rememberMe = fd.get('remember') === 'on'
    try {
      await clientApi.login({ email, password, rememberMe })
      router.push(from.startsWith('/') && !from.startsWith('//') ? from : '/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-slate-100">Entrar na conta</h1>
        <p className="text-sm text-slate-500">Bem-vindo de volta. Insira seus dados abaixo.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {resetOk && (
          <div className="rounded-lg bg-success/10 border border-success/20 px-3 py-2.5 text-sm text-success flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            Senha redefinida com sucesso! Faça login com sua nova senha.
          </div>
        )}
        {error && (
          <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2.5 text-sm text-danger">
            {error}
          </div>
        )}

        <FormField label="E-mail" htmlFor="email" required>
          <Input id="email" name="email" type="email" placeholder="voce@exemplo.com" autoComplete="email" leftIcon={<Mail className="size-4" />} required />
        </FormField>

        <FormField label="Senha" htmlFor="password" required>
          <Input
            id="password" name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••" autoComplete="current-password"
            leftIcon={<Lock className="size-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            required
          />
        </FormField>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="remember" defaultChecked className="size-4 rounded border-ink-500 bg-ink-800 text-brand-500 focus:ring-brand-500/50" />
            <span className="text-sm text-slate-400">Lembrar de mim</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
            Esqueci a senha
          </Link>
        </div>

        <Button type="submit" size="lg" loading={pending} className="w-full mt-2">Entrar</Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-600" />
        <span className="text-xs text-slate-600">ou</span>
        <div className="h-px flex-1 bg-ink-600" />
      </div>

      <Suspense fallback={<div className="h-11 bg-ink-700 rounded-xl animate-pulse" />}>
        <GoogleButton label="Entrar com Google" />
      </Suspense>

      <p className="text-center text-sm text-slate-500">
        Não tem conta?{' '}
        <Link href="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Criar conta grátis</Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex flex-col gap-6"><div className="h-8 w-40 bg-ink-700 rounded animate-pulse" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
