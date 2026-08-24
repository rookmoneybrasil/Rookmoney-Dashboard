import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { db } from '@/lib/db'

const SECRET      = new TextEncoder().encode(process.env.JWT_SECRET ?? 'rook-dev-secret-replace-in-production')
const COOKIE_NAME = 'rook_session'

export interface Session {
  userId:        string
  name:          string
  email:         string
  /** Versão do token no momento do login — comparada com User.tokenVersion para
   *  revogar sessões antigas. Ausente em tokens emitidos por `createSession`
   *  daqui (o login real acontece na API), e nesse caso a checagem não bloqueia. */
  tokenVersion?: number
  impersonating?: boolean
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
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
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
    const session = payload as unknown as Session

    // Revogação: trocar a senha incrementa User.tokenVersion justamente para
    // derrubar sessões antigas. O withAuth da API já comparava; aqui não, então
    // um cookie roubado continuava valendo em TODA server action do web depois
    // da troca de senha — metade da promessa de "sair de todos os dispositivos".
    // O cache() do React garante uma consulta por request, não por chamada.
    const user = await db.user.findUnique({
      where:  { id: session.userId },
      select: { tokenVersion: true },
    })
    if (user && session.tokenVersion !== undefined && session.tokenVersion < user.tokenVersion) return null

    return session
  } catch {
    return null
  }
})

export async function deleteSession() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
