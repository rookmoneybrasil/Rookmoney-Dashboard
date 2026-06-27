'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, ArrowLeft, RefreshCw, Search, DollarSign, Bitcoin } from 'lucide-react'

interface StockItem {
  symbol: string; name: string; price: number; change: number; changePercent: number
  previousClose: number; open: number; high: number; low: number
  volume: number; marketCap: number; logo: string; sector: string
}
interface CurrencyItem { name: string; buy: number; sell: number; change: number }
interface CryptoItem { name: string; price: number; change: number }

interface MarketData {
  stocks: StockItem[]
  currencies: CurrencyItem[]
  crypto: CryptoItem[]
  updatedAt: string
}

function fmtBRL(n: number) { return n.toFixed(2).replace('.', ',') }
function fmtK(n: number) { return n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` : n >= 1e6 ? `${(n / 1e6).toFixed(0)}M` : n.toLocaleString('pt-BR') }

type SortKey = 'symbol' | 'price' | 'changePercent' | 'volume' | 'high' | 'low' | 'open'
type SortDir = 'asc' | 'desc'

export function CotacoesClient() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('changePercent')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [filter, setFilter] = useState<'all' | 'gainers' | 'losers'>('all')
  const [refreshing, setRefreshing] = useState(false)

  async function load() {
    try {
      const res = await fetch('/api/market?full=1', { signal: AbortSignal.timeout(30000) })
      if (res.ok) {
        const d = await res.json()
        setData(d)
      }
    } catch {}
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { load() }, [])

  function handleRefresh() {
    setRefreshing(true)
    load()
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'symbol' ? 'asc' : 'desc') }
  }

  const SortHeader = ({ k, label, align = 'right' }: { k: SortKey; label: string; align?: string }) => (
    <th
      onClick={() => handleSort(k)}
      className={`px-4 py-3 font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 transition-colors select-none ${align === 'left' ? 'text-left' : 'text-right'}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {sortKey === k && <span className="text-brand-600">{sortDir === 'asc' ? '↑' : '↓'}</span>}
      </span>
    </th>
  )

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-slate-100 rounded" />
          <div className="h-4 w-96 bg-slate-100 rounded" />
          <div className="h-[600px] bg-slate-100 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data || data.stocks.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <p className="text-slate-400 mb-4">Não foi possível carregar as cotações.</p>
        <button onClick={handleRefresh} className="text-brand-600 hover:underline text-sm">Tentar novamente</button>
      </div>
    )
  }

  let stocks = [...data.stocks]

  if (search.trim()) {
    const q = search.toLowerCase()
    stocks = stocks.filter(s => s.symbol.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q))
  }

  if (filter === 'gainers') stocks = stocks.filter(s => s.changePercent > 0)
  if (filter === 'losers') stocks = stocks.filter(s => s.changePercent < 0)

  stocks.sort((a, b) => {
    const av = a[sortKey] ?? 0
    const bv = b[sortKey] ?? 0
    if (typeof av === 'string' && typeof bv === 'string') return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  const timeStr = new Date(data.updatedAt).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 mb-3 transition-colors">
          <ArrowLeft className="size-3.5" /> Voltar ao Blog
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Cotações em Tempo Real</h1>
        <p className="text-sm text-slate-500 mt-1">
          Acompanhe as maiores altas e baixas da Bolsa brasileira, moedas e criptoativos.
        </p>
      </div>

      {/* Moedas + Cripto cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {data.currencies.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-3">
              <DollarSign className="size-4 text-green-600" /> Moedas
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {data.currencies.map(c => (
                <div key={c.name} className="text-center">
                  <p className="text-xs font-semibold text-blue-600">{c.name}</p>
                  <p className="text-sm font-bold text-slate-800">R$ {c.buy.toFixed(2).replace('.', ',')}</p>
                  <p className={`text-[10px] font-semibold ${c.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {c.change >= 0 ? '+' : ''}{c.change}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.crypto.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700 mb-3">
              <Bitcoin className="size-4 text-orange-500" /> Criptoativos
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {data.crypto.map(c => (
                <div key={c.name} className="text-center">
                  <p className="text-xs font-semibold text-slate-700">{c.name}</p>
                  <p className="text-sm font-bold text-slate-800">R$ {c.price.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                  <p className={`text-[10px] font-semibold ${c.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {c.change >= 0 ? '+' : ''}{c.change}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar ativo..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'gainers', 'losers'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-medium px-3.5 py-2 rounded-full border transition-colors ${
                filter === f
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'gainers' ? '📈 Altas' : '📉 Baixas'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 sm:ml-auto">
          <span className="text-[11px] text-slate-400">{timeStr} · Delay 15 min</span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-500 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-2 text-xs text-slate-500">
        <span>{stocks.length} ativo{stocks.length !== 1 ? 's' : ''}</span>
        <span className="text-emerald-600">{data.stocks.filter(s => s.changePercent > 0).length} em alta</span>
        <span className="text-red-500">{data.stocks.filter(s => s.changePercent < 0).length} em baixa</span>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <SortHeader k="symbol" label="Ativo" align="left" />
                <SortHeader k="price" label="Último (R$)" />
                <SortHeader k="changePercent" label="Var. Dia (%)" />
                <th className="px-4 py-3 font-semibold text-slate-500 uppercase tracking-wider text-right">Var. (R$)</th>
                <SortHeader k="open" label="Abertura" />
                <SortHeader k="high" label="Máxima" />
                <SortHeader k="low" label="Mínima" />
                <SortHeader k="volume" label="Volume" />
              </tr>
            </thead>
            <tbody>
              {stocks.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">Nenhum ativo encontrado.</td></tr>
              )}
              {stocks.map((s, i) => (
                <tr key={s.symbol} className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-blue-600">{s.symbol}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-slate-800 tabular-nums">{fmtBRL(s.price)}</td>
                  <td className={`px-4 py-2.5 text-right font-bold tabular-nums ${s.changePercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {s.changePercent >= 0 ? '+' : ''}{s.changePercent}%
                  </td>
                  <td className={`px-4 py-2.5 text-right tabular-nums ${s.change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {s.change >= 0 ? '+' : ''}{s.change.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">{fmtBRL(s.open)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">{fmtBRL(s.high)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">{fmtBRL(s.low)}</td>
                  <td className="px-4 py-2.5 text-right text-slate-600 tabular-nums">{fmtK(s.volume)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 py-10 px-8 rounded-2xl bg-slate-900 text-center">
        <h3 className="text-xl font-bold text-white mb-2">Organize seus investimentos</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">Controle seus aportes, metas e gastos com o Rook Money. Grátis para começar.</p>
        <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors">
          Criar conta grátis
        </Link>
      </div>
    </div>
  )
}
