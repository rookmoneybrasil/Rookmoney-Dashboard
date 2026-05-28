import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import { db } from '@/lib/db'
import { createSession } from '@/lib/auth'

const GOOGLE_TOKEN_URL    = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'rook-dev-secret-replace-in-production'
)

interface GoogleUser {
  id:             string
  email:          string
  name:           string
  picture:        string
  verified_email: boolean
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  // Google cancelled or denied
  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_cancelled`)
  }

  // CSRF state check — compare full state (including :mobile suffix if present)
  const storedState = req.cookies.get('google_oauth_state')?.value
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/login?error=google_state`)
  }

  // Detect if this originated from the mobile app
  const isMobile = state.endsWith(':mobile')

  const clientId     = process.env.GOOGLE_CLIENT_ID     ?? ''
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? ''
  const redirectUri  = `${appUrl}/api/auth/google/callback`

  // Exchange code for tokens
  let tokenData: { access_token?: string; error?: string }
  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
      }),
    })
    tokenData = await tokenRes.json()
  } catch {
    return NextResponse.redirect(`${appUrl}/login?error=google_token`)
  }

  if (!tokenData.access_token) {
    return NextResponse.redirect(`${appUrl}/login?error=google_token`)
  }

  // Fetch user info
  let googleUser: GoogleUser
  try {
    const infoRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })
    googleUser = await infoRes.json()
  } catch {
    return NextResponse.redirect(`${appUrl}/login?error=google_userinfo`)
  }

  if (!googleUser.email || !googleUser.verified_email) {
    return NextResponse.redirect(`${appUrl}/login?error=google_email`)
  }

  // ── Find or create user ──────────────────────────────────────────────
  let user = await db.user.findUnique({ where: { googleId: googleUser.id } })

  if (!user) {
    // Check if account exists with same email (link accounts)
    user = await db.user.findUnique({ where: { email: googleUser.email } })

    if (user) {
      // Link Google to existing account
      user = await db.user.update({
        where: { id: user.id },
        data:  { googleId: googleUser.id },
      })
    } else {
      // Create new user
      user = await db.user.create({
        data: {
          name:     googleUser.name,
          email:    googleUser.email,
          googleId: googleUser.id,
          password: null, // OAuth user — no password
        },
      })
    }
  }

  // ── Redirect ──────────────────────────────────────────────────────────
  if (isMobile) {
    // Mint a JWT Bearer token for the mobile app
    const token = await new SignJWT({
      userId: user.id,
      name:   user.name,
      email:  user.email,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .setIssuedAt()
      .sign(SECRET)

    // Redirect to deep link — the mobile app handles rookmoney://auth/callback
    const params = new URLSearchParams({
      token,
      id:           user.id,
      name:         user.name,
      email:        user.email,
      plan:         user.plan,
      hasOnboarded: user.hasOnboarded ? '1' : '0',
    })

    const deepLink = `rookmoney://auth/callback?${params}`
    const res = NextResponse.redirect(deepLink)
    res.cookies.delete('google_oauth_state')
    return res
  }

  // Web flow — create session cookie and redirect
  await createSession(user.id, user.name, user.email)

  const destination = user.hasOnboarded ? '/dashboard' : '/onboarding'
  const res = NextResponse.redirect(`${appUrl}${destination}`)
  res.cookies.delete('google_oauth_state')
  return res
}
