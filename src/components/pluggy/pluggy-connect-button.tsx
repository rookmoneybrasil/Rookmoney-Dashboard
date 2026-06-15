'use client'

import { useState, useCallback } from 'react'
import { PluggyConnect } from 'react-pluggy-connect'
import { Wifi, Loader2, X, Building2, RefreshCw, AlertCircle, Link2, Link2Off } from 'lucide-react'
import { clientApi, type PluggyItemRecord, type PluggyBoleto } from '@/lib/api-client'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Props {
  initialItems:   PluggyItemRecord[]
  initialBoletos: PluggyBoleto[]
}

export function PluggySection({ initialItems, initialBoletos }: Props) {
  const [connectToken, setConnectToken] = useState<string | null>(null)
  const [connecting,   setConnecting]   = useState(false)
  const [syncing,      setSyncing]      = useState(false)
  const [items,        setItems]        = useState<PluggyItemRecord[]>(initialItems)
  const [boletos,      setBoletos]      = useState<PluggyBoleto[]>(initialBoletos)
  const [importing,    setImporting]    = useState<string | null>(null)
  const [importedIds,  setImportedIds]  = useState<Set<string>>(new Set())
  const [error,        setError]        = useState<string | null>(null)

  const openWidget = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      const { accessToken } = await clientApi.pluggyConnectToken()
      setConnectToken(accessToken)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao iniciar conexão')
      setConnecting(false)
    }
  }, [])

  const refreshBoletos = useCallback(async () => {
    setSyncing(true)
    try {
      const data = await clientApi.pluggyBoletos()
      setBoletos(data.boletos)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao buscar boletos')
    } finally {
      setSyncing(false)
    }
  }, [])

  const handleSuccess = useCallback(async (data: { item: { id: string } }) => {
    setConnectToken(null)
    setConnecting(false)
    try {
      const saved = await clientApi.pluggySaveItem(data.item.id)
      setItems(prev => [saved, ...prev.filter(i => i.itemId !== data.item.id)])
      await refreshBoletos()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar conexão')
    }
  }, [refreshBoletos])

  const handleError = useCallback((err: { message: string }) => {
    setConnectToken(null)
    setConnecting(false)
    setError(err.message ?? 'Erro ao conectar banco')
  }, [])

  const handleClose = useCallback(() => {
    setConnectToken(null)
    setConnecting(false)
  }, [])

  const disconnect = useCallback(async (id: string, connectorName: string) => {
    if (!confirm(`Desconectar ${connectorName}?`)) return
    try {
      await clientApi.pluggyDeleteItem(id)
      setItems(prev => prev.filter(i => i.id !== id))
      setBoletos(prev => prev.filter(b => b.connectorName !== connectorName))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao desconectar')
    }
  }, [])

  const importBoleto = useCallback(async (boleto: PluggyBoleto) => {
    setImporting(boleto.id)
    try {
      const dueDate = boleto.paymentData?.dueDate ?? boleto.date
      await clientApi.createBill({
        name:    boleto.paymentData?.reason ?? boleto.description ?? boleto.connectorName,
        amount:  Math.abs(boleto.amount),
        dueDate: dueDate.slice(0, 10),
      })
      setImportedIds(prev => new Set([...prev, boleto.id]))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao importar boleto')
    } finally {
      setImporting(null)
    }
  }, [])

  const pendingBoletos = boletos.filter(b => !importedIds.has(b.id))

  return (
    <section className="flex flex-col gap-4">
      {/* Pluggy Connect widget — renders modal automatically when connectToken is set */}
      {connectToken && (
        <PluggyConnect
          connectToken={connectToken}
          includeSandbox={true}
          onSuccess={handleSuccess}
          onError={handleError}
          onClose={handleClose}
          onLoadError={(err) => {
            setError(`Falha ao carregar widget: ${err.message}`)
            setConnectToken(null)
            setConnecting(false)
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Wifi className="size-4 text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Open Finance — Boletos detectados</h2>
            <p className="text-xs text-muted-foreground">Conecte seu banco para ver boletos e DDAs no seu CPF</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button onClick={refreshBoletos} disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors disabled:opacity-50">
              <RefreshCw className={`size-3 ${syncing ? 'animate-spin' : ''}`} />
              Sincronizar
            </button>
          )}
          <button onClick={openWidget} disabled={connecting || !!connectToken}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50">
            {connecting
              ? <><Loader2 className="size-3 animate-spin" /> Abrindo...</>
              : <><Link2 className="size-3" /> Conectar banco</>
            }
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-xs text-destructive">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto shrink-0"><X className="size-3" /></button>
        </div>
      )}

      {/* Connected banks */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map(item => (
            <div key={item.id}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border/50 text-xs">
              <Building2 className="size-3.5 text-muted-foreground shrink-0" />
              <span className="font-medium text-foreground">{item.connectorName}</span>
              <span className={`px-1.5 py-0.5 rounded-full font-semibold ${
                item.status === 'UPDATED' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
              }`}>{item.status === 'UPDATED' ? 'OK' : item.status}</span>
              <button onClick={() => disconnect(item.id, item.connectorName)}
                className="ml-1 text-muted-foreground/50 hover:text-destructive transition-colors">
                <Link2Off className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Boletos list */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
          <Wifi className="size-6 opacity-20" />
          <p>Conecte seu banco para ver boletos detectados automaticamente</p>
        </div>
      ) : syncing ? (
        <div className="rounded-2xl border border-border/40 py-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="size-4 animate-spin" /> Buscando boletos...
        </div>
      ) : pendingBoletos.length === 0 ? (
        <div className="rounded-2xl border border-border/40 py-6 text-center text-xs text-muted-foreground">
          Nenhum boleto pendente detectado nos últimos 7 dias / próximos 60 dias
        </div>
      ) : (
        <div className="rounded-2xl border border-border/40 overflow-hidden divide-y divide-border/30">
          {pendingBoletos.map(b => {
            const dueDate  = b.paymentData?.dueDate ?? b.date
            const name     = b.paymentData?.reason ?? b.description ?? '—'
            const receiver = b.paymentData?.receiver
            const barCode  = b.paymentData?.barCode

            return (
              <div key={b.id} className="flex items-start gap-4 px-4 py-3.5 hover:bg-muted/20 transition-colors">
                <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="size-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {receiver && <span>{receiver} · </span>}
                    Venc. {formatDate(dueDate)} · {b.connectorName}
                  </p>
                  {barCode && (
                    <p className="text-[10px] text-muted-foreground/50 font-mono truncate mt-0.5">{barCode}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    {formatCurrency(Math.abs(b.amount))}
                  </span>
                  {importedIds.has(b.id) ? (
                    <span className="text-[10px] text-green-400 font-semibold">✓ Importado</span>
                  ) : (
                    <button onClick={() => importBoleto(b)} disabled={importing === b.id}
                      className="text-[10px] font-medium px-2 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white transition-colors disabled:opacity-50">
                      {importing === b.id ? '...' : 'Importar como conta'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
