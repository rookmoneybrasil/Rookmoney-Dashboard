'use client'

import { useState } from 'react'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'

export function NewsletterBanner() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const json = await res.json()
      if (json.ok) {
        setStatus('success')
        setMessage(json.data?.message ?? 'Inscrito com sucesso!')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(json.error ?? 'Erro ao se inscrever.')
      }
    } catch {
      setStatus('error')
      setMessage('Erro de conexão. Tente novamente.')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <CheckCircle className="size-8 text-emerald-500 shrink-0" />
          <div>
            <h3 className="text-lg font-bold text-emerald-800">Inscrito com sucesso!</h3>
            <p className="text-sm text-emerald-600 mt-1">{message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-brand-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="size-12 rounded-xl bg-brand-600/20 flex items-center justify-center shrink-0">
            <Mail className="size-6 text-brand-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Newsletter Rook Money</h3>
            <p className="text-sm text-slate-400 mt-1">
              Receba artigos sobre finanças, investimentos e dicas direto no seu email. Sem spam, pode cancelar quando quiser.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:w-auto shrink-0">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setStatus('idle') }}
            placeholder="seu@email.com"
            className="h-11 px-4 rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent w-full sm:w-56"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="h-11 px-5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 shrink-0 flex items-center gap-2"
          >
            {status === 'loading' ? <Loader2 className="size-4 animate-spin" /> : 'Inscrever-se'}
          </button>
        </form>
      </div>

      {status === 'error' && (
        <p className="text-xs text-red-400 mt-3 ml-16">{message}</p>
      )}
    </div>
  )
}

export function NewsletterInline() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const json = await res.json()
      setStatus(json.ok ? 'success' : 'error')
      if (json.ok) setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-emerald-600 text-sm py-2">
        <CheckCircle className="size-4" /> Inscrito! Você receberá nossos artigos por email.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Seu email"
        className="h-9 px-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500 w-44"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="h-9 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        {status === 'loading' ? <Loader2 className="size-3 animate-spin" /> : <Mail className="size-3" />}
        Inscrever
      </button>
    </form>
  )
}
