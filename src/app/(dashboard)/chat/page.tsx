'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, ArrowRight, Sparkles, ImageIcon, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { MASCOT_SRCS } from '@/lib/mascot'

interface ChatFile {
  base64: string
  mediaType: string
  name: string
  isPdf: boolean
  spreadsheetText?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  file?: ChatFile | null
  navigate?: { path: string; reason: string } | null
}

const SUGGESTIONS = [
  'Analisa minha renda e me ajuda a organizar',
  'Ver meu resumo financeiro',
  'Quais contas vencem essa semana?',
  'Registrar uma despesa',
  'Criar uma meta de economia',
  'Adicionar uma conta parcelada',
  'Quem me deve dinheiro?',
  'Quanto gastei com alimentação?',
]

const PAGE_LABELS: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/transactions': 'Transações',
  '/goals':        'Metas',
  '/bills':        'Contas',
  '/budget':       'Orçamento',
  '/reports':      'Relatórios',
  '/people':       'Pessoas',
  '/categories':   'Categorias',
  '/recurring':    'Recorrências',
  '/income':       'Rendas',
  '/settings':     'Configurações',
  '/billing':      'Assinatura',
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const SPREADSHEET_EXTS = ['.xlsx', '.xls', '.csv']

function fileToBase64(file: File): Promise<ChatFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      resolve({ base64: dataUrl.split(',')[1], mediaType: file.type, name: file.name, isPdf: file.type === 'application/pdf' })
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function readSpreadsheet(file: File): Promise<ChatFile> {
  const XLSX = (await import('xlsx'))
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array' })
  const lines: string[] = []
  for (const name of wb.SheetNames) {
    if (wb.SheetNames.length > 1) lines.push(`[Aba: ${name}]`)
    const csv = XLSX.utils.sheet_to_csv(wb.Sheets[name])
    lines.push(csv.trim())
  }
  const text = lines.join('\n').slice(0, 15000)
  return { base64: '', mediaType: file.type, name: file.name, isPdf: false, spreadsheetText: text }
}

function isAcceptedFile(file: File): boolean {
  if (IMAGE_TYPES.includes(file.type)) return true
  if (file.type === 'application/pdf') return true
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (SPREADSHEET_EXTS.includes(ext)) return true
  return false
}

