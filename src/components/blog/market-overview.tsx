'use client'

import { useEffect, useState, useMemo } from 'react'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Bitcoin, Search } from 'lucide-react'

interface StockItem {
  symbol: string; price: number; change: number; changePercent: number
  previousClose: number; open: number; high: number; low: number
  volume: number; marketCap: number; logo: string
}
interface CurrencyItem { name: string; buy: number; sell: number; change: number }
interface CryptoItem { name: string; price: number; change: number }

interface MarketData {
  stocks: StockItem[]
  currencies: CurrencyItem[]
  crypto: CryptoItem[]
  updatedAt: string | null
}

async function fetchMarketData(): Promise<MarketData | null> {
  try {
    const res = await fetch('/api/market', { signal: AbortSignal.timeout(12000) })
    if (!res.ok) return null
    return await res.json()
  } catch { return null }
}

function fmtBRL(n: number) { return `R$ ${n.toFixed(2).replace('.', ',')}` }
function fmtK(n: number) { return n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(0)}M` : n.toLocaleString('pt-BR') }

function MiniChart({ high, low, open, price }: { high: number; low: number; open: number; price: number }) {
  const range = high - low || 1
  const points = useMemo(() => {
    const pts: number[] = []
    const mid = (high + low) / 2
    const seed = Math.round(open * 100) % 17
    let val = open
    for (let i = 0; i <= 20; i++) {
      const noise = Math.sin(i * 0.8 + seed) * range * 0.15 + Math.cos(i * 1.3 + seed * 0.7) * range * 0.1
      const progress = i / 20
      val = open + (price - open) * progress + noise
      val = Math.max(low, Math.min(high, val))
      pts.push(val)
    }
    pts[0] = open
    pts[pts.length - 1] = price
    return pts
  }, [high, low, open, price])

  const minVal = Math.min(...points)
  const maxVal = Math.max(...points)
  const valRange = maxVal - minVal || 1
  const w = 220
  const h = 90
  const pad = 4

  const pathPoints = points.map((v, i) => {
    const x = pad + (i / (points.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (v - minVal) / valRange) * (h - pad * 2)
    return `${x},${y}`
  })
  const linePath = `M${pathPoints.join('L')}`
  const areaPath = `${linePath}L${w - pad},${h}L${pad},${h}Z`
  const isUp = price >= open

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity="0.2" />
          <stop offset="100%" stopColor={isUp ? '#10b981' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#chartGrad)" />
      <path d={linePath} fill="none" stroke={isUp ? '#10b981' : '#ef4444'} strokeWidth="2" strokeLinejoin="round" />
      {/* Y-axis labels */}
      {[maxVal, (maxVal + minVal) / 2, minVal].map((v, i) => (
        <text key={i} x={w - 2} y={pad + (i / 2) * (h - pad * 2) + 3} textAnchor="end" fontSize="8" fill="#94a3b8">
          {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
        </text>
      ))}
    </svg>
  )
}

export function MarketOverview() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchMarketData().then(d => { setData(d); setLoading(false) })
    const interval = setInterval(() => fetchMarketData().then(setData), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="mb-10 animate-pulse">
        <div className="h-[340px] rounded-xl bg-slate-100" />
      </div>
    )
  }

  if (!data || data.stocks.length === 0) return null

  const sorted = [...data.stocks].sort((a, b) => b.changePercent - a.changePercent)
  const gainers = sorted.filter(s => s.changePercent > 0).slice(0, 5)
  const losers = sorted.filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 5)

  // Use first stock as "index reference" for the chart area
  const topStock = sorted[0]
  const avgPrice = data.stocks.reduce((a, s) => a + s.price, 0) / data.stocks.length
  const avgPrev = data.stocks.reduce((a, s) => a + s.previousClose, 0) / data.stocks.length
  const avgChange = avgPrev > 0 ? ((avgPrice - avgPrev) / avgPrev * 100) : 0

  const timeStr = data.updatedAt
    ? new Date(data.updatedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : ''

  const filteredStocks = search.trim()
    ? data.stocks.filter(s => s.symbol.toLowerCase().includes(search.toLowerCase()))
    : null

  return (
    <div className="mb-10">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
          {/* Left: Main content */}
          <div>
            {/* Top bar: Ibovespa-like summary + search */}
            <div className="flex items-center justify-between p-4 pb-0 gap-4 flex-wrap">
              <div className="flex items-baseline gap-3">
                <span className="text-sm font-semibold text-slate-500">Ibovespa</span>
                <span className="text-[28px] font-bold text-slate-800 tabular-nums tracking-tight">
                  {avgPrice > 100 ? Math.round(avgPrice * data.stocks.length).toLocaleString('pt-BR') : avgPrice.toLocaleString('pt-BR')}
                </span>
                <span className={`inline-flex items-center gap-1 text-sm font-bold px-2.5 py-1 rounded-lg ${avgChange >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                  {avgChange >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                  {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}%
                </span>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Ativo ou índice"
                  className="pl-9 pr-4 py-2 w-56 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                />
              </div>
            </div>

            {/* Search results */}
            {filteredStocks && (
              <div className="mx-4 mt-3 mb-2 border border-slate-200 rounded-lg overflow-hidden">
                {filteredStocks.length === 0 ? (
                  <p className="p-3 text-xs text-slate-400 text-center">Nenhum ativo encontrado</p>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-left">
                        <th className="px-3 py-2 font-semibold text-slate-500">Ativo</th>
                        <th className="px-3 py-2 font-semibold text-slate-500 text-right">Preço</th>
                        <th className="px-3 py-2 font-semibold text-slate-500 text-right">Var%</th>
                        <th className="px-3 py-2 font-semibold text-slate-500 text-right">Volume</th>
                        <th className="px-3 py-2 font-semibold text-slate-500 text-right">Máx</th>
                        <th className="px-3 py-2 font-semibold text-slate-500 text-right">Mín</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStocks.map(s => (
                        <tr key={s.symbol} className="border-t border-slate-100 hover:bg-slate-50">
                          <td className="px-3 py-2 font-semibold text-blue-600">{s.symbol}</td>
                          <td className="px-3 py-2 text-right text-slate-700 font-medium">{fmtBRL(s.price)}</td>
                          <td className={`px-3 py-2 text-right font-semibold ${s.changePercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {s.changePercent >= 0 ? '+' : ''}{s.changePercent}%
                          </td>
                          <td className="px-3 py-2 text-right text-slate-500">{fmtK(s.volume)}</td>
                          <td className="px-3 py-2 text-right text-slate-500">{fmtBRL(s.high)}</td>
                          <td className="px-3 py-2 text-right text-slate-500">{fmtBRL(s.low)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Chart + stats row */}
            {!filteredStocks && (
              <div className="grid grid-cols-[200px_1fr_1fr] gap-0">
                {/* Chart */}
                <div className="p-4">
                  <div className="text-[10px] text-slate-400 mb-1">
                    Fech. anterior: {fmtBRL(topStock.previousClose)} · Abert: {fmtBRL(topStock.open)}
                  </div>
                  <div className="h-[100px]">
                    <MiniChart high={topStock.high} low={topStock.low} open={topStock.open} price={topStock.price} />
                  </div>
                </div>

                {/* Maiores altas */}
                <div className="p-4 border-l border-slate-100">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-2">
                    <ArrowUpRight className="size-3.5" /> Maiores altas
                  </h3>
                  <table className="w-full text-xs">
                    <tbody>
                      {gainers.map(s => (
                        <tr key={s.symbol} className="border-b border-slate-50 last:border-0">
                          <td className="py-1.5 font-semibold text-blue-600">{s.symbol}</td>
                          <td className="py-1.5 text-right font-semibold text-emerald-600">+{s.changePercent}%</td>
                          <td className="py-1.5 text-right text-slate-600 pl-3">{fmtBRL(s.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Maiores baixas */}
                <div className="p-4 border-l border-slate-100">
                  <h3 className="flex items-center gap-1.5 text-xs font-bold text-red-500 mb-2">
                    <ArrowDownRight className="size-3.5" /> Maiores baixas
                  </h3>
                  <table className="w-full text-xs">
                    <tbody>
                      {losers.map(s => (
                        <tr key={s.symbol} className="border-b border-slate-50 last:border-0">
                          <td className="py-1.5 font-semibold text-blue-600">{s.symbol}</td>
                          <td className="py-1.5 text-right font-semibold text-red-500">{s.changePercent}%</td>
                          <td className="py-1.5 text-right text-slate-600 pl-3">{fmtBRL(s.price)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                ⏱ {timeStr} · Delay 15 min
              </span>
              <a href="https://www.google.com/finance/?hl=pt-BR" target="_blank" rel="noreferrer"
                className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-full transition-colors">
                Ver mais cotações
              </a>
            </div>
          </div>

          {/* Right sidebar: Moedas + Cripto */}
          <div className="border-l border-slate-200">
            {/* Moedas */}
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Moedas</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="text-left font-medium text-slate-400 pb-2">Moeda</th>
                    <th className="text-right font-medium text-slate-400 pb-2">Compra</th>
                    <th className="text-right font-medium text-slate-400 pb-2">Venda</th>
                  </tr>
                </thead>
                <tbody>
                  {data.currencies.map(c => (
                    <tr key={c.name} className="border-t border-slate-100">
                      <td className="py-2 font-semibold text-blue-600">{c.name}</td>
                      <td className="py-2 text-right text-slate-700">R$ {c.buy.toFixed(3).replace('.', ',')}</td>
                      <td className="py-2 text-right text-slate-700">R$ {c.sell.toFixed(3).replace('.', ',')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Criptoativos */}
            <div className="p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Criptoativos</h3>
              <table className="w-full text-xs">
                <tbody>
                  {data.crypto.map(c => (
                    <tr key={c.name} className="border-t border-slate-100 first:border-0">
                      <td className="py-2 font-semibold text-slate-700">{c.name}</td>
                      <td className={`py-2 text-right font-semibold ${c.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {c.change >= 0 ? '+' : ''}{c.change}%
                      </td>
                      <td className="py-2 text-right text-slate-700 pl-2">
                        R$ {c.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
