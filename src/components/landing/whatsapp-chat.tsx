'use client'

import { useEffect, useRef, useState } from 'react'

interface Message {
  from: 'user' | 'rook'
  text: string
  delay: number
}

const MESSAGES: Message[] = [
  { from: 'user', text: 'Rookinho, quanto gastei esse mês?', delay: 0 },
  { from: 'rook', text: 'Opa! Deixa eu dar uma olhada... 🔍', delay: 800 },
  { from: 'rook', text: 'Você gastou R$ 2.847,30 em junho.\n\n• Alimentação: R$ 890\n• Transporte: R$ 420\n• Assinaturas: R$ 187,30\n• Outros: R$ 1.350', delay: 1600 },
  { from: 'user', text: 'Tô dentro do orçamento?', delay: 3200 },
  { from: 'rook', text: 'Tá sim! Seu limite é R$ 3.500 e você ainda tem R$ 652,70 sobrando. Mas fica de olho em Alimentação — já bateu 89% do limite! 🧐', delay: 4000 },
  { from: 'user', text: 'Registra uma compra de R$ 45 no mercado', delay: 5600 },
  { from: 'rook', text: '✅ Pronto! Registrei:\n\nMercado — R$ 45,00\nCategoria: Alimentação\nData: hoje\n\nSeu saldo atualizado: R$ 607,70 restante no orçamento.', delay: 6400 },
]

export function WhatsAppChat() {
  const [visibleCount, setVisibleCount] = useState(0)
  const [started, setStarted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true)
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const timers: NodeJS.Timeout[] = []
    MESSAGES.forEach((msg, i) => {
      timers.push(setTimeout(() => setVisibleCount(i + 1), msg.delay))
    })
    return () => timers.forEach(clearTimeout)
  }, [started])

  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [visibleCount])

  return (
    <div ref={sectionRef} className="w-full max-w-[380px] mx-auto">
      {/* Phone frame */}
      <div className="rounded-[28px] bg-[#111b21] border border-white/10 shadow-2xl shadow-green-900/20 overflow-hidden">
        {/* WhatsApp header */}
        <div className="bg-[#1f2c34] px-4 py-3 flex items-center gap-3 border-b border-white/5">
          <div className="size-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
            R
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-100 leading-tight">Rookinho IA</p>
            <p className="text-[11px] text-green-400">online</p>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M15.9 14.3H15l-.3-.3c1-1.1 1.6-2.7 1.6-4.3 0-3.7-3-6.7-6.7-6.7S3 6 3 9.7s3 6.7 6.7 6.7c1.6 0 3.2-.6 4.3-1.6l.3.3v.8l5.1 5.1 1.5-1.5-5-5.2zm-6.2 0c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2 4.6-4.6 4.6z"/></svg>
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"/></svg>
          </div>
        </div>

        {/* Chat body */}
        <div
          ref={containerRef}
          className="h-[380px] px-3 py-3 flex flex-col gap-2 overflow-y-auto"
          style={{ background: 'linear-gradient(180deg, #0b141a 0%, #0d1418 100%)' }}
        >
          {/* Encryption notice */}
          <div className="text-center mb-2">
            <span className="text-[10px] text-slate-600 bg-[#1d2a33] px-3 py-1 rounded-lg inline-block">
              Mensagens com criptografia de ponta a ponta
            </span>
          </div>

          {MESSAGES.slice(0, visibleCount).map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} whatsapp-msg-in`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                  msg.from === 'user'
                    ? 'bg-[#005c4b] text-slate-100 rounded-tr-sm'
                    : 'bg-[#1f2c34] text-slate-200 rounded-tl-sm'
                }`}
                style={{ whiteSpace: 'pre-line' }}
              >
                {msg.text}
                <span className="text-[10px] text-slate-500 float-right mt-1 ml-2">
                  {msg.from === 'user' ? '✓✓' : ''}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {started && visibleCount < MESSAGES.length && (
            <div className="flex justify-start">
              <div className="bg-[#1f2c34] rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="size-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="size-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="size-2 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="bg-[#1f2c34] px-3 py-2 flex items-center gap-2 border-t border-white/5">
          <div className="flex items-center gap-3 text-slate-500">
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 9.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5-.7 1.5-1.5 1.5-1.5-.7-1.5-1.5zM12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6zm0-14C6.5 4 2 8.5 2 14h4c0-3.3 2.7-6 6-6s6 2.7 6 6h4c0-5.5-4.5-10-10-10z"/></svg>
          </div>
          <div className="flex-1 bg-[#2a3942] rounded-full px-4 py-2 text-sm text-slate-500">
            Mensagem
          </div>
          <div className="text-slate-500">
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/></svg>
          </div>
        </div>
      </div>
    </div>
  )
}
