import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'rook-dev-secret-replace-in-production'
)

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, email, password } = body
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios.' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Senha deve ter no mínimo 8 caracteres.' }, { status: 400 })
  }

  const existing = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } })
  if (existing) {
    return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 12)
  const user   = await db.user.create({
    data: { name, email: email.toLowerCase().trim(), password: hashed },
  })

  const token = await new SignJWT({ userId: user.id, name: user.name, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(SECRET)

  return NextResponse.json({
    token,
    user: {
      id:           user.id,
      name:         user.name,
      email:        user.email,
      plan:         user.plan,
      hasOnboarded: user.hasOnboarded,
    },
  }, { status: 201 })
}
