import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.API_URL ?? 'http://localhost:3000'

export async function GET(req: NextRequest) {
  const store  = await cookies()
  const cookie = store.get('rook_session')

  const months = req.nextUrl.searchParams.get('months') ?? '6'
  const params = new URLSearchParams({ months })

  const res = await fetch(`${API}/api/v1/projection?${params.toString()}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: `rook_session=${cookie.value}` } : {}),
    },
  })

  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
