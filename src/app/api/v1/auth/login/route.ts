import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'rook-dev-secret-replace-in-production'
)

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, password } = body
  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (!user) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 })
  }

  if (!user.password) {
    return NextResponse.json(
      { error: 'Esta conta usa login pelo Google.' },
      { status: 401 }
    )
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 })
  }

  const token = await new SignJWT({ userId: user.id, name: user.name, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(SECRET)

  return NextResponse.json({
    token,
    user: {
      id:          user.id,
      name:        user.name,
      email:       user.email,
      plan:        user.plan,
      hasOnboarded: user.hasOnboarded,
    },
  })
}
