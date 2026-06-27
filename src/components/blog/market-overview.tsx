'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Bitcoin, BarChart3 } from 'lucide-react'

interface StockQuote {
  symbol: string
  price: number
  change: number
}

interface MarketData {
  ibovespa: { price: number; change: number } | null
  gainers: StockQuote[]
  losers: StockQuote[]
  currencies: { name: string; buy: string; sell: string }[]
  crypto: { name: string; price: string; change: number }[]
}

const TRACKED_STOCKS = 'PETR4,VALE3,ITUB4,ABEV3,MGLU3,BBDC4,WEGE3,TOTS3,LREN3,SUZB3,BRKM5,AZZA3,CSNA3,USIM5,DIRR3,CEAB3,MBRF3'

async function fetchMarketOverview(): Promise<MarketData> {
  const data: MarketData = { ibovespa: null, gainers: [], losers: [], currencies: [], crypto: [] }

  try {
    const [stocksRes, cryptoRes, fxRes] = await Promise.all([
      fetch(`https://brapi.dev/api/quote/${TRACKED_STOCKS}?token=demo`, { signal: AbortSignal.timeout(8000) }).catch(() => null),
      fetch('https://brapi.dev/api/v2/crypto?coin=BTC,ETH&currency=BRL', { signal: AbortSignal.timeout(8000) }).catch(() => null),
      fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL', { signal: AbortSignal.timeout(8000) }).catch(() => null),
    ])

    if (stocksRes?.ok) {
      const json = await stocksRes.json()
      const results: { symbol: string; regularMarketPrice: number; regularMarketChangePercent: number }[] = json.results ?? []

      const quotes = results.map(s => ({
        symbol: s.symbol,
        price: s.regularMarketPrice,
        change: Number(s.regularMarketChangePercent?.toFixed(2) ?? 0),
      }))

      const ibov = quotes.find(q => q.symbol === 'IBOV' || q.symbol === '^BVSP')
      if (ibov) data.ibovespa = { price: ibov.price, change: ibov.change }

      const stocks = quotes.filter(q => q.symbol !== 'IBOV' && q.symbol !== '^BVSP')
      const sorted = [...stocks].sort((a, b) => b.change - a.change)
      data.gainers = sorted.filter(s => s.change > 0).slice(0, 5)
      data.losers = sorted.filter(s => s.change < 0).sort((a, b) => a.change - b.change).slice(0, 5)
    }

    if (cryptoRes?.ok) {
      const json = await cryptoRes.json()
      const coins = json.coins ?? []
      for (const c of coins) {
        data.crypto.push({
          name: c.coin === 'BTC' ? 'Bitcoin' : c.coin === 'ETH' ? 'Ethereum' : c.coin,
          price: `R$ ${Number(c.regularMarketPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          change: Number((c.regularMarketChangePercent ?? 0).toFixed(2)),
        })
      }
    }

    if (fxRes?.ok) {
      const fx = await fxRes.json()
      const pairs: [string, string][] = [['USDBRL', 'Dólar'], ['EURBRL', 'Euro'], ['GBPBRL', 'Libra']]
      for (const [key, name] of pairs) {
        if (fx[key]) {
          data.currencies.push({
            name,
            buy: `R$ ${Number(fx[key].bid).toFixed(3).replace('.', ',')}`,
            sell: `R$ ${Number(fx[key].ask).toFixed(3).replace('.', ',')}`,
          })
        }
      }
    }
  } catch {}

  return data
}

function fmt(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',')}`
}

export function MarketOverview() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMarketOverview().then(d => { setData(d); setLoading(false) })
    const interval = setInterval(() => fetchMarketOverview().then(setData), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 rounded-xl bg-slate-100" />
        ))}
      </div>
    )
  }

  if (!data) return null

  const now = new Date()
  const timeStr = now.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <BarChart3 className="size-5 text-brand-600" />
          Mercado Financeiro
        </h2>
        <span className="text-[11px] text-slate-400">Atualizado {timeStr} · Delay 15 min</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ibovespa + Altas/Baixas */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-hidden">
          {data.ibovespa && (
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-500">Ibovespa</span>
                <span className="text-2xl font-bold text-slate-800">
                  {data.ibovespa.price.toLocaleString('pt-BR')}
                </span>
                <span className={`inline-flex items-center gap-1 text-sm font-bold px-2 py-0.5 rounded-md ${data.ibovespa.change >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                  {data.ibovespa.change >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
                  {data.ibovespa.change >= 0 ? '+' : ''}{data.ibovespa.change}%
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 divide-x divide-slate-100">
            {/* Maiores altas */}
            <div className="p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mb-3">
                <ArrowUpRight className="size-3.5" /> Maiores altas
              </h3>
              <div className="space-y-2">
                {data.gainers.length === 0 && <p className="text-xs text-slate-400">Sem dados</p>}
                {data.gainers.map(s => (
                  <div key={s.symbol} className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600">{s.symbol}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-emerald-600">+{s.change}%</span>
                      <span className="text-xs text-slate-600">{fmt(s.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maiores baixas */}
            <div className="p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-bold text-red-500 mb-3">
                <ArrowDownRight className="size-3.5" /> Maiores baixas
              </h3>
              <div className="space-y-2">
                {data.losers.length === 0 && <p className="text-xs text-slate-400">Sem dados</p>}
                {data.losers.map(s => (
                  <div key={s.symbol} className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-600">{s.symbol}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-red-500">{s.change}%</span>
                      <span className="text-xs text-slate-600">{fmt(s.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Moedas + Cripto */}
        <div className="space-y-4">
          {/* Moedas */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-3">
              <DollarSign className="size-3.5 text-green-600" /> Moedas
            </h3>
            <div className="space-y-0">
              <div className="flex items-center justify-between text-[10px] font-medium text-slate-400 mb-1.5">
                <span>Moeda</span>
                <div className="flex gap-6">
                  <span>Compra</span>
                  <span>Venda</span>
                </div>
              </div>
              {data.currencies.map(c => (
                <div key={c.name} className="flex items-center justify-between py-1.5 border-t border-slate-50">
                  <span className="text-xs font-semibold text-blue-600">{c.name}</span>
                  <div className="flex gap-4 text-xs text-slate-600">
                    <span>{c.buy}</span>
                    <span>{c.sell}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cripto */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-3">
              <Bitcoin className="size-3.5 text-orange-500" /> Criptoativos
            </h3>
            <div className="space-y-0">
              {data.crypto.map(c => (
                <div key={c.name} className="flex items-center justify-between py-1.5 border-t border-slate-50 first:border-t-0">
                  <span className="text-xs font-semibold text-slate-700">{c.name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${c.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {c.change >= 0 ? '+' : ''}{c.change}%
                    </span>
                    <span className="text-xs text-slate-600">{c.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
