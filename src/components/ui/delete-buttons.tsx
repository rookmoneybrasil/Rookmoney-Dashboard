'use client'

import React from 'react'
import { playBillPaid } from '@/lib/sounds'

/**
 * Client-side delete buttons for each resource type.
 * These wrap ConfirmDeleteButton with clientApi calls so server pages
 * can render them by passing only the id (serializable prop).
 */

import { Trash2 } from 'lucide-react'
import { ConfirmDeleteButton } from './confirm-delete-button'
import { clientApi } from '@/lib/api-client'

const reload = () => window.location.reload()

// ─── Transactions ─────────────────────────────────────────────────────────────

export function DeleteTransactionButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteTransaction(id); reload() }}
      icon="trash" label="Excluir transação?"
    />
  )
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export function DeleteGoalButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteGoal(id); reload() }}
      icon="trash" label="Excluir meta?"
    />
  )
}

// ─── Bills ────────────────────────────────────────────────────────────────────

export function DeleteBillButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteBill(id); reload() }}
      icon="trash" label="Excluir conta?"
    />
  )
}

export function DeleteBillGroupButton({ groupId }: { groupId: string }) {
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteBillGroup(groupId); reload() }}
      label="Cancelar parcelamento? Todas as parcelas serão excluídas."
      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-danger transition-colors py-1 px-2 rounded-lg hover:bg-danger/10 mt-1"
    >
      <Trash2 className="size-3" />
      Cancelar parcelamento
    </ConfirmDeleteButton>
  )
}

export function DeleteInstallmentGroupButton({ groupId }: { groupId: string }) {
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteInstallmentGroup(groupId); reload() }}
      icon="trash" label="Excluir parcelamento?"
    />
  )
}

export function MarkBillPaidButton({ id, isPaid, showLabel }: { id: string; isPaid: boolean; showLabel?: boolean }) {
  const [loading, setLoading] = React.useState(false)
  return (
    <button
      disabled={loading}
      onClick={async () => {
        if (loading) return
        setLoading(true)
        try {
          await clientApi.markBillPaid(id, !isPaid)
          if (!isPaid) playBillPaid()
          reload()
        }
        catch  { setLoading(false); alert('Erro ao atualizar a conta. Tente novamente.') }
      }}
      className={showLabel
        ? `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isPaid ? 'text-slate-500 hover:text-slate-300 hover:bg-ink-700 border border-ink-600' : 'text-success bg-success/10 hover:bg-success/20 border border-success/30'}`
        : 'size-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-success hover:bg-success/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
      }
      title={isPaid ? 'Marcar como pendente' : 'Marcar como paga'}
    >
      <svg className={`size-3.5 ${loading ? 'animate-spin opacity-50' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        {isPaid
          ? <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          : <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
      {showLabel && <span>{loading ? '...' : isPaid ? 'Pago' : 'Pagar'}</span>}
    </button>
  )
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export function DeleteBudgetButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteBudget(id); reload() }}
      icon="trash" label="Excluir orçamento?"
    />
  )
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function DeleteCategoryButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteCategory(id); reload() }}
      icon="trash" label="Excluir categoria?"
    />
  )
}

// ─── Income Sources ───────────────────────────────────────────────────────────

export function DeleteIncomeSourceButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteIncomeSource(id); reload() }}
      icon="trash" label="Excluir renda?"
    />
  )
}

// ─── Recurring Transactions ───────────────────────────────────────────────────

export function DeleteRecurringButton({ id }: { id: string }) {
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deleteRecurring(id); reload() }}
      icon="trash" label="Excluir recorrência?"
    />
  )
}

export function ToggleRecurringButton({ id, isActive }: { id: string; isActive: boolean }) {
  return (
    <button
      onClick={async () => { await clientApi.toggleRecurring(id); reload() }}
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
  return (
    <ConfirmDeleteButton
      action={async () => { await clientApi.deletePerson(id); reload() }}
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
