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

const BRAPI_TOKEN = process.env.BRAPI_TOKEN ?? ''
const ALL_TICKERS = ['IBOV', 'PETR4', 'VALE3', 'ITUB4', 'ABEV3', 'MGLU3', 'BBDC4', 'WEGE3', 'TOTS3', 'LREN3', 'SUZB3', 'BRKM5', 'AZZA3', 'CSNA3', 'USIM5']

let cache: { data: MarketResponse; expiresAt: number } | null = null

async function fetchSingleStock(ticker: string): Promise<TickerItem | null> {
  try {
    const url = BRAPI_TOKEN
      ? `https://brapi.dev/api/quote/${ticker}?token=${BRAPI_TOKEN}`
      : `https://brapi.dev/api/quote/${ticker}`
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) return null
    const json = await res.json()
    const s = json.results?.[0]
    if (!s) return null
    return {
      symbol: s.symbol as string,
      price: Number(s.regularMarketPrice ?? 0),
      change: Number(Number(s.regularMarketChangePercent ?? 0).toFixed(2)),
    }
  } catch { return null }
}

async function fetchMarket(): Promise<MarketResponse> {
  const [stockResults, cryptoRes, fxRes] = await Promise.all([
    Promise.all(ALL_TICKERS.map(fetchSingleStock)),
    fetch('https://brapi.dev/api/v2/crypto?coin=BTC,ETH&currency=BRL', {
      signal: AbortSignal.timeout(8000),
    }).catch(() => null),
    fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL', {
      signal: AbortSignal.timeout(8000),
    }).catch(() => null),
  ])

  const stocks = stockResults.filter((s): s is TickerItem => s !== null)

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
