import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { format } from 'date-fns'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { imageBase64, mediaType } = (await req.json()) as {
    imageBase64: string
    mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
  }

  if (!imageBase64) return NextResponse.json({ error: 'Imagem não enviada' }, { status: 400 })

  const today = format(new Date(), 'yyyy-MM-dd')

  const response = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [
      {
        role: 'user',
        content: [
          {
            type:   'image',
            source: { type: 'base64', media_type: mediaType, data: imageBase64 },
          },
          {
            type: 'text',
            text: `Analise esta imagem de comprovante, nota fiscal, fatura ou extrato bancário e extraia as informações da transação.

Retorne APENAS um JSON válido (sem markdown, sem explicação) com este formato:
{
  "amount": <número positivo em reais>,
  "type": <"EXPENSE" ou "INCOME">,
  "description": <string curta descrevendo o estabelecimento ou origem, máx 60 chars>,
  "date": <"YYYY-MM-DD" — use ${today} se não encontrar>,
  "categoryName": <uma dessas: "Alimentação", "Transporte", "Saúde", "Lazer", "Educação", "Moradia", "Vestuário", "Tecnologia", "Serviços", "Outros">,
  "notes": <observação extra opcional, máx 80 chars, ou null>,
  "confidence": <"high", "medium" ou "low">
}

Regras:
- type = EXPENSE para compras, pagamentos, faturas; INCOME para depósitos, transferências recebidas, salários
- Se a imagem não for um comprovante financeiro, retorne: {"error": "Imagem não reconhecida como comprovante financeiro"}
- Se houver múltiplos itens (nota fiscal), some o total`,
          },
        ],
      },
    ],
  })

  const raw = response.content.find(b => b.type === 'text')?.text ?? ''

  try {
    const parsed = JSON.parse(raw.trim())
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({ error: 'Não foi possível extrair dados da imagem. Tente uma foto mais nítida.' }, { status: 422 })
  }
}
