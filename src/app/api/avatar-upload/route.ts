import { NextRequest, NextResponse } from 'next/server'
import { put, del } from '@vercel/blob'
import { getSession } from '@/lib/auth'

const MAX_SIZE = 2 * 1024 * 1024 // client already resizes to a small square; this is just a safety cap

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ ok: false, error: 'Não autenticado.' }, { status: 401 })

  const form = await req.formData()
  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: 'Arquivo inválido.' }, { status: 400 })
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ ok: false, error: 'Envie uma imagem.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ ok: false, error: 'Imagem muito grande.' }, { status: 400 })
  }

  const blob = await put(`avatars/${session.userId}-${Date.now()}.jpg`, file, {
    access: 'public',
    contentType: 'image/jpeg',
  })

  return NextResponse.json({ ok: true, url: blob.url })
}

// Called only after a profile save actually replaces the avatar — deleting
// eagerly on upload would orphan the still-saved URL if the user never hits Salvar.
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ ok: false, error: 'Não autenticado.' }, { status: 401 })

  const url = req.nextUrl.searchParams.get('url')
  if (!url || !url.includes('.blob.vercel-storage.com')) {
    return NextResponse.json({ ok: false, error: 'URL inválida.' }, { status: 400 })
  }

  // Só o próprio dono apaga: sem isso qualquer usuário logado deletava o blob de
  // qualquer outro, bastando conhecer a URL (a checagem de host não diz nada
  // sobre quem enviou). O POST acima grava sempre como `avatars/{userId}-{ts}.jpg`.
  let pathname: string
  try {
    pathname = new URL(url).pathname.replace(/^\//, '')
  } catch {
    return NextResponse.json({ ok: false, error: 'URL inválida.' }, { status: 400 })
  }
  if (!pathname.startsWith(`avatars/${session.userId}-`)) {
    return NextResponse.json({ ok: false, error: 'Essa imagem não é sua.' }, { status: 403 })
  }

  await del(url).catch(() => {})
  return NextResponse.json({ ok: true })
}
