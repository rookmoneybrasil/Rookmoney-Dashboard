'use client'

import { useEffect, useRef, useState } from 'react'

interface FadeInProps {
  children:   React.ReactNode
  className?: string
  delay?:     number   // ms
  from?:      'bottom' | 'left' | 'right' | 'fade'
  once?:      boolean  // default true — só anima na primeira vez
}

export function FadeIn({ children, className = '', delay = 0, from = 'bottom', once = true }: FadeInProps) {
  const ref     = useRef<HTMLDivElement>(null)
  const [vis, setVis] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVis(true)
          if (once) io.disconnect()
        } else if (!once) {
          setVis(false)
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [once])

  const base = 'transition-all duration-700 ease-out'
  const hidden: Record<typeof from, string> = {
    bottom: 'opacity-0 translate-y-8',
    left:   'opacity-0 -translate-x-8',
    right:  'opacity-0 translate-x-8',
    fade:   'opacity-0',
  }
  const visible = 'opacity-100 translate-y-0 translate-x-0'

  return (
    <div
      ref={ref}
      className={`${base} ${vis ? visible : hidden[from]} ${className}`}
      style={{ transitionDelay: vis ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}
