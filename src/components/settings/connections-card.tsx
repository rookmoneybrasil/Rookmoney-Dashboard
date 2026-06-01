'use client'

import { useState } from 'react'
import { clientApi } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle } from 'lucide-react'

interface Props { hasGoogle: boolean; hasPassword: boolean }

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export function ConnectionsCard({ hasGoogle, hasPassword }: Props) {
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState('')
  const [done,  setDone]  = useState(false)

  async function handleDisconnect() {
    if (!confirm('Desconectar o Google? Você ainda poderá entrar com e-mail e senha.')) return
    setDisconnecting(true); setError('')
    try {
      await clientApi.disconnectGoogle()
      setDone(true)
      setTimeout(() => window.location.reload(), 800)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao desconectar.')
    } finally { setDisconnecting(false) }
  }

  const googleConnected = hasGoogle && !done

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-ink-700 border border-white/8 flex items-center justify-center shrink-0">
            <GoogleIcon />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">Google</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {googleConnected
                ? <><CheckCircle className="size-3 text-success" /><span className="text-xs text-success">Conectado</span></>
                : <><XCircle    className="size-3 text-slate-600"/><span className="text-xs text-slate-600">Não conectado</span></>
              }
            </div>
          </div>
        </div>
        {googleConnected && (
          <Button
            size="sm" variant="secondary"
            onClick={handleDisconnect}
            disabled={disconnecting || !hasPassword}
            title={!hasPassword ? 'Configure uma senha antes de desconectar' : undefined}
          >
            {disconnecting ? 'Desconectando...' : 'Desconectar'}
          </Button>
        )}
      </div>
      {!hasPassword && googleConnected && (
        <p className="text-xs text-slate-600 bg-ink-700/40 border border-white/5 rounded-lg px-3 py-2">
          Configure uma senha na seção acima para poder desconectar o Google.
        </p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
