'use client'

/**
 * Client-side delete buttons for each resource type.
 * These wrap ConfirmDeleteButton with clientApi calls so server pages
 * can render them by passing only the id (serializable prop).
 */

import { useRouter } from 'next/navigation'
import { ConfirmDeleteButton } from './confirm-delete-button'
import { clientApi } from '@/lib/api-client'

// ─── Transactions ─────────────────────────────────────────────────────────────

export function DeleteTransactionButton({ id }: { id: string }) {
  const router = useRouter()
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteTransaction(id); router.refresh() }}
      icon="trash" label="Excluir transação?"
    />
  )
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export function DeleteGoalButton({ id }: { id: string }) {
  const router = useRouter()
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteGoal(id); router.refresh() }}
      icon="trash" label="Excluir meta?"
    />
  )
}

// ─── Bills ────────────────────────────────────────────────────────────────────

export function DeleteBillButton({ id }: { id: string }) {
  const router = useRouter()
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteBill(id); router.refresh() }}
      icon="trash" label="Excluir conta?"
    />
  )
}

export function DeleteBillGroupButton({ groupId }: { groupId: string }) {
  const router = useRouter()
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteBillGroup(groupId); router.refresh() }}
      icon="trash" label="Excluir grupo de contas?"
    />
  )
}

export function DeleteInstallmentGroupButton({ groupId }: { groupId: string }) {
  const router = useRouter()
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteInstallmentGroup(groupId); router.refresh() }}
      icon="trash" label="Excluir parcelamento?"
    />
  )
}

export function MarkBillPaidButton({ id, isPaid }: { id: string; isPaid: boolean }) {
  const router = useRouter()
  return (
    <button
      onClick={async () => { await clientApi.markBillPaid(id, !isPaid); router.refresh() }}
      className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-success hover:bg-success/10 transition-colors"
      title={isPaid ? 'Marcar como pendente' : 'Marcar como paga'}
    >
      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        {isPaid
          ? <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          : <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </button>
  )
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export function DeleteBudgetButton({ id }: { id: string }) {
  const router = useRouter()
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteBudget(id); router.refresh() }}
      icon="trash" label="Excluir orçamento?"
    />
  )
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function DeleteCategoryButton({ id }: { id: string }) {
  const router = useRouter()
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteCategory(id); router.refresh() }}
      icon="trash" label="Excluir categoria?"
    />
  )
}

// ─── Income Sources ───────────────────────────────────────────────────────────

export function DeleteIncomeSourceButton({ id }: { id: string }) {
  const router = useRouter()
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteIncomeSource(id); router.refresh() }}
      icon="trash" label="Excluir renda?"
    />
  )
}

// ─── Recurring Transactions ───────────────────────────────────────────────────

export function DeleteRecurringButton({ id }: { id: string }) {
  const router = useRouter()
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteRecurring(id); router.refresh() }}
      icon="trash" label="Excluir recorrência?"
    />
  )
}

export function ToggleRecurringButton({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter()
  return (
    <button
      onClick={async () => { await clientApi.toggleRecurring(id); router.refresh() }}
      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
        isActive
          ? 'bg-success/10 text-success border border-success/20 hover:bg-success/20'
          : 'bg-ink-600 text-slate-500 border border-white/6 hover:bg-ink-500'
      }`}
      title={isActive ? 'Desativar' : 'Ativar'}
    >
      {isActive ? 'Ativa' : 'Inativa'}
    </button>
  )
}

// ─── People ───────────────────────────────────────────────────────────────────

export function DeletePersonClientButton({ id }: { id: string }) {
  const router = useRouter()
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deletePerson(id); router.refresh() }}
      icon="trash" label="Excluir pessoa e todos os lançamentos?"
      title="Excluir pessoa"
    />
  )
}

// ─── Account ──────────────────────────────────────────────────────────────────

export function DeleteAccountClientButton() {
  return (
    <button
      onClick={async () => {
        if (!confirm('Tem certeza? Esta ação é IRREVERSÍVEL. Todos os seus dados serão excluídos permanentemente.')) return
        await clientApi.deleteAccount()
        window.location.href = '/login'
      }}
      className="flex items-center gap-2 bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger font-medium px-4 py-2 rounded-xl text-sm transition-colors"
    >
      Excluir minha conta
    </button>
  )
}
