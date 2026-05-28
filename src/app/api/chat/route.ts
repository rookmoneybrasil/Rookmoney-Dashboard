import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const client = new Anthropic()

// ─── Tool definitions ────────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'add_transaction',
    description: 'Registra uma transação financeira (receita ou despesa) na conta do usuário.',
    input_schema: {
      type: 'object' as const,
      properties: {
        amount:       { type: 'number',  description: 'Valor em reais (ex: 150.50)' },
        type:         { type: 'string',  enum: ['INCOME', 'EXPENSE'], description: 'INCOME para receita, EXPENSE para despesa' },
        description:  { type: 'string',  description: 'Descrição da transação (ex: Mercado, Salário, Uber)' },
        date:         { type: 'string',  description: 'Data no formato YYYY-MM-DD (padrão: hoje)' },
        categoryName: { type: 'string',  description: 'Nome da categoria (opcional, ex: Alimentação, Transporte)' },
      },
      required: ['amount', 'type', 'description', 'date'],
    },
  },
  {
    name: 'add_goal',
    description: 'Cria uma nova meta financeira para o usuário.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name:          { type: 'string', description: 'Nome da meta (ex: Reserva de emergência, Viagem)' },
        targetAmount:  { type: 'number', description: 'Valor alvo em reais' },
        currentAmount: { type: 'number', description: 'Valor já guardado (padrão: 0)' },
        deadline:      { type: 'string', description: 'Data limite no formato YYYY-MM-DD (opcional)' },
        description:   { type: 'string', description: 'Descrição adicional (opcional)' },
      },
      required: ['name', 'targetAmount'],
    },
  },
  {
    name: 'add_bill',
    description: 'Cadastra uma conta a pagar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name:        { type: 'string',  description: 'Nome da conta (ex: Aluguel, Netflix, Cartão)' },
        amount:      { type: 'number',  description: 'Valor em reais' },
        dueDate:     { type: 'string',  description: 'Data de vencimento no formato YYYY-MM-DD' },
        isRecurring: { type: 'boolean', description: 'Se é uma conta recorrente mensal' },
        installments:{ type: 'number',  description: 'Número de parcelas (padrão: 1)' },
        categoryName:{ type: 'string',  description: 'Categoria (opcional)' },
      },
      required: ['name', 'amount', 'dueDate'],
    },
  },
  {
    name: 'get_summary',
    description: 'Retorna o resumo financeiro atual do usuário: saldo, transações recentes, metas, contas pendentes.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'navigate',
    description: 'Sugere ao usuário navegar para uma página específica do app.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path:   { type: 'string', enum: ['/dashboard', '/transactions', '/goals', '/bills', '/budget', '/reports', '/people', '/categories', '/recurring', '/income', '/settings'] },
        reason: { type: 'string', description: 'Por que navegar para esta página' },
      },
      required: ['path', 'reason'],
    },
  },
]

// ─── Tool execution ───────────────────────────────────────────────────────────

