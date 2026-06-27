import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/admin-login',
  '/terms',
  '/privacy',
  '/changelog',
  '/blog',
  '/help',
]

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']
const PROTECTED_ROOT = '/dashboard'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Auth proxy ──────────────────────────────────────────────────────
  const session    = req.cookies.get('rook_session')?.value
  const isAuthPage = AUTH_PATHS.some(p => pathname.startsWith(p))
  const isPublic   = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isAdmin    = pathname.startsWith('/admin')

  if (!isPublic && !isAdmin && !session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL(PROTECTED_ROOT, req.url))
  }

  // ── Locale detection ────────────────────────────────────────────────
  const res = NextResponse.next()

  if (!req.cookies.get('NEXT_LOCALE')) {
    const lang = req.headers.get('accept-language') ?? ''
    if (lang.toLowerCase().includes('en')) {
      res.cookies.set('NEXT_LOCALE', 'en', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
    } else if (lang.toLowerCase().includes('es')) {
      res.cookies.set('NEXT_LOCALE', 'es', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|_next/webpack|favicon|api|.*\\.(?:png|jpg|jpeg|gif|svg|ico|json|txt|xml|webp|woff|woff2|ttf|eot|css|js|webmanifest)).*)',
  ],
}