function isSpreadsheet(file: File): boolean {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  return SPREADSHEET_EXTS.includes(ext)
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Olá! 👋 Sou o Rookinho, seu assistente financeiro com IA. Posso registrar transações, consultar contas, pagar boletos, acompanhar metas e dar dicas. Envie fotos de comprovantes, boletos ou PDFs!',
    },
  ])
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [proRequired, setProRequired] = useState(false)
  const [remaining, setRemaining]     = useState<number | null>(null)
  const [usageLimit, setUsageLimit]   = useState<number | null>(null)
  const [pendingFile, setPendingFile] = useState<ChatFile | null>(null)
  const [dragging, setDragging]       = useState(false)
  const bottomRef                     = useRef<HTMLDivElement>(null)
  const inputRef                      = useRef<HTMLInputElement>(null)
  const fileInputRef                  = useRef<HTMLInputElement>(null)
  const dragCounter                   = useRef(0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
    fetch('/api/v1/chat', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) { setRemaining(d.remaining); setUsageLimit(d.limit) } })
      .catch(() => {})
  }, [])

  const processFile = useCallback(async (file: File) => {
    if (!isAcceptedFile(file)) return
    if (file.size > 10 * 1024 * 1024) { alert('Arquivo muito grande (máx 10MB)'); return }
    const parsed = isSpreadsheet(file) ? await readSpreadsheet(file) : await fileToBase64(file)
    setPendingFile(parsed)
    inputRef.current?.focus()
  }, [])

  const send = useCallback(async (text: string, file?: ChatFile | null) => {
    if ((!text.trim() && !file) || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text.trim(), file: file ?? null }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setPendingFile(null)
    setLoading(true)

    try {
      const apiMessages = history
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => {
          if (m.role === 'user' && m.file) {
            if (m.file.spreadsheetText) {
              const text = `[Planilha: ${m.file.name}]\n${m.file.spreadsheetText}\n\n${m.content || 'Analise esta planilha.'}`
              return { role: m.role, content: text }
            }
            const contentBlocks: unknown[] = []
            if (m.file.isPdf) {
              contentBlocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: m.file.base64 } })
            } else {
              contentBlocks.push({ type: 'image', source: { type: 'base64', media_type: m.file.mediaType, data: m.file.base64 } })
            }
            if (m.content) contentBlocks.push({ type: 'text', text: m.content })
            else contentBlocks.push({ type: 'text', text: m.file.isPdf ? 'Analise este documento.' : 'Analise esta imagem.' })
            return { role: m.role, content: contentBlocks }
          }
          return { role: m.role, content: m.content }
        })

      const res = await fetch('/api/v1/chat', {
        method:  'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: apiMessages }),
      })

      if (res.status === 403) { setProRequired(true); return }

      const data = await res.json() as { message: string; navigate?: { path: string; reason: string } | null; error?: string; remaining?: number }

      if (data.remaining != null) setRemaining(data.remaining)

      if (data.error === 'rate_limited') {
        setMessages(prev => [...prev, { role: 'assistant', content: '⏳ Você atingiu o limite de mensagens deste mês. O limite renova no início do próximo mês.' }])
        return
      }

      if (data.error === 'ai_unavailable' || data.error === 'ai_error') {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message ?? 'Ops, estou temporariamente indisponível. Tente novamente em alguns minutos.' }])
        return
      }

      setMessages(prev => [...prev, {
        role:     'assistant',
        content:  data.message,
        navigate: data.navigate ?? null,
      }])
    } catch {
      setMessages(prev => [...prev, {
        role:    'assistant',
        content: 'Ops, ocorreu um erro de conexão. Tente novamente. 😅',
      }])
    } finally {
      setLoading(false)
    }
  }, [messages, loading])

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input, pendingFile) }
  }

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) processFile(file)
        return
      }
    }
  }, [processFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    dragCounter.current = 0
    const file = e.dataTransfer.files[0]
    if (file && isAcceptedFile(file)) processFile(file)
  }, [processFile])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current++
    if (e.dataTransfer.types.includes('Files')) setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current <= 0) { setDragging(false); dragCounter.current = 0 }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault() }, [])

  if (proRequired) {
    return (
      <div className="flex flex-col items-center gap-6 py-24 text-center max-w-sm mx-auto">
        <div className="relative size-32">
          <Image src={MASCOT_SRCS.sad} alt="Rookinho" fill className="object-contain" />
        </div>
        <div className="size-14 rounded-2xl bg-brand-800/60 border border-brand-700/40 flex items-center justify-center">
          <Sparkles className="size-7 text-brand-400" />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-semibold text-slate-100">Recurso exclusivo Pro</p>
          <p className="text-sm text-slate-500 leading-relaxed">
            O Rookinho IA está disponível apenas no plano Pro.
            Faça upgrade para conversar comigo, registrar transações por voz e muito mais.
          </p>
        </div>
        <Link
          href="/billing"
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 px-8 rounded-xl transition-colors text-sm"
        >
          <Sparkles className="size-4" />
          Ver plano Pro — R$ 19,90/mês
        </Link>
      </div>
    )
  }

  const hasUserMessage = messages.some(m => m.role === 'user')

  return (
    <div
      className="flex flex-col h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] relative"
      onDrop={handleDrop}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
    >
      {/* Drag overlay */}
      {dragging && (
        <div className="absolute inset-0 z-50 bg-brand-600/10 border-2 border-dashed border-brand-500 rounded-2xl flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-brand-400">
            <ImageIcon className="size-10" />
            <p className="text-sm font-medium">Solte o arquivo aqui</p>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

          {!hasUserMessage && (
            <div className="flex flex-col items-center text-center gap-4 py-8">
              <div className="relative size-24">
                <Image src={MASCOT_SRCS.happy} alt="Rookinho" fill className="object-contain"
                  style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.4))' }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">Rookinho IA</h1>
                <p className="text-sm text-slate-500 mt-1">Seu assistente financeiro pessoal</p>
                <p className="text-xs text-slate-600 mt-1">Envie fotos, comprovantes, boletos ou PDFs</p>
                {remaining != null && usageLimit != null && (
                  <p className="text-xs text-slate-600 mt-2">
                    {usageLimit - remaining}/{usageLimit} mensagens usadas este mês
                  </p>
                )}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="size-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                  R
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-brand-600 text-white rounded-br-sm'
                    : 'bg-ink-700 text-slate-200 rounded-bl-sm border border-white/6'
                }`}
              >
                {msg.file && (
                  <div className="mb-2 rounded-lg overflow-hidden">
                    {msg.file.spreadsheetText ? (
                      <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                        <span className="text-lg">📊</span>
                        <span className="text-xs truncate max-w-[180px]">{msg.file.name}</span>
                      </div>
                    ) : msg.file.isPdf ? (
                      <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                        <span className="text-lg">📄</span>
                        <span className="text-xs truncate max-w-[180px]">{msg.file.name}</span>
                      </div>
                    ) : (
                      <img
                        src={`data:${msg.file.mediaType};base64,${msg.file.base64}`}
                        alt="Imagem enviada"
                        className="max-w-full max-h-48 rounded-lg"
                      />
                    )}
                  </div>
                )}
                {msg.content}

                {msg.navigate && (
                  <Link
                    href={msg.navigate.path}
                    className="mt-2 flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors border-t border-white/10 pt-2"
                  >
                    <ArrowRight className="size-3 shrink-0" />
                    Ir para {PAGE_LABELS[msg.navigate.path] ?? msg.navigate.path}
                  </Link>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="size-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                R
              </div>
              <div className="bg-ink-700 border border-white/6 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="size-1.5 rounded-full bg-slate-500 animate-bounce"
                    style={{ animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {!hasUserMessage && (
        <div className="shrink-0 border-t border-white/6 bg-ink-800/40">
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs text-slate-400 hover:text-slate-200 bg-ink-700/60 hover:bg-ink-700 border border-white/6 rounded-full px-4 py-2 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="shrink-0 border-t border-white/6 bg-ink-800/80 backdrop-blur-sm" onPaste={handlePaste}>
        {/* Pending image preview */}
        {pendingFile && (
          <div className="max-w-2xl mx-auto px-4 pt-3">
            <div className="inline-flex items-start gap-2 bg-ink-700 border border-white/8 rounded-xl p-2">
              {pendingFile.spreadsheetText ? (
                <div className="size-16 rounded-lg bg-white/5 flex flex-col items-center justify-center gap-1">
                  <span className="text-xl">📊</span>
                  <span className="text-[9px] text-slate-500 truncate max-w-14">{pendingFile.name}</span>
                </div>
              ) : pendingFile.isPdf ? (
                <div className="size-16 rounded-lg bg-white/5 flex flex-col items-center justify-center gap-1">
                  <span className="text-xl">📄</span>
                  <span className="text-[9px] text-slate-500 truncate max-w-14">{pendingFile.name}</span>
                </div>
              ) : (
                <img
                  src={`data:${pendingFile.mediaType};base64,${pendingFile.base64}`}
                  alt="Preview"
                  className="size-16 rounded-lg object-cover"
                />
              )}
              <button
                onClick={() => setPendingFile(null)}
                className="size-5 rounded-full bg-ink-600 hover:bg-ink-500 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.xlsx,.xls,.csv"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f); e.target.value = '' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="size-10 rounded-xl bg-ink-700 border border-white/8 hover:bg-ink-600 disabled:opacity-40 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors shrink-0"
            title="Enviar imagem"
          >
            <ImageIcon className="size-4" />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={pendingFile ? 'Descreva o arquivo ou envie direto...' : 'Pergunte ao Rookinho...'}
            disabled={loading}
            className="flex-1 bg-ink-700 border border-white/8 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-600/60 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => send(input, pendingFile)}
            disabled={(!input.trim() && !pendingFile) || loading}
            className="size-10 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </div>
        {remaining != null && usageLimit != null && (
          <p className="text-center text-[10px] text-slate-600 pb-2">
            {usageLimit - remaining}/{usageLimit} mensagens usadas este mês
          </p>
        )}
      </div>
    </div>
  )
}
