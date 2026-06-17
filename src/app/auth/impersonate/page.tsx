'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function ImpersonateInner() {
  const router  = useRouter()
  const params  = useSearchParams()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { router.replace('/'); return }

    fetch('/api/v1/auth/impersonate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.ok) router.replace('/dashboard')
        else setError(data.error ?? 'Token inválido.')
      })
      .catch(() => setError('Erro ao validar token.'))
  }, [params, router])

  if (error) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#080e1d' }}>
        <p style={{ color: '#ef4444', fontSize: 15 }}>{error}</p>
        <a href="/" style={{ color: '#60a5fa', fontSize: 13 }}>Voltar para o início</a>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#080e1d' }}>
      <p style={{ color: '#94a3b8', fontSize: 14 }}>Abrindo sessão...</p>
    </div>
  )
}

export default function ImpersonatePage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#080e1d' }}>
        <p style={{ color: '#94a3b8', fontSize: 14 }}>Carregando...</p>
      </div>
    }>
      <ImpersonateInner />
    </Suspense>
  )
}
