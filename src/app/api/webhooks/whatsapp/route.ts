import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendWhatsApp, downloadTwilioMedia, validateTwilioSignature } from '@/lib/twilio'
import { parseReceipt } from '@/lib/receipt-parser'
import { revalidatePath } from 'next/cache'

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

// Twilio sends webhook as application/x-www-form-urlencoded
export async function POST(req: NextRequest) {
  const body   = await req.text()
  const params = Object.fromEntries(new URLSearchParams(body))

  // ── Validate Twilio signature (production only) ───────────────────
  if (process.env.NODE_ENV === 'production') {
    const signature = req.headers.get('x-twilio-signature') ?? ''
    const host      = req.headers.get('x-forwarded-host') ?? req.headers.get('host') ?? ''
    const proto     = req.headers.get('x-forwarded-proto') ?? 'https'
    const url       = `${proto}://${host}/api/webhooks/whatsapp`
    const valid     = await validateTwilioSignature(signature, url, params)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
    }
  }

  const from       = params.From ?? ''           // whatsapp:+5511999999999
  const msgBody    = (params.Body ?? '').trim()
  const mediaUrl   = params.MediaUrl0 ?? ''
  const numMedia   = Number(params.NumMedia ?? 0)

  // Normalize phone: strip "whatsapp:" prefix
  const phone = from.replace(/^whatsapp:/, '')

  // ── Find user by WhatsApp phone ────────────────────────────────────
  const user = await db.user.findUnique({
    where:  { whatsappPhone: phone },
    select: { id: true, name: true },
  })

  if (!user) {
    // Unknown number — tell them how to link
    await sendWhatsApp(phone,
      `👋 Número não vinculado ao Rook Money.\n\nAcesse *Configurações → WhatsApp* no app para vincular este número.`
    ).catch(() => {})
    return twimlOk()
  }

  const firstName = user.name.split(' ')[0]

  // ── Text commands ──────────────────────────────────────────────────
  if (numMedia === 0) {
    const lower = msgBody.toLowerCase()

    if (lower === 'ajuda' || lower === 'help' || lower === 'oi' || lower === 'olá') {
      await sendWhatsApp(phone,
        `Olá, *${firstName}*! 👋\n\nPara registrar uma transação:\n📸 *Envie uma foto* de qualquer comprovante de pagamento, nota fiscal ou transferência.\n\nO Rook Money lê automaticamente e salva na sua conta.`
      )
      return twimlOk()
    }

    await sendWhatsApp(phone,
      `📸 Envie uma *foto do comprovante* para eu registrar automaticamente!\n\n_(Digite *ajuda* para mais informações)_`
    )
    return twimlOk()
  }

  // ── Image received — parse receipt ────────────────────────────────
  await sendWhatsApp(phone, `⏳ Lendo o comprovante...`)

  try {
    // Fetch user's categories for better category matching
    const categories = await db.category.findMany({
      where:  { OR: [{ userId: user.id }, { isDefault: true }] },
      select: { id: true, name: true, icon: true },
    })

    // Download image from Twilio CDN
    const { base64, contentType } = await downloadTwilioMedia(mediaUrl)

    // Send to Claude Vision
    const receipt = await parseReceipt(base64, contentType, categories)

    if (receipt.amount <= 0) {
      await sendWhatsApp(phone,
        `⚠️ Não consegui identificar um valor neste comprovante. Tente uma foto mais nítida.`
      )
      return twimlOk()
    }

    // Find best category
    const category = receipt.categoryId
      ? categories.find((c) => c.id === receipt.categoryId)
      : categories.find((c) => c.name.toLowerCase().includes('outros'))
        ?? categories[0]

    // Create transaction
    await db.transaction.create({
      data: {
        amount:      receipt.amount,
        type:        receipt.type,
        description: receipt.description,
        date:        new Date(receipt.date + 'T12:00:00'),
        userId:      user.id,
        categoryId:  category?.id ?? categories[0]?.id,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/transactions')

    const typeEmoji = receipt.type === 'EXPENSE' ? '💸' : '💰'
    const typeLabel = receipt.type === 'EXPENSE' ? 'Despesa'  : 'Receita'

    await sendWhatsApp(phone,
      `${typeEmoji} *${typeLabel} registrada!*\n\n` +
      `💵 Valor: *${fmt(receipt.amount)}*\n` +
      `📌 ${receipt.description}\n` +
      `🏷️ ${category?.icon ?? ''} ${category?.name ?? 'Sem categoria'}\n` +
      `📅 ${new Date(receipt.date + 'T12:00:00').toLocaleDateString('pt-BR')}\n\n` +
      `_Acesse o app para editar se necessário._`
    )
  } catch (err) {
    console.error('[WhatsApp webhook] Error:', err)
    await sendWhatsApp(phone,
      `❌ Ocorreu um erro ao processar o comprovante. Tente novamente ou registre manualmente no app.`
    ).catch(() => {})
  }

  return twimlOk()
}

// Twilio expects a 200 TwiML response (can be empty)
function twimlOk() {
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response/>', {
    status:  200,
    headers: { 'Content-Type': 'text/xml' },
  })
}
