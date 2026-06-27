'use client'

import { useEffect, useState, useRef } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TickerItem {
  symbol: string
  price: string
  change: number
}

function fmtPrice(symbol: string, price: number): string {
  if (symbol === 'IBOV' || symbol === '^BVSP') return price.toLocaleString('pt-BR')
  if (symbol === 'Bitcoin' || symbol === 'Ethereum') return `R$${price.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
  return `R$${price.toFixed(2).replace('.', ',')}`
}

async function fetchTicker(): Promise<TickerItem[]> {
  try {
    const res = await fetch('/api/market', { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return []
    const data = await res.json()

    const items: TickerItem[] = []
    for (const s of (data.stocks ?? [])) {
      items.push({ symbol: s.symbol, price: fmtPrice(s.symbol, s.price), change: s.changePercent ?? s.change })
    }
    for (const c of (data.crypto ?? [])) {
      items.push({ symbol: c.name.toUpperCase(), price: fmtPrice(c.name, c.price), change: c.change })
    }
    for (const fx of (data.currencies ?? [])) {
      items.push({ symbol: fx.name.toUpperCase(), price: `R$${fx.buy.toFixed(2).replace('.', ',')}`, change: fx.change })
    }
    return items.length > 0 ? items : []
  } catch { return [] }
}

export function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    fetchTicker().then(setItems)
    const interval = setInterval(() => fetchTicker().then(setItems), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el || items.length === 0) return
    let pos = 0
    const speed = 0.5

    function tick() {
      pos += speed
      if (pos >= el!.scrollWidth / 2) pos = 0
      el!.scrollLeft = pos
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)

    const pause = () => cancelAnimationFrame(animRef.current)
    const resume = () => { animRef.current = requestAnimationFrame(tick) }
    el.addEventListener('mouseenter', pause)
    el.addEventListener('mouseleave', resume)

    return () => {
      cancelAnimationFrame(animRef.current)
      el.removeEventListener('mouseenter', pause)
      el.removeEventListener('mouseleave', resume)
    }
  }, [items])

  if (items.length === 0) return null

  const doubled = [...items, ...items]

  return (
    <div className="bg-slate-950 border-b border-slate-800/50 overflow-hidden">
      <div ref={scrollRef} className="flex items-center gap-0 overflow-hidden whitespace-nowrap h-8 scrollbar-hide">
        {doubled.map((item, i) => (
          <div key={i} className="inline-flex items-center gap-1.5 px-4 h-full border-r border-slate-800/40 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400">{item.symbol}</span>
            <span className="text-[11px] font-medium text-white">{item.price}</span>
            <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {item.change >= 0 ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
              {item.change >= 0 ? '+' : ''}{item.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
