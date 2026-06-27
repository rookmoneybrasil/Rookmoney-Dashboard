import { NextResponse } from 'next/server'

interface TickerItem { symbol: string; price: number; change: number }
interface CurrencyItem { name: string; buy: number; sell: number; change: number }
interface CryptoItem { name: string; price: number; change: number }

interface MarketResponse {
  stocks: TickerItem[]
  currencies: CurrencyItem[]
  crypto: CryptoItem[]
  updatedAt: string
}

let cache: { data: MarketResponse; expiresAt: number } | null = null

async function fetchStocks(tickers: string): Promise<TickerItem[]> {
  try {
    const res = await fetch(`https://brapi.dev/api/quote/${tickers}`, {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'RookMoney/1.0' },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.results ?? []).map((s: Record<string, unknown>) => ({
      symbol: s.symbol as string,
      price: Number(s.regularMarketPrice ?? 0),
      change: Number(Number(s.regularMarketChangePercent ?? 0).toFixed(2)),
    }))
  } catch { return [] }
}

async function fetchMarket(): Promise<MarketResponse> {
  const [batch1, batch2, cryptoRes, fxRes] = await Promise.all([
    fetchStocks('IBOV,PETR4,VALE3,ITUB4,ABEV3,MGLU3,BBDC4,WEGE3'),
    fetchStocks('TOTS3,LREN3,SUZB3,BRKM5,AZZA3,CSNA3,USIM5'),
    fetch('https://brapi.dev/api/v2/crypto?coin=BTC,ETH&currency=BRL', {
      signal: AbortSignal.timeout(8000),
      headers: { 'User-Agent': 'RookMoney/1.0' },
    }).catch(() => null),
    fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL', {
      signal: AbortSignal.timeout(8000),
    }).catch(() => null),
  ])

  const stocks = [...batch1, ...batch2]

  const crypto: CryptoItem[] = []
  if (cryptoRes?.ok) {
    const json = await cryptoRes.json()
    for (const c of (json.coins ?? [])) {
      crypto.push({
        name: c.coin === 'BTC' ? 'Bitcoin' : c.coin === 'ETH' ? 'Ethereum' : c.coin,
        price: Number(c.regularMarketPrice ?? 0),
        change: Number(Number(c.regularMarketChangePercent ?? 0).toFixed(2)),
      })
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

export async function GET() {
  const now = Date.now()

  if (cache && cache.expiresAt > now) {
    return NextResponse.json(cache.data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    })
  }

  const data = await fetchMarket()
  cache = { data, expiresAt: now + 5 * 60 * 1000 }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  })
}
