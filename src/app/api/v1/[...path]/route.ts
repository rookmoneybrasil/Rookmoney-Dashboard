import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API = process.env.API_URL ?? 'http://localhost:3000'

async function proxy(req: NextRequest, params: { path: string[] }) {
  const store  = await cookies()
  const cookie = store.get('rook_session')

  const path = params.path.join('/')
  const qs   = req.nextUrl.search ?? ''
  const url  = `${API}/api/v1/${path}${qs}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(cookie ? { Cookie: `rook_session=${cookie.value}` } : {}),
  }

  // Forward Authorization header if present (mobile / Bearer token clients)
  const auth = req.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await req.text()

  const res = await fetch(url, {
    method:  req.method,
    headers,
    body,
    cache:   'no-store',
  })

  // Forward Set-Cookie from Railway back to browser (for email/password login)
  const setCookie = res.headers.get('set-cookie')
  const resHeaders: Record<string, string> = {}
  if (setCookie) resHeaders['set-cookie'] = setCookie

  // 204 No Content — must not have a body (NextResponse.json with 204 throws in Edge Runtime)
  if (res.status === 204) {
    return new NextResponse(null, { status: 204, headers: resHeaders })
  }

  const data = await res.json().catch(() => null)
  return NextResponse.json(data, { status: res.status, headers: resHeaders })
}

export const GET    = (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) => params.then(p => proxy(req, p))
export const POST   = (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) => params.then(p => proxy(req, p))
export const PUT    = (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) => params.then(p => proxy(req, p))
export const PATCH  = (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) => params.then(p => proxy(req, p))
export const DELETE = (req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) => params.then(p => proxy(req, p))
