import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: [
    // Match all paths except static files, api routes, _next, and vercel internals
    '/((?!api|_next/static|_next/image|favicon.ico|SVG|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.ico|.*\\.webp).*)',
  ],
}