async function executeTool(name: string, input: Record<string, unknown>, userId: string): Promise<string> {
  try {
    if (name === 'get_summary') {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

      const [income, expense, goals, bills, categories] = await Promise.all([
        db.transaction.aggregate({ where: { userId, type: 'INCOME', date: { gte: start, lte: end } }, _sum: { amount: true } }),
        db.transaction.aggregate({ where: { userId, type: 'EXPENSE', date: { gte: start, lte: end } }, _sum: { amount: true } }),
        db.goal.findMany({ where: { userId, isCompleted: false }, select: { name: true, currentAmount: true, targetAmount: true }, take: 5 }),
        db.bill.findMany({ where: { userId, isPaid: false }, select: { name: true, amount: true, dueDate: true }, take: 5, orderBy: { dueDate: 'asc' } }),
        db.category.findMany({ where: { OR: [{ isDefault: true }, { userId }] }, select: { id: true, name: true }, take: 20 }),
      ])

      const totalIncome  = Number(income._sum.amount  ?? 0)
      const totalExpense = Number(expense._sum.amount ?? 0)
      const balance      = totalIncome - totalExpense

      return JSON.stringify({
        month:        format(now, 'MMMM yyyy', { locale: ptBR }),
        totalIncome:  totalIncome.toFixed(2),
        totalExpense: totalExpense.toFixed(2),
        balance:      balance.toFixed(2),
        goals:        goals.map(g => ({ name: g.name, progress: `${Math.round((Number(g.currentAmount) / Number(g.targetAmount)) * 100)}%`, current: g.currentAmount, target: g.targetAmount })),
        pendingBills: bills.map(b => ({ name: b.name, amount: b.amount, due: format(b.dueDate, 'dd/MM', { locale: ptBR }) })),
        categories:   categories.map(c => c.name),
      })
    }

    if (name === 'add_transaction') {
      const { amount, type, description, date, categoryName } = input as {
        amount: number; type: string; description: string; date: string; categoryName?: string
      }

      // Find category (required by schema)
      let categoryId: string
      {
        const searchName = categoryName ?? (type === 'INCOME' ? 'Outros' : 'Outros')
        const cat = await db.category.findFirst({
          where: { name: { contains: searchName, mode: 'insensitive' }, OR: [{ isDefault: true }, { userId }] },
        }) ?? await db.category.findFirst({ where: { OR: [{ isDefault: true }, { userId }] }, orderBy: { isDefault: 'desc' } })
        if (!cat) return 'Erro: nenhuma categoria disponível.'
        categoryId = cat.id
      }

      await db.transaction.create({
        data: {
          amount:      Math.abs(amount),
          type:        type as 'INCOME' | 'EXPENSE',
          description: description ?? '',
          date:        parseISO(date),
          userId,
          categoryId,
        },
      })

      revalidatePath('/dashboard')
      revalidatePath('/transactions')
      return `Transação de R$ ${Math.abs(amount).toFixed(2)} (${type === 'INCOME' ? 'receita' : 'despesa'}: ${description}) registrada para ${format(parseISO(date), 'dd/MM/yyyy')}.`
    }

    if (name === 'add_goal') {
      const { name, targetAmount, currentAmount = 0, deadline, description } = input as {
        name: string; targetAmount: number; currentAmount?: number; deadline?: string; description?: string
      }

      await db.goal.create({
        data: {
          name,
          targetAmount,
          currentAmount: currentAmount ?? 0,
          deadline:      deadline ? parseISO(deadline) : null,
          description:   description ?? null,
          userId,
        },
      })

      revalidatePath('/goals')
      revalidatePath('/dashboard')
      return `Meta "${name}" criada com alvo de R$ ${targetAmount.toFixed(2)}.${deadline ? ` Prazo: ${format(parseISO(deadline), 'dd/MM/yyyy')}.` : ''}`
    }

    if (name === 'add_bill') {
      const { name, amount, dueDate, isRecurring = false, installments = 1, categoryName } = input as {
        name: string; amount: number; dueDate: string; isRecurring?: boolean; installments?: number; categoryName?: string
      }

      let categoryId: string | null = null
      if (categoryName) {
        const cat = await db.category.findFirst({
          where: { name: { contains: categoryName, mode: 'insensitive' }, OR: [{ isDefault: true }, { userId }] },
        })
        categoryId = cat?.id ?? null
      }

      await db.bill.create({
        data: {
          name,
          amount,
          dueDate:    parseISO(dueDate),
          isRecurring,
          userId,
          categoryId,
        },
      })

      revalidatePath('/bills')
      revalidatePath('/dashboard')
      return `Conta "${name}" de R$ ${amount.toFixed(2)} cadastrada com vencimento em ${format(parseISO(dueDate), 'dd/MM/yyyy')}.`
    }

    if (name === 'navigate') {
      const { path, reason } = input as { path: string; reason: string }
      return JSON.stringify({ navigate: path, reason })
    }

    return 'Ferramenta não reconhecida.'
  } catch (err) {
    console.error(`Tool ${name} error:`, err)
    return `Erro ao executar ação: ${err instanceof Error ? err.message : 'erro desconhecido'}`
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

// ─── Simple in-memory rate limiter (resets on server restart) ────────────────
const rateLimiter = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT   = 30   // messages per window
const RATE_WINDOW  = 60 * 60 * 1000  // 1 hour in ms
const MAX_HISTORY  = 10  // max messages to send to Claude (truncate older)

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimiter.get(userId)
  if (!entry || now > entry.resetAt) {
    rateLimiter.set(userId, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  // ── Pro-only check ──────────────────────────────────────────────────────────
  const user = await db.user.findUnique({ where: { id: session.userId }, select: { plan: true } })
  if (!user || user.plan !== 'PRO') {
    return NextResponse.json(
      { error: 'pro_required', message: 'O assistente Rook é exclusivo do plano Pro.' },
      { status: 403 },
    )
  }

  // ── Rate limit ──────────────────────────────────────────────────────────────
  if (!checkRateLimit(session.userId)) {
    return NextResponse.json(
      { error: 'rate_limited', message: 'Você atingiu o limite de 30 mensagens por hora. Tente mais tarde.' },
      { status: 429 },
    )
  }

  const { messages } = (await req.json()) as { messages: Anthropic.MessageParam[] }

  // ── Truncate history to last MAX_HISTORY messages ───────────────────────────
  const truncated = messages.slice(-MAX_HISTORY)
  // Ensure alternating user/assistant (Claude requirement) — drop leading assistant if any
  const safeMessages = truncated[0]?.role === 'assistant' ? truncated.slice(1) : truncated

  // Build context for system prompt
  const today = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const system = `Você é o Rook, assistente financeiro inteligente do Rook Money.
Personalidade: direto, amigável, usa emojis moderadamente, especialista em finanças pessoais.
Nome do usuário: ${session.name}.
Data de hoje: ${today}.

Você pode:
- Registrar transações (receitas e despesas)
- Criar metas financeiras
- Cadastrar contas a pagar
- Mostrar resumo financeiro atual
- Sugerir navegar para páginas do app

Instruções:
- Sempre responda em português brasileiro
- Seja conciso — máximo 3 frases nas respostas
- Antes de registrar algo, confirme os dados brevemente se não ficou claro
- Ao concluir uma ação, confirme com uma frase curta e positiva
- Se o usuário pedir para ver algo, use a tool navigate
- Datas sem especificação = hoje (${format(new Date(), 'yyyy-MM-dd')})
- Valores sem especificação = pergunte`

  // Agentic loop — max 5 iterations
  let currentMessages: Anthropic.MessageParam[] = [...safeMessages]
  let navigationSuggestion: { path: string; reason: string } | null = null

  for (let i = 0; i < 5; i++) {
    const response = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system,
      tools:      TOOLS,
      messages:   currentMessages,
    })

    if (response.stop_reason === 'end_turn') {
      const text = response.content.find(b => b.type === 'text')?.text ?? ''
      return NextResponse.json({ message: text, navigate: navigationSuggestion })
    }

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks  = response.content.filter(b => b.type === 'tool_use') as Anthropic.ToolUseBlock[]
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of toolUseBlocks) {
        const result = await executeTool(block.name, block.input as Record<string, unknown>, session.userId)

        // Check for navigation suggestion
        if (block.name === 'navigate') {
          try {
            const parsed = JSON.parse(result)
            navigationSuggestion = parsed
          } catch { /* ignore */ }
        }

        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: result })
      }

      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
        { role: 'user',      content: toolResults },
      ]
      continue
    }

    break
  }

  return NextResponse.json({ message: 'Desculpe, não consegui processar sua solicitação.', navigate: null })
}
