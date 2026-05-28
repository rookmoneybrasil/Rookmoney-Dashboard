import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'rook-dev-secret-replace-in-production'
)

export async function verifyApiToken(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null

  const token = authHeader.slice(7)
  try {
    const { payload } = await jwtVerify(token, SECRET)
    const userId = (payload as { userId?: string }).userId
    return userId ?? null
  } catch {
    return null
  }
}
