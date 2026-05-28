import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { cache } from 'react'

const SECRET      = new TextEncoder().encode(process.env.JWT_SECRET ?? 'rook-dev-secret-replace-in-production')
const COOKIE_NAME = 'rook_session'

export interface Session {
  userId: string
  name:   string
  email:  string
}

export async function createSession(userId: string, name: string, email: string, rememberMe = true) {
  const expiry = rememberMe ? '30d' : '1d'
  const token = await new SignJWT({ userId, name, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiry)
    .setIssuedAt()
    .sign(SECRET)

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    // Without maxAge = session cookie (expires on browser close)
    ...(rememberMe ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    path:     '/',
  })
}

export const getSession = cache(async (): Promise<Session | null> => {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as Session
  } catch {
    return null
  }
})

export async function deleteSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
