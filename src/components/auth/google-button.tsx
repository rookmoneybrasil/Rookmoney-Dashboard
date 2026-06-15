'use client'

import { useSearchParams } from 'next/navigation'

const ERRORS: Record<string, string> = {
  google_cancelled: 'Login com Google cancelado.',
  google_state:     'Sessão expirada. Tente novamente.',
  google_token:     'Erro ao autenticar com Google. Tente novamente.',
  google_email:     'Conta Google sem e-mail verificado.',
  google_userinfo:  'Erro ao obter dados do Google.',
}

export function GoogleButton({ label = 'Continuar com Google' }: { label?: string }) {
  const searchParams = useSearchParams()
  const errorKey = searchParams.get('error')
  const errorMsg = errorKey ? (ERRORS[errorKey] ?? 'Erro ao fazer login com Google.') : null

  return (
    <div className="flex flex-col gap-3">
      {errorMsg && (
        <div className="rounded-lg bg-danger/10 border border-danger/20 px-3 py-2.5 text-sm text-danger text-center">
          {errorMsg}
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- full page navigation required for OAuth redirect */}
      <a
        href="/api/auth/google"
        className="flex items-center justify-center gap-3 h-11 px-4 rounded-xl border border-white/10 bg-ink-800 hover:bg-ink-700 text-slate-200 text-sm font-medium transition-colors"
      >
        {/* Google G logo */}
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
        </svg>
        {label}
      </a>
    </div>
  )
}
