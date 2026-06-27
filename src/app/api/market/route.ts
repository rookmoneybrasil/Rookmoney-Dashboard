import { NextResponse } from 'next/server'

interface StockItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  previousClose: number
  open: number
  high: number
  low: number
  volume: number
  marketCap: number
  logo: string
  sector: string
}
interface CurrencyItem { name: string; buy: number; sell: number; change: number }
interface CryptoItem { name: string; price: number; change: number }

interface MarketResponse {
  stocks: StockItem[]
  currencies: CurrencyItem[]
  crypto: CryptoItem[]
  updatedAt: string
}

let cache: { data: MarketResponse; expiresAt: number } | null = null
let cacheFull: { data: MarketResponse; expiresAt: number } | null = null

async function fetchStockList(limit: number): Promise<StockItem[]> {
  try {
    const res = await fetch(
      `https://brapi.dev/api/quote/list?sortBy=volume&sortOrder=desc&limit=${limit}&type=stock`,
      { signal: AbortSignal.timeout(10000) },
    )
    if (!res.ok) return []
    const json = await res.json()
    return (json.stocks ?? []).map((s: Record<string, unknown>) => ({
      symbol: s.stock as string,
      name: (s.name as string) ?? '',
      price: Number(s.close ?? 0),
      change: 0,
      changePercent: Number(s.change ?? 0),
      previousClose: 0,
      open: 0,
      high: 0,
      low: 0,
      volume: Number(s.volume ?? 0),
      marketCap: Number(s.market_cap ?? 0),
      logo: (s.logo as string) ?? '',
      sector: (s.sector as string) ?? '',
    }))
  } catch { return [] }
}

async function fetchStockDetails(symbols: string[]): Promise<Map<string, Partial<StockItem>>> {
  const details = new Map<string, Partial<StockItem>>()
  const fetchOne = async (sym: string) => {
    try {
      const res = await fetch(`https://brapi.dev/api/quote/${sym}`, { signal: AbortSignal.timeout(5000) })
      if (!res.ok) return
      const json = await res.json()
      const s = json.results?.[0]
      if (!s) return
      details.set(sym, {
        price: Number(s.regularMarketPrice ?? 0),
        change: Number(s.regularMarketChange ?? 0),
        changePercent: Number(Number(s.regularMarketChangePercent ?? 0).toFixed(2)),
        previousClose: Number(s.regularMarketPreviousClose ?? 0),
        open: Number(s.regularMarketOpen ?? 0),
        high: Number(s.regularMarketDayHigh ?? 0),
        low: Number(s.regularMarketDayLow ?? 0),
        volume: Number(s.regularMarketVolume ?? 0),
      })
    } catch {}
  }
  // Fetch in batches of 8 with 300ms delay to avoid rate limiting
  for (let i = 0; i < symbols.length; i += 8) {
    const batch = symbols.slice(i, i + 8)
    await Promise.all(batch.map(fetchOne))
    if (i + 8 < symbols.length) await new Promise(r => setTimeout(r, 300))
  }
  return details
}

async function fetchMarket(full: boolean): Promise<MarketResponse> {
  const limit = full ? 80 : 20

  const [stocks, cryptoRes, fxRes] = await Promise.all([
    fetchStockList(limit),
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=brl&include_24hr_change=true', {
      signal: AbortSignal.timeout(8000),
    }).catch(() => null),
    fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL', {
      signal: AbortSignal.timeout(8000),
    }).catch(() => null),
  ])

  // For the main widget (not full), enrich top stocks with detailed data
  if (!full && stocks.length > 0) {
    const topSymbols = stocks.slice(0, 17).map(s => s.symbol)
    const details = await fetchStockDetails(topSymbols)
    for (const s of stocks) {
      const d = details.get(s.symbol)
      if (d) Object.assign(s, d)
    }
  }

  const crypto: CryptoItem[] = []
  if (cryptoRes?.ok) {
    const json = await cryptoRes.json() as Record<string, { brl?: number; brl_24h_change?: number }>
    const coins: [string, string][] = [['bitcoin', 'Bitcoin'], ['ethereum', 'Ethereum'], ['solana', 'Solana']]
    for (const [id, name] of coins) {
      if (json[id]?.brl) {
        crypto.push({
          name,
          price: json[id].brl!,
          change: Number((json[id].brl_24h_change ?? 0).toFixed(2)),
        })
      }
    }
  }

  const currencies: CurrencyItem[] = []
  if (fxRes?.ok) {
    const fx = await fxRes.json()
    const pairs: [string, string][] = [['USDBRL', 'Dólar'], ['EURBRL', 'Euro'], ['GBPBRL', 'Libra']]
    for (const [key, name] of pairs) {
      if (fx[key]) {
        currencies.push({
          name,
          buy: Number(fx[key].bid),
          sell: Number(fx[key].ask),
          change: Number(Number(fx[key].pctChange).toFixed(2)),
        })
      }
    }
  }

  return { stocks, currencies, crypto, updatedAt: new Date().toISOString() }
}

export async function GET(req: Request) {
  const now = Date.now()
  const { searchParams } = new URL(req.url)
  const full = searchParams.get('full') === '1'

  const activeCache = full ? cacheFull : cache
  if (activeCache && activeCache.expiresAt > now) {
    return NextResponse.json(activeCache.data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    })
  }

  const data = await fetchMarket(full)

  if (full) cacheFull = { data, expiresAt: now + 5 * 60 * 1000 }
  else cache = { data, expiresAt: now + 5 * 60 * 1000 }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  })
}
