import { NextRequest, NextResponse } from 'next/server'

// Minimal middleware: auto-detect language from Accept-Language header
// and set NEXT_LOCALE cookie for first-time visitors.
// No URL rewrites — locale is fully cookie-based.
export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Only set on first visit (don't override user preference)
  if (!req.cookies.get('NEXT_LOCALE')) {
    const lang = req.headers.get('accept-language') ?? ''
    if (lang.toLowerCase().includes('en')) {
      res.cookies.set('NEXT_LOCALE', 'en', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
    } else if (lang.toLowerCase().includes('es')) {
      res.cookies.set('NEXT_LOCALE', 'es', { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
    }
    // Default (pt) — no cookie needed, fallback in request.ts
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|api|.*\\.png|.*\\.svg|.*\\.ico|.*\\.webp|.*\\.txt|.*\\.xml).*)'],
}
