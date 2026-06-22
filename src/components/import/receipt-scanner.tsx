'use client'

import { useState, useRef, useCallback } from 'react'
import { ScanLine, CheckCircle2, AlertCircle, X, ImageIcon, Loader2 } from 'lucide-react'
import { clientApi } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'

interface Category { id: string; name: string; color: string; icon: string }

interface ExtractedData {
  amount:       number
  type:         'INCOME' | 'EXPENSE'
  description:  string
  date:         string
  categoryName: string
  notes:        string | null
  confidence:   'high' | 'medium' | 'low'
  error?:       string
}

interface Props {
  categories: Category[]
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif'
const MAX_MB = 5

export function ReceiptScanner({ categories }: Props) {
  const [dragging, setDragging]   = useState(false)
  const [preview, setPreview]     = useState<string | null>(null)
  const [scanning, setScanning]   = useState(false)
  const [extracted, setExtracted] = useState<ExtractedData | null>(null)
  const [editForm, setEditForm]   = useState<Partial<ExtractedData> & { categoryId: string }>({ categoryId: '' })
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileRef  = useRef<{ base64: string; mediaType: string } | null>(null)

  const reset = () => {
    setPreview(null); setExtracted(null); setScanError(null)
    setSaved(false);  setSaving(false);  setScanning(false)
    fileRef.current = null
  }

  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setScanError('Arquivo deve ser uma imagem.'); return }
    if (file.size > MAX_MB * 1024 * 1024) { setScanError(`Imagem deve ter no máximo ${MAX_MB}MB.`); return }

    setScanError(null)
    setSaved(false)
    setExtracted(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)

      // Extract base64 without the data URL prefix
      const base64 = dataUrl.split(',')[1]
      const mediaType = file.type as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif'
      fileRef.current = { base64, mediaType }

