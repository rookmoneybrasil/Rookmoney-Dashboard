import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET      = new TextEncoder().encode(process.env.JWT_SECRET ?? 'rook-dev-secret')
const COOKIE_NAME = 'rook_admin'
const EXPIRY_H    = 12 // horas de sessão admin

export async function createAdminSession() {
  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${EXPIRY_H}h`)
    .setIssuedAt()
    .sign(SECRET)

  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   60 * 60 * EXPIRY_H,
    path:     '/',
  })
}

export async function getAdminSession(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return false
  try {
    await jwtVerify(token, SECRET)
    return true
  } catch {
    return false
  }
}

export async function deleteAdminSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
