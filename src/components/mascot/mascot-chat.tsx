'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Loader2, ArrowRight, Sparkles, ExternalLink, ImageIcon } from 'lucide-react'
import Link from 'next/link'

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
  'Registrar uma despesa',
  'Quais contas vencem essa semana?',
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

interface Props {
  onClose: () => void
}

export function MascotChat({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Olá! 👋 Sou o Rookinho, seu assistente financeiro com IA. Posso registrar transações, consultar contas, acompanhar metas e dar dicas. Envie fotos de comprovantes também!',
    },
  ])
  const [input, setInput]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [proRequired, setProRequired] = useState(false)
  const [remaining, setRemaining]     = useState<number | null>(null)
  const [pendingFile, setPendingFile] = useState<ChatFile | null>(null)
  const bottomRef                     = useRef<HTMLDivElement>(null)
  const inputRef                      = useRef<HTMLInputElement>(null)
  const fileInputRef                  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const processFile = useCallback(async (file: File) => {
    if (!isAcceptedFile(file)) return
    if (file.size > 10 * 1024 * 1024) return
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

  if (proRequired) {
    return (
      <div className="flex flex-col w-80 bg-ink-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-ink-700/60">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">R</div>
            <p className="text-sm font-semibold text-slate-100">Rookinho</p>
          </div>
          <button onClick={onClose} className="size-7 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-ink-600 flex items-center justify-center transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex flex-col items-center text-center gap-4 px-6 py-8">
          <div className="size-12 rounded-2xl bg-brand-800/60 border border-brand-700/40 flex items-center justify-center">
            <Sparkles className="size-6 text-brand-400" />
          </div>
          <div className="flex flex-col gap-1.5">
            <p className="font-semibold text-slate-100">Recurso exclusivo Pro</p>
            <p className="text-sm text-slate-500 leading-relaxed">
              O Rookinho IA está disponível no plano Pro.
              Registre transações, consulte contas, acompanhe metas — tudo por conversa.
            </p>
          </div>
          <Link
            href="/billing"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            <Sparkles className="size-4" />
            Ver plano Pro — R$ 19,90/mês
          </Link>
          <button onClick={onClose} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
            Continuar no plano gratuito
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-80 sm:w-96 max-h-[560px] bg-ink-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-ink-700/60 shrink-0">
        <div className="size-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">R</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100">Rookinho</p>
          <p className="text-xs text-slate-500">Assistente financeiro</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            href="/chat"
            onClick={onClose}
            className="size-7 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-ink-600 flex items-center justify-center transition-colors"
            title="Abrir chat completo"
          >
            <ExternalLink className="size-3.5" />
          </Link>
          <button
            onClick={onClose}
            className="size-7 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-ink-600 flex items-center justify-center transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600 text-white rounded-br-sm'
                  : 'bg-ink-700 text-slate-200 rounded-bl-sm border border-white/6'
              }`}
            >
              {msg.file && (
                <div className="mb-2 rounded-lg overflow-hidden">
                  {msg.file.spreadsheetText ? (
                    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                      <span className="text-base">📊</span>
                      <span className="text-xs truncate max-w-[140px]">{msg.file.name}</span>
                    </div>
                  ) : msg.file.isPdf ? (
                    <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                      <span className="text-base">📄</span>
                      <span className="text-xs truncate max-w-[140px]">{msg.file.name}</span>
                    </div>
                  ) : (
                    <img
                      src={`data:${msg.file.mediaType};base64,${msg.file.base64}`}
                      alt="Imagem enviada"
                      className="max-w-full max-h-32 rounded-lg"
                    />
                  )}
                </div>
              )}
              <span className="whitespace-pre-wrap">{msg.content}</span>

              {msg.navigate && (
                <Link
                  href={msg.navigate.path}
                  onClick={onClose}
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
          <div className="flex justify-start">
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

      {/* Quick suggestions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2 flex flex-col gap-1.5 shrink-0">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-left text-xs text-slate-400 hover:text-slate-200 bg-ink-700/60 hover:bg-ink-700 border border-white/6 rounded-xl px-3 py-2 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/8 shrink-0" onPaste={handlePaste}>
        {pendingFile && (
          <div className="px-3 pt-2">
            <div className="inline-flex items-start gap-1.5 bg-ink-700 border border-white/8 rounded-lg p-1.5">
              {pendingFile.spreadsheetText ? (
                <div className="size-12 rounded bg-white/5 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-base">📊</span>
                  <span className="text-[8px] text-slate-500 truncate max-w-10">{pendingFile.name}</span>
                </div>
              ) : pendingFile.isPdf ? (
                <div className="size-12 rounded bg-white/5 flex flex-col items-center justify-center gap-0.5">
                  <span className="text-base">📄</span>
                  <span className="text-[8px] text-slate-500 truncate max-w-10">{pendingFile.name}</span>
                </div>
              ) : (
                <img
                  src={`data:${pendingFile.mediaType};base64,${pendingFile.base64}`}
                  alt="Preview"
                  className="size-12 rounded object-cover"
                />
              )}
              <button
                onClick={() => setPendingFile(null)}
                className="size-4 rounded-full bg-ink-600 hover:bg-ink-500 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="size-2.5" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 px-3 py-3">
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
            className="size-9 rounded-xl bg-ink-700 border border-white/8 hover:bg-ink-600 disabled:opacity-40 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors shrink-0"
            title="Enviar imagem"
          >
            <ImageIcon className="size-3.5" />
          </button>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={pendingFile ? 'Descreva o arquivo...' : 'Digite sua mensagem...'}
            disabled={loading}
            className="flex-1 bg-ink-700 border border-white/8 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-600/60 transition-colors disabled:opacity-50"
          />
          <button
            onClick={() => send(input, pendingFile)}
            disabled={(!input.trim() && !pendingFile) || loading}
            className="size-9 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-colors shrink-0"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </div>
        {remaining != null && remaining <= 10 && (
          <p className="px-4 pb-2 text-[10px] text-slate-600 text-center">
            {remaining} mensagens restantes este mês
          </p>
        )}
      </div>
    </div>
  )
}
