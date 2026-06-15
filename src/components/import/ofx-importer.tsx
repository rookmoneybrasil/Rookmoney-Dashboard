'use client'

import * as React from 'react'
import { Upload, FileText, X, AlertCircle, CheckCircle2, ChevronDown, Info } from 'lucide-react'
import { importTransactions } from '@/app/actions/import'
import { parseOFX, type OFXTransaction } from '@/lib/ofx-parser'

type Category = { id: string; name: string; color: string; icon: string }

const BANK_GUIDES = [
  {
    bank: 'Itaú',
    steps: 'Internet Banking → Conta Corrente → Extrato → Exportar → Formato OFX',
  },
  {
    bank: 'Bradesco',
    steps: 'Internet Banking → Conta Corrente → Extrato → Salvar como → OFX',
  },
  {
    bank: 'Santander',
    steps: 'Internet Banking → Extrato → Outros formatos → OFX',
  },
  {
    bank: 'Banco do Brasil',
    steps: 'Internet Banking → Extrato → Salvar em formato OFX',
  },
  {
    bank: 'Nubank',
    steps: 'App → Perfil → Meus dados → Exportar extratos → OFX',
  },
  {
    bank: 'Inter',
    steps: 'App → Extrato → Exportar → OFX',
  },
  {
    bank: 'C6 Bank',
    steps: 'App → Extrato → Compartilhar → OFX',
  },
  {
    bank: 'Sicoob / Sicredi',
    steps: 'Internet Banking → Extrato → Exportar → OFX',
  },
]