      setScanning(true)
      try {
        const res = await fetch('/api/v1/scan-receipt', {
          method:  'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ imageBase64: base64, mediaType }),
        })
        const data = await res.json() as ExtractedData

        if (data.error) { setScanError(data.error); setScanning(false); return }

        setExtracted(data)

        // Pre-fill form
        const matchedCat = categories.find(c =>
          c.name.toLowerCase().includes(data.categoryName?.toLowerCase() ?? '') ||
          data.categoryName?.toLowerCase().includes(c.name.toLowerCase())
        )
        setEditForm({
          amount:      data.amount,
          type:        data.type,
          description: data.description,
          date:        data.date,
          categoryId:  matchedCat?.id ?? categories[0]?.id ?? '',
          notes:       data.notes ?? '',
        })
      } catch {
        setScanError('Erro ao analisar imagem. Tente novamente.')
      } finally {
        setScanning(false)
      }
    }
    reader.readAsDataURL(file)
  }, [categories])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleSave = async () => {
    if (!editForm.amount || !editForm.type || !editForm.date || !editForm.categoryId) return
    setSaving(true)
    try {
      await clientApi.createTransaction({
        amount:      editForm.amount,
        type:        editForm.type as 'INCOME' | 'EXPENSE',
        description: editForm.description ?? '',
        date:        editForm.date,
        categoryId:  editForm.categoryId,
      })
      setSaved(true)
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const confidenceLabel = { high: '✓ Alta confiança', medium: '~ Confiança média', low: '⚠ Baixa confiança' }
  const confidenceColor = { high: 'text-success', medium: 'text-amber-400', low: 'text-danger' }

  return (
    <div className="flex flex-col gap-5">

      {/* Drop zone */}
      {!preview && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-colors ${
            dragging
              ? 'border-brand-500 bg-brand-900/20'
              : 'border-ink-600 bg-ink-800/50 hover:border-ink-500 hover:bg-ink-800'
          }`}
        >
          <div className="size-14 rounded-2xl bg-ink-700 flex items-center justify-center text-slate-500">
            <ScanLine className="size-7" />
          </div>
          <div className="text-center">
            <p className="text-slate-200 font-medium">Enviar comprovante ou nota fiscal</p>
            <p className="text-slate-500 text-sm mt-1">Arraste a imagem aqui ou clique para selecionar</p>
            <p className="text-slate-700 text-xs mt-2">JPG, PNG, WEBP · Máx. {MAX_MB}MB</p>
          </div>
          <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = '' }} />
        </div>
      )}

      {/* Preview + result */}
      {preview && (
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Image preview */}
          <div className="relative shrink-0 w-full sm:w-48">
            {/* eslint-disable-next-line @next/next/no-img-element -- data: URL preview from FileReader, no fixed dimensions for next/image */}
            <img src={preview} alt="Comprovante" className="w-full rounded-xl border border-white/8 object-cover max-h-60 sm:max-h-none" />
            {!saved && (
              <button
                onClick={reset}
                className="absolute top-2 right-2 size-7 rounded-full bg-ink-900/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="size-4" />
              </button>
            )}
            {scanning && (
              <div className="absolute inset-0 rounded-xl bg-ink-900/70 flex flex-col items-center justify-center gap-3">
                <Loader2 className="size-7 text-brand-400 animate-spin" />
                <p className="text-xs text-slate-300">Analisando...</p>
              </div>
            )}
          </div>

          {/* Extracted form */}
          <div className="flex-1 flex flex-col gap-4">
            {scanError && (
              <div className="flex items-start gap-3 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3">
                <AlertCircle className="size-4 text-danger shrink-0 mt-0.5" />
                <p className="text-sm text-danger">{scanError}</p>
              </div>
            )}

            {saved && (
              <div className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-xl px-4 py-3">
                <CheckCircle2 className="size-5 text-success shrink-0" />
                <div>
                  <p className="text-sm font-medium text-success">Transação adicionada!</p>
                  <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-300 mt-0.5 transition-colors">
                    Escanear outro comprovante
                  </button>
                </div>
              </div>
            )}

            {extracted && !saved && (
              <>
                {/* Confidence badge */}
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-medium ${confidenceColor[extracted.confidence]}`}>
                    {confidenceLabel[extracted.confidence]}
                  </p>
                  <p className="text-xs text-slate-600">· revise os dados antes de salvar</p>
                </div>

                {/* Form */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Valor (R$)</label>
                    <input
                      type="number" step="0.01" min="0.01"
                      value={editForm.amount ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, amount: parseFloat(e.target.value) }))}
                      className="bg-ink-700 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-600/60"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Tipo</label>
                    <select
                      value={editForm.type ?? 'EXPENSE'}
                      onChange={e => setEditForm(f => ({ ...f, type: e.target.value as 'INCOME' | 'EXPENSE' }))}
                      className="bg-ink-700 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-600/60"
                    >
                      <option value="EXPENSE">Despesa</option>
                      <option value="INCOME">Receita</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="text-xs text-slate-500">Descrição</label>
                    <input
                      type="text" maxLength={100}
                      value={editForm.description ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                      className="bg-ink-700 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-600/60"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Data</label>
                    <input
                      type="date"
                      value={editForm.date ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))}
                      className="bg-ink-700 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-600/60"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500">Categoria</label>
                    <select
                      value={editForm.categoryId ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, categoryId: e.target.value }))}
                      className="bg-ink-700 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-brand-600/60"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Summary + save */}
                <div className="flex items-center justify-between pt-1 border-t border-white/6">
                  <p className={`text-base font-bold ${editForm.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>
                    {editForm.type === 'INCOME' ? '+' : '-'}{formatCurrency(editForm.amount ?? 0)}
                  </p>
                  <button
                    onClick={handleSave}
                    disabled={saving || !editForm.amount || !editForm.categoryId}
                    className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-5 py-2 rounded-xl text-sm transition-colors"
                  >
                    {saving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                    {saving ? 'Salvando...' : 'Adicionar transação'}
                  </button>
                </div>
              </>
            )}

            {!extracted && !scanning && !scanError && (
              <div className="flex items-center gap-3 text-slate-600 py-4">
                <ImageIcon className="size-5 shrink-0" />
                <p className="text-sm">Aguardando análise da imagem...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      {!preview && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '🧾', title: 'Notas fiscais',     desc: 'Foto do cupom fiscal ou NF-e' },
            { icon: '📱', title: 'Comprovantes Pix',  desc: 'Print do comprovante de pagamento' },
            { icon: '💳', title: 'Extratos bancários', desc: 'Captura de tela do app do banco' },
          ].map(t => (
            <div key={t.title} className="bg-ink-800/60 border border-white/5 rounded-xl p-4 flex items-start gap-3">
              <span className="text-xl">{t.icon}</span>
              <div>
                <p className="text-sm font-medium text-slate-300">{t.title}</p>
                <p className="text-xs text-slate-600 mt-0.5">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
