import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session      = request.cookies.get('rook_session')?.value

  const isAuthPage  = AUTH_PATHS.some((p) => pathname.startsWith(p))
  const isPublic    = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
  const isAdminPath = pathname.startsWith('/admin')   // tem auth própria (cookie admin)
  const isProtected = !isPublic && !isAdminPath

  // Rota protegida sem sessão → login
  if (isProtected && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Página de auth com sessão → dashboard
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL(PROTECTED_ROOT, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|_next/webpack|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|json|txt|webp|woff|woff2|ttf|eot|css|js|webmanifest)).*)',
  ],
}