export function OFXImporter({ categories }: { categories: Category[] }) {
  const [dragOver, setDragOver]           = React.useState(false)
  const [fileName, setFileName]           = React.useState<string | null>(null)
  const [transactions, setTransactions]   = React.useState<OFXTransaction[]>([])
  const [rowCategories, setRowCategories] = React.useState<Record<string, string>>({})
  const [status, setStatus]               = React.useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading]             = React.useState(false)
  const [showGuide, setShowGuide]         = React.useState(false)
  const fileInputRef                      = React.useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.name.match(/\.(ofx|qfx|ofc)$/i)) {
      setStatus({ type: 'error', message: 'Selecione um arquivo .ofx (ou .qfx / .ofc)' })
      return
    }
    setStatus(null)

    const reader = new FileReader()
    reader.onload = (e) => {
      const text   = e.target?.result as string
      const result = parseOFX(text)

      if (!result.ok) {
        setStatus({ type: 'error', message: result.error })
        return
      }

      setFileName(file.name)
      setTransactions(result.transactions)
      setRowCategories({})
    }
    reader.readAsText(file, 'UTF-8')
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function setAllCategories(catId: string) {
    const all: Record<string, string> = {}
    transactions.forEach((t) => { all[t.id] = catId })
    setRowCategories(all)
  }

  function reset() {
    setFileName(null)
    setTransactions([])
    setRowCategories({})
    setStatus(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleImport() {
    setStatus(null)
    const missing = transactions.some((t) => !rowCategories[t.id])
    if (missing) {
      setStatus({ type: 'error', message: 'Selecione uma categoria para todas as transações.' })
      return
    }

    setLoading(true)
    try {
      const result = await importTransactions(
        transactions.map((t) => ({
          date:        t.date,
          description: t.description,
          amount:      t.amount,
          type:        t.type,
          categoryId:  rowCategories[t.id],
        }))
      )

      if (result.error) {
        setStatus({ type: 'error', message: result.error })
      } else {
        setStatus({
          type: 'success',
          message: `${result.success} transaç${result.success === 1 ? 'ão importada' : 'ões importadas'} com sucesso!${result.skipped ? ` (${result.skipped} duplicada${result.skipped !== 1 ? 's' : ''} ignorada${result.skipped !== 1 ? 's' : ''})` : ''}`,
        })
        reset()
      }
    } catch {
      setStatus({ type: 'error', message: 'Erro ao importar. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  const previewTxns = transactions.slice(0, 15)
  const extraCount  = transactions.length - previewTxns.length

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      {/* Status */}
      {status && (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm border ${
          status.type === 'success'
            ? 'bg-green-950/40 border-green-700/40 text-green-300'
            : 'bg-red-950/40 border-red-700/40 text-red-300'
        }`}>
          {status.type === 'success'
            ? <CheckCircle2 className="size-4 shrink-0" />
            : <AlertCircle className="size-4 shrink-0" />}
          <span>{status.message}</span>
        </div>
      )}

      {/* Guide toggle */}
      <button
        onClick={() => setShowGuide(v => !v)}
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors w-fit"
      >
        <Info className="size-4 text-brand-400" />
        Como exportar o extrato do meu banco?
        <ChevronDown className={`size-4 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
      </button>

      {showGuide && (
        <div className="bg-ink-700 border border-white/6 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Como exportar o extrato (OFX) pelo internet banking</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BANK_GUIDES.map((g) => (
              <div key={g.bank} className="bg-ink-800 rounded-xl p-3 border border-white/6">
                <p className="text-sm font-semibold text-slate-200 mb-1">{g.bank}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{g.steps}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-600 mt-4">
            Não encontrou seu banco? Procure por &ldquo;exportar extrato&rdquo; ou &ldquo;salvar extrato&rdquo; no internet banking e selecione o formato OFX, QFX ou OFC.
          </p>
        </div>
      )}

      {/* Drop zone */}
      {!fileName ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
            dragOver
              ? 'border-brand-500 bg-brand-800/20'
              : 'border-white/10 hover:border-white/20 bg-ink-700/30'
          }`}
        >
          <div className="size-14 rounded-2xl bg-brand-800/50 border border-brand-700/30 flex items-center justify-center text-brand-400">
            <Upload className="size-7" />
          </div>
          <div className="text-center">
            <p className="font-medium text-slate-200">Arraste o arquivo OFX ou clique para selecionar</p>
            <p className="text-sm text-slate-500 mt-1">Aceita .ofx, .qfx e .ofc — exportado direto do internet banking</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ofx,.qfx,.ofc"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-ink-700 border border-white/6 rounded-xl px-4 py-3">
          <FileText className="size-5 text-brand-400 shrink-0" />
          <span className="text-slate-200 font-medium flex-1 truncate">{fileName}</span>
          <span className="text-sm text-slate-500">{transactions.length} transaç{transactions.length !== 1 ? 'ões' : 'ão'}</span>
          <button onClick={reset} className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Preview table */}
      {transactions.length > 0 && (
        <div className="bg-ink-700 border border-white/6 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
            <h2 className="text-sm font-semibold text-slate-200">Pré-visualização</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Categoria para todas:</span>
              <div className="relative">
                <select
                  defaultValue=""
                  onChange={(e) => e.target.value && setAllCategories(e.target.value)}
                  className="appearance-none bg-ink-800 border border-white/10 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 pr-6 focus:outline-none focus:border-brand-600 transition-colors"
                >
                  <option value="">Selecionar…</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-slate-500 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria'].map((h) => (
                    <th key={h} className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {previewTxns.map((t) => {
                  const catId = rowCategories[t.id] ?? ''
                  return (
                    <tr key={t.id} className="hover:bg-ink-600/20 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 tabular-nums whitespace-nowrap">{t.date}</td>
                      <td className="py-2.5 px-4 text-slate-300 max-w-[220px] truncate">
                        {t.description || <span className="text-slate-600 text-xs italic">sem descrição</span>}
                      </td>
                      <td className={`py-2.5 px-4 tabular-nums font-medium whitespace-nowrap ${
                        t.type === 'INCOME' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                          t.type === 'INCOME'
                            ? 'bg-green-950/50 text-green-400 border border-green-800/40'
                            : 'bg-red-950/50 text-red-400 border border-red-800/40'
                        }`}>
                          {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="relative">
                          <select
                            value={catId}
                            onChange={(e) => setRowCategories(prev => ({ ...prev, [t.id]: e.target.value }))}
                            className={`appearance-none text-xs rounded-lg px-2.5 py-1.5 pr-6 focus:outline-none transition-colors border ${
                              catId
                                ? 'bg-ink-800 border-white/10 text-slate-300 focus:border-brand-600'
                                : 'bg-red-950/20 border-red-700/30 text-red-400 focus:border-red-500'
                            }`}
                          >
                            <option value="">Selecionar…</option>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-slate-500 pointer-events-none" />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {extraCount > 0 && (
            <div className="px-5 py-3 border-t border-white/6 text-sm text-slate-500 text-center">
              e mais {extraCount} transaç{extraCount !== 1 ? 'ões' : 'ão'}…
            </div>
          )}
        </div>
      )}

      {/* Import button */}
      {transactions.length > 0 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            {transactions.length} transaç{transactions.length === 1 ? 'ão' : 'ões'} encontrada{transactions.length !== 1 ? 's' : ''}
          </p>
          <button
            onClick={handleImport}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-brand-600/20"
          >
            {loading ? (
              <>
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Importando…
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Importar {transactions.length} transaç{transactions.length === 1 ? 'ão' : 'ões'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
