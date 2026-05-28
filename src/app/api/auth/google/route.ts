import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  // mobile=1 → after auth, redirect to rookmoney:// deep link instead of web dashboard
  const isMobile = searchParams.get('mobile') === '1'

  const clientId    = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

  if (!clientId) {
    return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
  }

  // CSRF state token — append ':mobile' so the callback knows where to redirect
  const csrf  = randomBytes(16).toString('hex')
  const state = isMobile ? `${csrf}:mobile` : csrf

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'openid email profile',
    state,
    access_type:   'online',
    prompt:        'select_account',
  })

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`

  const res = NextResponse.redirect(url)
  res.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 10, // 10 minutes
    path:     '/',
  })

  return res
}
