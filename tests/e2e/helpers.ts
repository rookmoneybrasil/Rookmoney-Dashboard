import type { APIRequestContext } from '@playwright/test'

// Deleta todos os itens "[E2E]" do usuário de teste para evitar acumular lixo no banco
export async function cleanupE2EData(req: APIRequestContext) {
  const del = async (url: string) => {
    try { await req.delete(url) } catch {}
  }

  // Deleta itens cujo campo `field` começa com "[E2E]"
  const sweep = async (endpoint: string, field = 'name') => {
    try {
      const res = await req.get(endpoint)
      if (!res.ok()) return
      const json = await res.json()
      const items: Record<string, unknown>[] = Array.isArray(json.data) ? json.data : []
      const base = endpoint.split('?')[0]
      await Promise.all(
        items
          .filter(item => String(item[field] ?? '').startsWith('[E2E]'))
          .map(item => del(`${base}/${item.id}`))
      )
    } catch {}
  }

  // Transações usam resposta paginada { data: { items: [...] } }
  // Também captura auto-geradas: "Aporte — [E2E] Meta X", "Retirada — [E2E] ..."
  const sweepTransactions = async () => {
    try {
      const res = await req.get('/api/v1/transactions?pageSize=200')
      if (!res.ok()) return
      const json = await res.json()
      const items: Record<string, unknown>[] = json.data?.items ?? []
      await Promise.all(
        items
          .filter(item => String(item['description'] ?? '').includes('[E2E]'))
          .map(item => del(`/api/v1/transactions/${item.id}`))
      )
    } catch {}
  }

  await Promise.all([
    sweep('/api/v1/bills'),
    sweep('/api/v1/goals'),
    sweep('/api/v1/income-sources'),
    sweep('/api/v1/people'),
    sweep('/api/v1/recurring'),
    sweep('/api/v1/categories'),
    sweepTransactions(),
  ])
}
