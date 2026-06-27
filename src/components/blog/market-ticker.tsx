'use client'

import { useEffect, useState, useRef } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TickerItem {
  symbol: string
  price: string
  change: number
}

const FALLBACK_DATA: TickerItem[] = [
  { symbol: 'IBOV', price: '173.295', change: 0.76 },
  { symbol: 'PETR4', price: 'R$38,06', change: -1.01 },
  { symbol: 'VALE3', price: 'R$78,15', change: -0.65 },
  { symbol: 'ITUB4', price: 'R$42,24', change: 1.29 },
  { symbol: 'ABEV3', price: 'R$16,73', change: 2.07 },
  { symbol: 'MGLU3', price: 'R$4,44', change: 0.45 },
  { symbol: 'BITCOIN', price: 'R$313.209', change: 1.02 },
  { symbol: 'ETHEREUM', price: 'R$8.241', change: 0.94 },
  { symbol: 'DÓLAR', price: 'R$5,17', change: -0.38 },
  { symbol: 'EURO', price: 'R$5,89', change: 0.12 },
  { symbol: 'IFIX', price: '3.806pts', change: 0.29 },
]

async function fetchMarketData(): Promise<TickerItem[]> {
  try {
    const [stocksRes, cryptoRes] = await Promise.all([
      fetch('https://brapi.dev/api/quote/IBOV,PETR4,VALE3,ITUB4,ABEV3,MGLU3,BBDC4,WEGE3?token=demo', { signal: AbortSignal.timeout(5000) }),
      fetch('https://brapi.dev/api/v2/crypto?coin=BTC,ETH&currency=BRL', { signal: AbortSignal.timeout(5000) }),
    ])

    const items: TickerItem[] = []

    if (stocksRes.ok) {
      const stocksJson = await stocksRes.json()
      const results = stocksJson.results ?? []
      for (const s of results) {
        items.push({
          symbol: s.symbol ?? s.shortName,
          price: s.symbol === 'IBOV' || s.symbol === '^BVSP'
            ? Number(s.regularMarketPrice).toLocaleString('pt-BR')
            : `R$${Number(s.regularMarketPrice).toFixed(2).replace('.', ',')}`,
          change: Number((s.regularMarketChangePercent ?? 0).toFixed(2)),
        })
      }
    }

    if (cryptoRes.ok) {
      const cryptoJson = await cryptoRes.json()
      const coins = cryptoJson.coins ?? []
      for (const c of coins) {
        const name = c.coin === 'BTC' ? 'BITCOIN' : c.coin === 'ETH' ? 'ETHEREUM' : c.coin
        items.push({
          symbol: name,
          price: `R$${Number(c.regularMarketPrice).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`,
          change: Number((c.regularMarketChangePercent ?? 0).toFixed(2)),
        })
      }
    }

    // Add USD/BRL
    try {
      const fxRes = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL', { signal: AbortSignal.timeout(5000) })
      if (fxRes.ok) {
        const fx = await fxRes.json()
        if (fx.USDBRL) items.push({ symbol: 'DÓLAR', price: `R$${Number(fx.USDBRL.bid).toFixed(2).replace('.', ',')}`, change: Number(Number(fx.USDBRL.pctChange).toFixed(2)) })
        if (fx.EURBRL) items.push({ symbol: 'EURO', price: `R$${Number(fx.EURBRL.bid).toFixed(2).replace('.', ',')}`, change: Number(Number(fx.EURBRL.pctChange).toFixed(2)) })
      }
    } catch {}

    return items.length > 4 ? items : FALLBACK_DATA
  } catch {
    return FALLBACK_DATA
  }
}

export function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK_DATA)
  const scrollRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    fetchMarketData().then(setItems)
    const interval = setInterval(() => fetchMarketData().then(setItems), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
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
