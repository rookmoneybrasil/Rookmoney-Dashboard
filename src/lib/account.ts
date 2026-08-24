import { db } from '@/lib/db'

/**
 * Conta padrão para uma Transaction criada pelo web sem conta escolhida.
 *
 * ESPELHO de `resolveDefaultAccountId` em `api/src/lib/account-balances.ts` —
 * mesma ordem de preferência (padrão ativa → mais antiga ativa → qualquer uma →
 * cria a "Carteira"). Existe porque as server actions do web escrevem direto no
 * Postgres via Prisma, sem passar pela API. **Se a regra mudar lá, mude aqui.**
 *
 * Por que importa: `computeAccountBalances` só soma `Transaction` com
 * `accountId` não nulo. Uma transação criada sem conta entra no "Receitas do
 * mês" do dashboard e NÃO entra no saldo das Carteiras — dois números que
 * discordam sem erro nenhum aparecer. Era o caso do "registrar recebimento" e
 * da importação de CSV desde 19/07 (achado da auditoria de 24/08/2026).
 */
export async function resolveDefaultAccountId(userId: string): Promise<string> {
  const def = await db.account.findFirst({ where: { userId, isDefault: true, archived: false }, select: { id: true } })
  if (def) return def.id

  const active = await db.account.findFirst({ where: { userId, archived: false }, orderBy: { createdAt: 'asc' }, select: { id: true } })
  if (active) return active.id

  // Arquivada é último recurso: os totais somam só as ativas, então cair numa
  // arquivada faria o dinheiro sumir do saldo — mas é melhor que ficar nulo.
  const any = await db.account.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' }, select: { id: true } })
  if (any) return any.id

  const created = await db.account.create({
    data: { userId, name: 'Carteira', type: 'CASH', icon: '👛', color: '#22C55E', isDefault: true },
    select: { id: true },
  })
  return created.id
}
