'use client'

import { Link } from '@/i18n/navigation'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input, FormField } from '@/components/ui/input'
import { clientApi } from '@/lib/api-client'
import { GoogleButton } from '@/components/auth/google-button'

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const c = useTranslations('common')
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending]           = useState(false)
  const [error, setError]               = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setPending(true)
    const fd       = new FormData(e.currentTarget)
    const name     = fd.get('name') as string
    const email    = fd.get('email') as string
    const password = fd.get('password') as string
    if (password.length < 8) { setError(t('passwordHint')); setPending(false); return }
    try {
      await clientApi.register({ name, email, password })
      router.push('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submit'))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-bold text-slate-100">{t('title')}</h1>
        <p className="text-sm text-slate-500">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2.5 text-sm text-danger">{error}</div>
        )}

        <FormField label={t('name')} htmlFor="name" required>
          <Input id="name" name="name" type="text" placeholder={t('namePlaceholder')} autoComplete="name" leftIcon={<User className="size-4" />} required />
        </FormField>

        <FormField label={t('email')} htmlFor="email" required>
          <Input id="email" name="email" type="email" placeholder={t('emailPlaceholder')} autoComplete="email" leftIcon={<Mail className="size-4" />} required />
        </FormField>

        <FormField label={t('password')} htmlFor="password" hint={t('passwordHint')} required>
          <Input
            id="password" name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={t('passwordHint')} autoComplete="new-password"
            leftIcon={<Lock className="size-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
            required
          />
        </FormField>

        <p className="text-xs text-slate-600">
          {t('terms')}{' '}
          <Link href="/terms" className="text-brand-400 hover:text-brand-300">{t('termsLink')}</Link>{' '}
          {t('and')}{' '}
          <Link href="/privacy" className="text-brand-400 hover:text-brand-300">{t('privacyLink')}</Link>.
        </p>

        <Button type="submit" size="lg" loading={pending} className="w-full mt-1">{t('submit')}</Button>
      </form>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-ink-600" />
        <span className="text-xs text-slate-600">{c('or')}</span>
        <div className="h-px flex-1 bg-ink-600" />
      </div>

      <Suspense fallback={<div className="h-11 bg-ink-700 rounded-xl animate-pulse" />}>
        <GoogleButton label={t('withGoogle')} />
      </Suspense>

      <p className="text-center text-sm text-slate-500">
        {t('hasAccount')}{' '}
        <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">{t('login')}</Link>
      </p>
    </div>
  )
}
