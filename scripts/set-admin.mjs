// Script para marcar um usuário como admin
// Uso: node scripts/set-admin.mjs seu@email.com

import { PrismaClient } from '../src/generated/prisma/index.js'

const db = new PrismaClient()

async function main() {
  // Lista todos os usuários
  const users = await db.user.findMany({
    select: { id: true, name: true, email: true, isAdmin: true, plan: true },
    orderBy: { createdAt: 'asc' },
  })

  if (users.length === 0) {
    console.log('Nenhum usuário cadastrado ainda.')
    return
  }

  console.log('\n📋 Usuários no banco:')
  users.forEach((u, i) => {
    const admin = u.isAdmin ? ' 🔑 ADMIN' : ''
    const pro   = u.plan === 'PRO' ? ' 👑 PRO' : ''
    console.log(`  ${i + 1}. ${u.name} <${u.email}>${admin}${pro}`)
  })

  // Pega o email do argumento ou usa o primeiro usuário
  const targetEmail = process.argv[2] ?? users[0].email

  const updated = await db.user.update({
    where: { email: targetEmail },
    data:  { isAdmin: true },
    select: { name: true, email: true, isAdmin: true },
  })

  console.log(`\n✅ Admin ativado para: ${updated.name} <${updated.email}>`)
  console.log('Acesse: http://localhost:3000/admin\n')
}

main()
  .catch(e => { console.error('Erro:', e.message); process.exit(1) })
  .finally(() => db.$disconnect())
