'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { MASCOT_SRCS, type MascotMood, type MascotEvent } from '@/lib/mascot'
import { MascotChat } from './mascot-chat'

const MOOD_TITLES: Partial<Record<MascotMood, string>> = {
  euphoric:    'INCRÍVEL! 🤩',
  celebrating: 'PARABÉNS! 🎉',
  happy:       'MUITO BOM! 😊',
  determined:  'FOCO TOTAL! 💪',
  counting:    'REGISTRADO! 📝',
  sad:         'ATENÇÃO... 😢',
  angry:       'CUIDADO! 😤',
  confused:    'HMMMM... 🤔',
}

interface EventToast { mood: MascotMood; message: string }
interface Props { baseMood?: MascotMood }

export function Mascot({ baseMood = 'idle' }: Props) {
  const [mood, setMood]           = useState<MascotMood>(baseMood)
  const [animClass, setAnim]      = useState('')
  const [popup, setPopup]         = useState<EventToast | null>(null)
  const [popupVisible, setPopupVisible] = useState(false)
  const [progress, setProgress]   = useState(100)
  const [chatOpen, setChatOpen]   = useState(false)
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimers = () => {
    if (timerRef.current)    clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  const dismissPopup = useCallback(() => {
    clearTimers()
    setPopupVisible(false)
    setTimeout(() => { setPopup(null); setMood(baseMood) }, 350)
  }, [baseMood])

  const showPopup = useCallback((mood: MascotMood, message: string) => {
    clearTimers()
    setChatOpen(false)
    const anim = ['angry', 'sad'].includes(mood) ? 'mascot-shake' : ''
    setMood(mood)
    setAnim(anim)
    setTimeout(() => setAnim(''), 1200)

    setPopup({ mood, message })
    setProgress(100)
    setPopupVisible(true)

    const DURATION = 6000
    const TICK     = 80
    let elapsed    = 0
    intervalRef.current = setInterval(() => {
      elapsed += TICK
      setProgress(Math.max(0, 100 - (elapsed / DURATION) * 100))
    }, TICK)

    timerRef.current = setTimeout(() => dismissPopup(), DURATION)
  }, [dismissPopup])

  useEffect(() => {
    const handler = (e: Event) => {
      const { mood, message } = (e as CustomEvent<MascotEvent>).detail
      showPopup(mood, message)
    }
    window.addEventListener('mascot:react', handler)
    return () => window.removeEventListener('mascot:react', handler)
  }, [showPopup])

  useEffect(() => {
    if (!popup) setMood(baseMood)
  }, [baseMood, popup])

  useEffect(() => () => clearTimers(), [])

  const isCelebration = popup && ['euphoric', 'celebrating', 'happy'].includes(popup.mood)

  return (
    <>
      {/* ── Fixed mascot — bottom right ─────────────────────── */}
      <div className="fixed bottom-16 right-8 z-40 select-none print:hidden flex flex-col items-end gap-2">

        {/* Chat panel — opens above the mascot */}
        {chatOpen && (
          <div className="bubble-in">
            <MascotChat onClose={() => setChatOpen(false)} />
          </div>
        )}

        {/* Character + chat button */}
        <div className="relative group">
          {/* Chat badge / tooltip */}
          {!chatOpen && !popup && (
            <div className="absolute -top-2 -left-2 size-6 rounded-full bg-brand-600 border-2 border-ink-900 flex items-center justify-center z-10 animate-pulse">
              <MessageCircle className="size-3 text-white" />
            </div>
          )}

          <div
            className={`${animClass} cursor-pointer`}
            style={{ width: 100, height: 100 }}
            onClick={() => {
              if (popup) dismissPopup()
              else setChatOpen(v => !v)
            }}
          >
            <img
              src={MASCOT_SRCS[mood]}
              alt="Rook — clique para abrir o assistente"
              width={100}
              height={100}
              className="object-contain transition-transform group-hover:scale-110"
              style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' }}
            />
          </div>
        </div>
      </div>

      {/* ── Center popup (eventos do app) ──────────────────── */}
      {popup && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 print:hidden ${
            popupVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ backdropFilter: popupVisible ? 'blur(6px)' : 'none', backgroundColor: 'rgba(3,7,16,0.65)' }}
          onClick={dismissPopup}
        >
          <div
            className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl transition-all duration-350 ${
              popupVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-8'
            } ${isCelebration
              ? 'bg-gradient-to-b from-brand-900 to-ink-800 border border-brand-700/50'
              : 'bg-ink-700 border border-white/10'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={dismissPopup}
              className="absolute top-3 right-3 size-8 rounded-full bg-ink-600/80 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-ink-500 transition-colors z-10"
            >
              <X className="size-4" />
            </button>

            {isCelebration && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {['#3B82F6','#F59E0B','#22C55E','#EC4899','#8B5CF6'].map((c, i) => (
                  <div
                    key={i}
                    className="absolute size-2 rounded-full opacity-60"
                    style={{ backgroundColor: c, top: `${10 + i * 18}%`, left: `${8 + i * 17}%`, animation: `mascot-float ${2 + i * 0.4}s ease-in-out infinite` }}
                  />
                ))}
              </div>
            )}

            <div className="flex justify-center pt-8 pb-2">
              <div className="mascot-bounce">
                <img src={MASCOT_SRCS[popup.mood]} alt="" width={200} height={200} className="object-contain"
                  style={{ filter: 'drop-shadow(0 16px 40px rgba(0,0,0,0.5))' }} />
              </div>
            </div>

            <div className="px-7 pb-4 text-center flex flex-col gap-2">
              <h3 className={`text-2xl font-black tracking-tight ${isCelebration ? 'text-white' : 'text-slate-100'}`}>
                {MOOD_TITLES[popup.mood] ?? 'OI! 👋'}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">{popup.message}</p>
            </div>

            <div className="h-1 w-full bg-white/10">
              <div
                className={`h-full ${isCelebration ? 'bg-brand-500' : 'bg-slate-500'}`}
                style={{ width: `${progress}%`, transition: 'width 80ms linear' }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
