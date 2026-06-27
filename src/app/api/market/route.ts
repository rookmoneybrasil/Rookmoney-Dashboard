import { NextResponse } from 'next/server'

interface StockItem {
  symbol: string
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
}
interface CurrencyItem { name: string; buy: number; sell: number; change: number }
interface CryptoItem { name: string; price: number; change: number }

interface MarketResponse {
  stocks: StockItem[]
  currencies: CurrencyItem[]
  crypto: CryptoItem[]
  updatedAt: string
}

const BRAPI_TOKEN = process.env.BRAPI_TOKEN ?? ''

const TICKERS_MAIN = ['PETR4', 'VALE3', 'ITUB4', 'ABEV3', 'MGLU3', 'BBDC4', 'WEGE3', 'TOTS3', 'LREN3', 'SUZB3', 'BRKM5', 'AZZA3', 'CSNA3', 'USIM5', 'DIRR3', 'CEAB3', 'MBRF3']

const TICKERS_FULL = [
  ...TICKERS_MAIN,
  'B3SA3', 'RENT3', 'EQTL3', 'RAIL3', 'VBBR3', 'ENEV3', 'ASAI3', 'SBSP3', 'HYPE3',
  'VAMO3', 'IGTI11', 'BBDC3', 'CURY3', 'FLRY3', 'AXIA3', 'EMBR3', 'RDOR3', 'COGN3',
  'RADL3', 'CPFE3', 'TIMS3', 'MOTV3', 'BBSE3', 'BPAC11', 'VIVT3', 'SANB11', 'ISAE4',
  'RECV3', 'CSMG3', 'CMIN3', 'BRAV3', 'GGBR4', 'TAEE11', 'PRIO3', 'CMIG4', 'ENGI11',
  'MULT3', 'UGPA3', 'POMO4', 'CSAN3', 'EGIE3', 'CPLE3', 'ALOS3', 'PSSA3', 'CXSE3',
  'AURE3', 'ITSA4', 'HAPV3', 'MRVE3', 'YDUQ3', 'BEEF3', 'NATU3', 'VIVA3',
]

let cache: { data: MarketResponse; expiresAt: number } | null = null
let cacheFull: { data: MarketResponse; expiresAt: number } | null = null

async function fetchSingleStock(ticker: string): Promise<StockItem | null> {
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
      symbol: s.symbol,
      price: Number(s.regularMarketPrice ?? 0),
      change: Number(s.regularMarketChange ?? 0),
      changePercent: Number(Number(s.regularMarketChangePercent ?? 0).toFixed(2)),
      previousClose: Number(s.regularMarketPreviousClose ?? 0),
      open: Number(s.regularMarketOpen ?? 0),
      high: Number(s.regularMarketDayHigh ?? 0),
      low: Number(s.regularMarketDayLow ?? 0),
      volume: Number(s.regularMarketVolume ?? 0),
      marketCap: Number(s.marketCap ?? 0),
      logo: (s.logourl as string) ?? '',
    }
  } catch { return null }
}

async function fetchMarket(tickers: string[]): Promise<MarketResponse> {
  const [stockResults, cryptoRes, fxRes] = await Promise.all([
    Promise.all(tickers.map(fetchSingleStock)),
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=brl&include_24hr_change=true', {
      signal: AbortSignal.timeout(8000),
    }).catch(() => null),
    fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,GBP-BRL', {
      signal: AbortSignal.timeout(8000),
    }).catch(() => null),
  ])

  const stocks = stockResults.filter((s): s is StockItem => s !== null)

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

  const tickers = full ? TICKERS_FULL : TICKERS_MAIN
  const data = await fetchMarket(tickers)

  if (full) cacheFull = { data, expiresAt: now + 5 * 60 * 1000 }
  else cache = { data, expiresAt: now + 5 * 60 * 1000 }

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
  })
}
